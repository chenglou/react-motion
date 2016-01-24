/* @flow */
import mapToZero from './mapToZero';
import stripStyle from './stripStyle';
import stepper from './stepper';
import mergeDiff from './mergeDiff';
import defaultNow from 'performance-now';
import defaultRaf from 'raf';
import shouldStopAnimation from './shouldStopAnimation';
import React, {PropTypes} from 'react';

import type {
  PlainStyle,
  Velocity,
  TransitionPlainStyles,
  TransitionStyles,
  TransitionVelocities,
  WillEnter,
  WillLeave,
  TransitionProps,
} from './Types';

const msPerFrame = 1000 / 60;

type TransitionMotionState = {
  currentStyles: TransitionPlainStyles,
  currentVelocities: TransitionVelocities,
  lastIdealStyles: TransitionPlainStyles,
  lastIdealVelocities: TransitionVelocities,
  mergedPropsStyles: TransitionStyles,
};

function fastClone(a) {
  // $FlowFixMe
  return {...a, style: {...a.style}};
}

function shouldStopAnimationAll(
  currentStyles: TransitionPlainStyles,
  destStyles: TransitionStyles,
  currentVelocities: TransitionVelocities,
): boolean {
  if (currentStyles.length !== destStyles.length) {
    return false;
  }

  for (let i = 0; i < currentStyles.length; i++) {
    if (currentStyles[i].key !== destStyles[i].key) {
      return false;
    }
  }

  for (let i = 0; i < currentStyles.length; i++) {
    if (!shouldStopAnimation(
        currentStyles[i].style,
        destStyles[i].style,
        currentVelocities[i].style)) {
      return false;
    }
  }

  return true;
}

// core key merging logic

// things to do: say previously merged style is {a, b}, dest style (prop) is {b,
// c}, previous current (interpolating) style is {a, b} (invariant:
// keys(current) = keys(merged)

// steps:
// turn merged style into {a?, b, c}
//    add c, value of c is destStyles.c
//    maybe remove a, aka call willLeave(a), then merged is either {b, c} or {a, b, c}
// turn current (interpolating) style from {a, b} into {a?, b, c}
//    maybe remove a
//    certainly add c, value of c is willEnter(c)
// loop over merged and construct new current
// dest doesn't change, that's owner's
function mergeAndSync(
  willEnter: WillEnter,
  willLeave: WillLeave,
  oldMergedPropsStyles: TransitionStyles,
  destStyles: TransitionStyles,
  oldCurrentStyles: TransitionPlainStyles,
  oldCurrentVelocities: TransitionVelocities,
  oldLastIdealStyles: TransitionPlainStyles,
  oldLastIdealVelocities: TransitionVelocities,
): [TransitionStyles, TransitionPlainStyles, TransitionVelocities, TransitionPlainStyles, TransitionVelocities] {
  const newMergedPropsStyles = mergeDiff(
    oldMergedPropsStyles,
    destStyles,
    (oldIndex, oldMergedPropsStyle) => {
      const leavingStyle = willLeave(oldMergedPropsStyle);
      if (leavingStyle == null) {
        return null;
      }
      if (shouldStopAnimation(
          oldCurrentStyles[oldIndex].style,
          leavingStyle,
          oldCurrentVelocities[oldIndex].style)) {
        return null;
      }
      return {...oldMergedPropsStyle, style: leavingStyle};
    },
  );

  let newCurrentStyles = [];
  let newCurrentVelocities = [];
  let newLastIdealStyles = [];
  let newLastIdealVelocities = [];
  for (let i = 0; i < newMergedPropsStyles.length; i++) {
    const newMergedPropsStyleCell = newMergedPropsStyles[i];
    let found = null;
    for (let j = 0; j < oldCurrentStyles.length; j++) {
      if (oldCurrentStyles[j].key === newMergedPropsStyleCell.key) {
        found = j;
        break;
      }
    }
    // TODO: key search code
    if (found == null) {
      const stylesCell = {
        ...newMergedPropsStyleCell,
        style: willEnter(newMergedPropsStyleCell),
      };
      newCurrentStyles[i] = stylesCell;
      newLastIdealStyles[i] = stylesCell;

      const velocity = {
        ...newMergedPropsStyleCell,
        style: mapToZero(newMergedPropsStyleCell.style),
      };
      newCurrentVelocities[i] = velocity;
      newLastIdealVelocities[i] = velocity;
    } else {
      newCurrentStyles[i] = oldCurrentStyles[found];
      newLastIdealStyles[i] = oldLastIdealStyles[found];
      newCurrentVelocities[i] = oldCurrentVelocities[found];
      newLastIdealVelocities[i] = oldLastIdealVelocities[found];
    }
  }

  return [newMergedPropsStyles, newCurrentStyles, newCurrentVelocities, newLastIdealStyles, newLastIdealVelocities];
}

const TransitionMotion = React.createClass({
  propTypes: {
    defaultStyles: PropTypes.arrayOf(PropTypes.shape({
      key: PropTypes.any.isRequired,
      style: PropTypes.objectOf(PropTypes.number).isRequired,
    })),
    styles: PropTypes.oneOfType([
      PropTypes.func,
      PropTypes.arrayOf(PropTypes.shape({
        key: PropTypes.any.isRequired,
        style: PropTypes.objectOf(PropTypes.oneOfType([
          PropTypes.number,
          PropTypes.object,
        ])).isRequired,
      }),
    )]).isRequired,
    children: PropTypes.func.isRequired,
    willLeave: PropTypes.func,
    willEnter: PropTypes.func,
  },

  getDefaultProps(): {willEnter: WillEnter, willLeave: WillLeave} {
    return {
      willEnter: TransitionStylesWrap => stripStyle(TransitionStylesWrap.style),
      willLeave: () => null,
    };
  },

  getInitialState(): TransitionMotionState {
    const {defaultStyles, styles, willEnter, willLeave} = this.props;
    const destStyles: TransitionStyles = typeof styles === 'function' ? styles() : styles;

    // this is special. for the first time around, we don't have a comparison
    // between last (no last) and current merged props. we'll compute last so:
    // say default is {a, b} and styles (dest style) is {b, c}, we'll
    // fabricate last as {a, b}
    let oldMergedPropsStyles: TransitionStyles;
    if (defaultStyles == null) {
      oldMergedPropsStyles = destStyles;
    } else {
      // $FlowFixMe
      oldMergedPropsStyles = defaultStyles.map(defaultStyleCell => {
        // TODO: key search code
        for (let i = 0; i < destStyles.length; i++) {
          if (destStyles[i].key === defaultStyleCell.key) {
            return destStyles[i];
          }
        }
        return defaultStyleCell;
      });
    }
    const oldCurrentStyles = defaultStyles == null
      ? destStyles.map(s => ({...s, style: stripStyle(s.style)}))
      : defaultStyles;
    const oldCurrentVelocities = defaultStyles == null
      ? destStyles.map(s => ({...s, style: mapToZero(s.style)}))
      : defaultStyles.map(s => ({...s, style: mapToZero(s.style)}));
    const [mergedPropsStyles, currentStyles, currentVelocities, lastIdealStyles, lastIdealVelocities] = mergeAndSync(
      // $FlowFixMe
      willEnter,
      // $FlowFixMe
      willLeave,
      oldMergedPropsStyles,
      destStyles,
      oldCurrentStyles,
      oldCurrentVelocities,
      oldCurrentStyles, // oldLastIdealStyles really
      oldCurrentVelocities, // oldLastIdealVelocities really
    );

    return {
      currentStyles: currentStyles,
      currentVelocities: currentVelocities,
      lastIdealStyles: lastIdealStyles,
      lastIdealVelocities: lastIdealVelocities,
      mergedPropsStyles: mergedPropsStyles,
    };
  },

  animationID: (null: ?number),
  prevTime: 0,
  accumulatedTime: 0,
  // it's possible that currentStyle's value is stale: if props is immediately
  // changed from 0 to 400 to spring(0) again, the async currentStyle is still
  // at 0 (didn't have time to tick and interpolate even once). If we naively
  // compare currentStyle with destVal it'll be 0 === 0 (no animation, stop).
  // In reality currentStyle should be 400
  unreadpropstyle: (null: ?TransitionStyles),
  // after checking for unreadpropstyle != null, we manually go set the
  // non-interpolating values (those that are a number, without a spring
  // config)
  clearUnreadPropStyle(unreadPropStyles: TransitionStyles): void {
    let [mergedPropsStyles, currentStyles, currentVelocities, lastIdealStyles, lastIdealVelocities] = mergeAndSync(
      // $FlowFixMe
      this.props.willEnter,
      // $FlowFixMe
      this.props.willLeave,
      this.state.mergedPropsStyles,
      unreadPropStyles,
      this.state.currentStyles,
      this.state.currentVelocities,
      this.state.lastIdealStyles,
      this.state.lastIdealVelocities,
    );

    let someDirty = false;
    for (let i = 0; i < unreadPropStyles.length; i++) {
      const unreadPropStyle = unreadPropStyles[i].style;
      let dirty = false;

      for (let key in unreadPropStyle) {
        if (!unreadPropStyle.hasOwnProperty(key)) {
          continue;
        }

        const styleValue = unreadPropStyle[key];
        if (typeof styleValue === 'number') {
          if (!dirty) {
            dirty = true;
            someDirty = true;
            currentStyles[i] = fastClone(currentStyles[i]);
            mergedPropsStyles[i] = fastClone(mergedPropsStyles[i]);
            currentVelocities[i] = fastClone(currentVelocities[i]);
            lastIdealStyles[i] = fastClone(lastIdealStyles[i]);
            lastIdealVelocities[i] = fastClone(lastIdealVelocities[i]);
          }
          currentStyles[i].style[key] = styleValue;
          mergedPropsStyles[i].style[key] = styleValue;
          currentVelocities[i].style[key] = 0;
          lastIdealStyles[i].style[key] = styleValue;
          lastIdealVelocities[i].style[key] = 0;
        }
      }
    }

    if (someDirty) {
      this.setState({
        currentStyles,
        currentVelocities,
        mergedPropsStyles,
        lastIdealStyles,
        lastIdealVelocities,
      });
    }
  },

  startAnimationIfNecessary(): void {
    // TODO: when config is {a: 10} and dest is {a: 10} do we raf once and
    // call cb? No, otherwise accidental parent rerender causes cb trigger
    this.animationID = defaultRaf(() => {
      const propStyles = this.props.styles;
      let destStyles: TransitionStyles = typeof propStyles === 'function'
        ? propStyles(this.state.lastIdealStyles)
        : propStyles;

      // check if we need to animate in the first place
      if (shouldStopAnimationAll(
        this.state.currentStyles,
        destStyles,
        this.state.currentVelocities,
      )) {
        // no need to cancel animationID here; shouldn't have any in flight
        this.animationID = null;
        this.accumulatedTime = 0;
        return;
      }

      const currentTime = defaultNow();
      const timeDelta = currentTime - this.prevTime;
      this.prevTime = currentTime;
      this.accumulatedTime = this.accumulatedTime + timeDelta;
      // more than 10 frames? prolly switched browser tab. Restart
      if (this.accumulatedTime > msPerFrame * 10) {
        this.accumulatedTime = 0;
      }

      if (this.accumulatedTime === 0) {
        // no need to cancel animationID here; shouldn't have any in flight
        this.animationID = null;
        this.startAnimationIfNecessary();
        return;
      }

      let currentFrameCompletion =
        (this.accumulatedTime - Math.floor(this.accumulatedTime / msPerFrame) * msPerFrame) / msPerFrame;
      const framesToCatchUp = Math.floor(this.accumulatedTime / msPerFrame);

      let [newMergedPropsStyles, newCurrentStyles, newCurrentVelocities, newLastIdealStyles, newLastIdealVelocities] = mergeAndSync(
        // $FlowFixMe
        this.props.willEnter,
        // $FlowFixMe
        this.props.willLeave,
        this.state.mergedPropsStyles,
        destStyles,
        this.state.currentStyles,
        this.state.currentVelocities,
        this.state.lastIdealStyles,
        this.state.lastIdealVelocities,
      );
      for (let i = 0; i < newMergedPropsStyles.length; i++) {
        const newMergedPropsStyle = newMergedPropsStyles[i].style;
        let newCurrentStyle: PlainStyle = {};
        let newCurrentVelocity: Velocity = {};
        let newLastIdealStyle: PlainStyle = {};
        let newLastIdealVelocity: Velocity = {};

        for (let key in newMergedPropsStyle) {
          if (!newMergedPropsStyle.hasOwnProperty(key)) {
            continue;
          }

          const styleValue = newMergedPropsStyle[key];
          if (typeof styleValue === 'number') {
            newCurrentStyle[key] = styleValue;
            newCurrentVelocity[key] = 0;
            newLastIdealStyle[key] = styleValue;
            newLastIdealVelocity[key] = 0;
          } else {
            let newLastIdealStyleValue = newLastIdealStyles[i].style[key];
            let newLastIdealVelocityValue = newLastIdealVelocities[i].style[key];
            for (let j = 0; j < framesToCatchUp; j++) {
              [newLastIdealStyleValue, newLastIdealVelocityValue] = stepper(
                msPerFrame / 1000,
                newLastIdealStyleValue,
                newLastIdealVelocityValue,
                styleValue.val,
                styleValue.stiffness,
                styleValue.damping,
                styleValue.precision,
              );
            }
            const [nextIdealX, nextIdealV] = stepper(
              msPerFrame / 1000,
              newLastIdealStyleValue,
              newLastIdealVelocityValue,
              styleValue.val,
              styleValue.stiffness,
              styleValue.damping,
              styleValue.precision,
            );

            newCurrentStyle[key] =
              newLastIdealStyleValue +
              (nextIdealX - newLastIdealStyleValue) * currentFrameCompletion;
            newCurrentVelocity[key] =
              newLastIdealVelocityValue +
              (nextIdealV - newLastIdealVelocityValue) * currentFrameCompletion;
            newLastIdealStyle[key] = newLastIdealStyleValue;
            newLastIdealVelocity[key] = newLastIdealVelocityValue;
          }
        }

        newLastIdealStyles[i] = {...newLastIdealStyles[i], style: newLastIdealStyle};
        newLastIdealVelocities[i] = {...newLastIdealVelocities[i], style: newLastIdealVelocity};
        newCurrentStyles[i] = {...newCurrentStyles[i], style: newCurrentStyle};
        newCurrentVelocities[i] = {...newCurrentVelocities[i], style: newCurrentVelocity};
      }

      this.animationID = null;
      // the amount we're looped over above
      this.accumulatedTime -= framesToCatchUp * msPerFrame;

      this.setState({
        currentStyles: newCurrentStyles,
        currentVelocities: newCurrentVelocities,
        lastIdealStyles: newLastIdealStyles,
        lastIdealVelocities: newLastIdealVelocities,
        mergedPropsStyles: newMergedPropsStyles,
      });

      this.unreadpropstyle = null;

      this.startAnimationIfNecessary();
    });
  },

  componentDidMount() {
    this.prevTime = defaultNow();
    this.startAnimationIfNecessary();
  },

  componentWillReceiveProps(props: TransitionProps) {
    if (this.unreadpropstyle) {
      // previous props haven't had the chance to be set yet; set them here
      this.clearUnreadPropStyle(this.unreadpropstyle);
    }

    this.unreadpropstyle = typeof props.styles === 'function'
      ? props.styles(this.state.lastIdealStyles)
      : props.styles;

    if (this.animationID == null) {
      this.prevTime = defaultNow();
      this.startAnimationIfNecessary();
    }
  },

  componentWillUnmount() {
    if (this.animationID != null) {
      defaultRaf.cancel(this.animationID);
      this.animationID = null;
    }
  },

  render(): ReactElement {
    const propsStyles = typeof this.props.styles === 'function'
      ? this.props.styles(this.state.lastIdealStyles)
      : this.props.styles;

    const freshCurrentStyles = this.state.mergedPropsStyles.map((mergedPropsStyle, i) => {
      for (let j = 0; j < propsStyles.length; j++) {
        if (propsStyles[j].key === mergedPropsStyle.key) {
          return {...propsStyles[j], style: this.state.currentStyles[i].style};
        }
      }
      return {...mergedPropsStyle, style: this.state.currentStyles[i].style};
    });

    const renderedChildren = this.props.children(freshCurrentStyles);
    return renderedChildren && React.Children.only(renderedChildren);
  },
});

export default TransitionMotion;
