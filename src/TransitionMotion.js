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
  ReactElement,
  PlainStyle,
  Velocity,
  TransitionStyle,
  TransitionPlainStyle,
  WillEnter,
  WillLeave,
  TransitionProps,
} from './Types';

const msPerFrame = 1000 / 60;

// the children function & (potential) styles function asks as param an
// Array<TransitionPlainStyle>, where each TransitionPlainStyle is of the format
// {key: string, data?: any, style: PlainStyle}. However, the way we keep
// internal states doesn't contain such a data structure (check the state and
// TransitionMotionState). So when children function and others ask for such
// data we need to generate them on the fly by combining mergedPropsStyles and
// currentStyles/lastIdealStyles
function rehydrateStyles(
  mergedPropsStyles: Array<TransitionStyle>,
  unreadPropStyles: ?Array<TransitionStyle>,
  plainStyles: Array<PlainStyle>,
): Array<TransitionPlainStyle> {
  // Copy the value to a `const` so that Flow understands that the const won't
  // change and will be non-nullable in the callback below.
  const cUnreadPropStyles = unreadPropStyles;
  if (cUnreadPropStyles == null) {
    return mergedPropsStyles.map((mergedPropsStyle, i) => ({
      key: mergedPropsStyle.key,
      data: mergedPropsStyle.data,
      style: plainStyles[i],
    }));
  }
  return mergedPropsStyles.map((mergedPropsStyle, i) => {
    for (let j = 0; j < cUnreadPropStyles.length; j++) {
      if (cUnreadPropStyles[j].key === mergedPropsStyle.key) {
        return {
          key: cUnreadPropStyles[j].key,
          data: cUnreadPropStyles[j].data,
          style: plainStyles[i],
        };
      }
    }
    return {key: mergedPropsStyle.key, data: mergedPropsStyle.data, style: plainStyles[i]};
  });
}

function shouldStopAnimationAll(
  currentStyles: Array<PlainStyle>,
  destStyles: Array<TransitionStyle>,
  currentVelocities: Array<Velocity>,
  mergedPropsStyles: Array<TransitionStyle>,
): boolean {
  if (mergedPropsStyles.length !== destStyles.length) {
    return false;
  }

  for (let i = 0; i < mergedPropsStyles.length; i++) {
    if (mergedPropsStyles[i].key !== destStyles[i].key) {
      return false;
    }
  }

  // we have the invariant that mergedPropsStyles and
  // currentStyles/currentVelocities/last* are synced in terms of cells, see
  // mergeAndSync comment for more info
  for (let i = 0; i < mergedPropsStyles.length; i++) {
    if (!shouldStopAnimation(
        currentStyles[i],
        destStyles[i].style,
        currentVelocities[i])) {
      return false;
    }
  }

  return true;
}

// core key merging logic

// things to do: say previously merged style is {a, b}, dest style (prop) is {b,
// c}, previous current (interpolating) style is {a, b}
// **invariant**: current[i] corresponds to merged[i] in terms of key

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
  oldMergedPropsStyles: Array<TransitionStyle>,
  destStyles: Array<TransitionStyle>,
  oldCurrentStyles: Array<PlainStyle>,
  oldCurrentVelocities: Array<Velocity>,
  oldLastIdealStyles: Array<PlainStyle>,
  oldLastIdealVelocities: Array<Velocity>,
): [Array<TransitionStyle>, Array<PlainStyle>, Array<Velocity>, Array<PlainStyle>, Array<Velocity>] {
  const newMergedPropsStyles = mergeDiff(
    oldMergedPropsStyles,
    destStyles,
    (oldIndex, oldMergedPropsStyle) => {
      const leavingStyle = willLeave(oldMergedPropsStyle);
      if (leavingStyle == null) {
        return null;
      }
      if (shouldStopAnimation(
          oldCurrentStyles[oldIndex],
          leavingStyle,
          oldCurrentVelocities[oldIndex])) {
        return null;
      }
      return {key: oldMergedPropsStyle.key, data: oldMergedPropsStyle.data, style: leavingStyle};
    },
  );

  let newCurrentStyles = [];
  let newCurrentVelocities = [];
  let newLastIdealStyles = [];
  let newLastIdealVelocities = [];
  for (let i = 0; i < newMergedPropsStyles.length; i++) {
    const newMergedPropsStyleCell = newMergedPropsStyles[i];
    let foundOldIndex = null;
    for (let j = 0; j < oldMergedPropsStyles.length; j++) {
      if (oldMergedPropsStyles[j].key === newMergedPropsStyleCell.key) {
        foundOldIndex = j;
        break;
      }
    }
    // TODO: key search code
    if (foundOldIndex == null) {
      const plainStyle = willEnter(newMergedPropsStyleCell);
      newCurrentStyles[i] = plainStyle;
      newLastIdealStyles[i] = plainStyle;

      const velocity = mapToZero(newMergedPropsStyleCell.style);
      newCurrentVelocities[i] = velocity;
      newLastIdealVelocities[i] = velocity;
    } else {
      newCurrentStyles[i] = oldCurrentStyles[foundOldIndex];
      newLastIdealStyles[i] = oldLastIdealStyles[foundOldIndex];
      newCurrentVelocities[i] = oldCurrentVelocities[foundOldIndex];
      newLastIdealVelocities[i] = oldLastIdealVelocities[foundOldIndex];
    }
  }

  return [newMergedPropsStyles, newCurrentStyles, newCurrentVelocities, newLastIdealStyles, newLastIdealVelocities];
}

type TransitionMotionState = {
  // list of styles, each containing interpolating values. Part of what's passed
  // to children function. Notice that this is
  // Array<ActualInterpolatingStyleObject>, without the wrapper that is {key: ...,
  // data: ... style: ActualInterpolatingStyleObject}. Only mergedPropsStyles
  // contains the key & data info (so that we only have a single source of truth
  // for these, and to save space). Check the comment for `rehydrateStyles` to
  // see how we regenerate the entirety of what's passed to children function
  currentStyles: Array<PlainStyle>,
  currentVelocities: Array<Velocity>,
  lastIdealStyles: Array<PlainStyle>,
  lastIdealVelocities: Array<Velocity>,
  // the array that keeps track of currently rendered stuff! Including stuff
  // that you've unmounted but that's still animating. This is where it lives
  mergedPropsStyles: Array<TransitionStyle>,
};

const TransitionMotion = React.createClass({
  propTypes: {
    defaultStyles: PropTypes.arrayOf(PropTypes.shape({
      key: PropTypes.string.isRequired,
      data: PropTypes.any,
      style: PropTypes.objectOf(PropTypes.number).isRequired,
    })),
    styles: PropTypes.oneOfType([
      PropTypes.func,
      PropTypes.arrayOf(PropTypes.shape({
        key: PropTypes.string.isRequired,
        data: PropTypes.any,
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
      willEnter: styleThatEntered => stripStyle(styleThatEntered.style),
      // recall: returning null makes the current unmounting TransitionStyle
      // disappear immediately
      willLeave: () => null,
    };
  },

  getInitialState(): TransitionMotionState {
    const {defaultStyles, styles, willEnter, willLeave} = this.props;
    const destStyles: Array<TransitionStyle> = typeof styles === 'function' ? styles(defaultStyles) : styles;

    // this is special. for the first time around, we don't have a comparison
    // between last (no last) and current merged props. we'll compute last so:
    // say default is {a, b} and styles (dest style) is {b, c}, we'll
    // fabricate last as {a, b}
    let oldMergedPropsStyles: Array<TransitionStyle>;
    if (defaultStyles == null) {
      oldMergedPropsStyles = destStyles;
    } else {
      oldMergedPropsStyles = (defaultStyles: any).map(defaultStyleCell => {
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
      ? destStyles.map(s => stripStyle(s.style))
      : (defaultStyles: any).map(s => stripStyle(s.style));
    const oldCurrentVelocities = defaultStyles == null
      ? destStyles.map(s => mapToZero(s.style))
      : defaultStyles.map(s => mapToZero(s.style));
    const [mergedPropsStyles, currentStyles, currentVelocities, lastIdealStyles, lastIdealVelocities] = mergeAndSync(
      // Because this is an old-style React.createClass component, Flow doesn't
      // understand that the willEnter and willLeave props have default values
      // and will always be present.
      (willEnter: any),
      (willLeave: any),
      oldMergedPropsStyles,
      destStyles,
      oldCurrentStyles,
      oldCurrentVelocities,
      oldCurrentStyles, // oldLastIdealStyles really
      oldCurrentVelocities, // oldLastIdealVelocities really
    );

    return {
      currentStyles,
      currentVelocities,
      lastIdealStyles,
      lastIdealVelocities,
      mergedPropsStyles,
    };
  },

  unmounting: (false: boolean),
  animationID: (null: ?number),
  prevTime: 0,
  accumulatedTime: 0,
  // it's possible that currentStyle's value is stale: if props is immediately
  // changed from 0 to 400 to spring(0) again, the async currentStyle is still
  // at 0 (didn't have time to tick and interpolate even once). If we naively
  // compare currentStyle with destVal it'll be 0 === 0 (no animation, stop).
  // In reality currentStyle should be 400
  unreadPropStyles: (null: ?Array<TransitionStyle>),
  // after checking for unreadPropStyles != null, we manually go set the
  // non-interpolating values (those that are a number, without a spring
  // config)
  clearUnreadPropStyle(unreadPropStyles: Array<TransitionStyle>): void {
    let [mergedPropsStyles, currentStyles, currentVelocities, lastIdealStyles, lastIdealVelocities] = mergeAndSync(
      (this.props.willEnter: any),
      (this.props.willLeave: any),
      this.state.mergedPropsStyles,
      unreadPropStyles,
      this.state.currentStyles,
      this.state.currentVelocities,
      this.state.lastIdealStyles,
      this.state.lastIdealVelocities,
    );

    for (let i = 0; i < unreadPropStyles.length; i++) {
      const unreadPropStyle = unreadPropStyles[i].style;
      let dirty = false;

      for (let key in unreadPropStyle) {
        if (!Object.prototype.hasOwnProperty.call(unreadPropStyle, key)) {
          continue;
        }

        const styleValue = unreadPropStyle[key];
        if (typeof styleValue === 'number') {
          if (!dirty) {
            dirty = true;
            currentStyles[i] = {...currentStyles[i]};
            currentVelocities[i] = {...currentVelocities[i]};
            lastIdealStyles[i] = {...lastIdealStyles[i]};
            lastIdealVelocities[i] = {...lastIdealVelocities[i]};
            mergedPropsStyles[i] = {
              key: mergedPropsStyles[i].key,
              data: mergedPropsStyles[i].data,
              style: {...mergedPropsStyles[i].style},
            };
          }
          currentStyles[i][key] = styleValue;
          currentVelocities[i][key] = 0;
          lastIdealStyles[i][key] = styleValue;
          lastIdealVelocities[i][key] = 0;
          mergedPropsStyles[i].style[key] = styleValue;
        }
      }
    }

    // unlike the other 2 components, we can't detect staleness and optionally
    // opt out of setState here. each style object's data might contain new
    // stuff we're not/cannot compare
    this.setState({
      currentStyles,
      currentVelocities,
      mergedPropsStyles,
      lastIdealStyles,
      lastIdealVelocities,
    });
  },

  startAnimationIfNecessary(): void {
    if (this.unmounting) {
      return;
    }
    // TODO: when config is {a: 10} and dest is {a: 10} do we raf once and
    // call cb? No, otherwise accidental parent rerender causes cb trigger
    this.animationID = defaultRaf((timestamp) => {
      const propStyles = this.props.styles;
      let destStyles: Array<TransitionStyle> = typeof propStyles === 'function'
        ? propStyles(rehydrateStyles(
          this.state.mergedPropsStyles,
          this.unreadPropStyles,
          this.state.lastIdealStyles,
        ))
        : propStyles;

      // check if we need to animate in the first place
      if (shouldStopAnimationAll(
        this.state.currentStyles,
        destStyles,
        this.state.currentVelocities,
        this.state.mergedPropsStyles,
      )) {
        // no need to cancel animationID here; shouldn't have any in flight
        this.animationID = null;
        this.accumulatedTime = 0;
        return;
      }

      const currentTime = timestamp || defaultNow();
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
        (this.props.willEnter: any),
        (this.props.willLeave: any),
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
          if (!Object.prototype.hasOwnProperty.call(newMergedPropsStyle, key)) {
            continue;
          }

          const styleValue = newMergedPropsStyle[key];
          if (typeof styleValue === 'number') {
            newCurrentStyle[key] = styleValue;
            newCurrentVelocity[key] = 0;
            newLastIdealStyle[key] = styleValue;
            newLastIdealVelocity[key] = 0;
          } else {
            let newLastIdealStyleValue = newLastIdealStyles[i][key];
            let newLastIdealVelocityValue = newLastIdealVelocities[i][key];
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

        newLastIdealStyles[i] = newLastIdealStyle;
        newLastIdealVelocities[i] = newLastIdealVelocity;
        newCurrentStyles[i] = newCurrentStyle;
        newCurrentVelocities[i] = newCurrentVelocity;
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

      this.unreadPropStyles = null;

      this.startAnimationIfNecessary();
    });
  },

  componentDidMount() {
    this.prevTime = defaultNow();
    this.startAnimationIfNecessary();
  },

  componentWillReceiveProps(props: TransitionProps) {
    if (this.unreadPropStyles) {
      // previous props haven't had the chance to be set yet; set them here
      this.clearUnreadPropStyle(this.unreadPropStyles);
    }

    const styles = props.styles;
    if (typeof styles === 'function') {
      this.unreadPropStyles = styles(
        rehydrateStyles(
          this.state.mergedPropsStyles,
          this.unreadPropStyles,
          this.state.lastIdealStyles,
        )
      );
    } else {
      this.unreadPropStyles = styles;
    }

    if (this.animationID == null) {
      this.prevTime = defaultNow();
      this.startAnimationIfNecessary();
    }
  },

  componentWillUnmount() {
    this.unmounting = true;
    if (this.animationID != null) {
      defaultRaf.cancel(this.animationID);
      this.animationID = null;
    }
  },

  render(): ReactElement {
    const hydratedStyles = rehydrateStyles(
      this.state.mergedPropsStyles,
      this.unreadPropStyles,
      this.state.currentStyles,
    );
    const renderedChildren = this.props.children(hydratedStyles);
    return renderedChildren && React.Children.only(renderedChildren);
  },
});

export default TransitionMotion;
