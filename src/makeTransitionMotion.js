/* @flow */
import zero from './zero';
import stripStyle from './stripStyle';
import stepper from './stepper';
import mergeDiff from './mergeDiff';
import defaultNow from 'performance-now';
import defaultRaf from 'raf';

import type {PlainStyle, Style, Velocity, TransitionPlainStyles, TransitionStyles, TransitionVelocities, WillEnter, WillLeave} from './Types';
const msPerFrame = 1000 / 60;

type TransitionMotionState = {
  currentStyles: TransitionPlainStyles,
  currentVelocities: TransitionVelocities,
  lastIdealStyles: TransitionPlainStyles,
  lastIdealVelocities: TransitionVelocities,
  mergedPropsStyles: TransitionStyles,
};

function mapObject<A, B>(f: (val: A, key: string) => B, obj: {[key: string]: A}): {[key: string]: B} {
  let ret = {};
  for (const key in obj) {
    if (!obj.hasOwnProperty(key)) {
      continue;
    }
    ret[key] = f(obj[key], key);
  }
  return ret;
}

function forEachObject<A>(f: (val: A, key: string) => void, obj: {[key: string]: A}): void {
  for (const key in obj) {
    if (!obj.hasOwnProperty(key)) {
      continue;
    }
    f(obj[key], key);
  }
}

// usage assumption: currentStyle values have already been rendered but it says
// nothing of whether currentStyle is stale (see unreadpropstyle)
function shouldStopAnimationEach(currentStyle: PlainStyle, destStyle: Style, currentVelocity: Velocity): boolean {
  for (let key in destStyle) {
    if (!destStyle.hasOwnProperty(key)) {
      continue;
    }
    const destVal = typeof destStyle[key] === 'number'
      ? destStyle[key]
      : destStyle[key].val;

    // stepper will have already taken care of rounding precision errors, so
    // won't have such thing as 0.9999 !=== 1
    if (currentStyle[key] !== destVal) {
      return false;
    }
    if (currentVelocity[key] !== 0) {
      return false;
    }
  }

  return true;
}

function shouldStopAnimation(
  currentStyles: TransitionPlainStyles,
  destStyles: TransitionStyles,
  currentVelocities: TransitionVelocities,
): boolean {
  for (let key in currentStyles) {
    if (!currentStyles.hasOwnProperty(key)) {
      continue;
    }
    // if an old key still exists
    if (!destStyles.hasOwnProperty(key)) {
      return false;
    }
  }

  for (let key in destStyles) {
    if (!destStyles.hasOwnProperty(key)) {
      continue;
    }
    // if it's a newly inserted key
    if (!currentStyles.hasOwnProperty(key)) {
      return false;
    }
    if (!shouldStopAnimationEach(currentStyles[key], destStyles[key], currentVelocities[key])) {
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
// TODO: optimize
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
    id => {
      // keyThatJustLeft, correspondingStyleOfKey, styles, currentInterpolatedStyle, currentSpeed
      const leavingStyle = willLeave(
        id,
        oldMergedPropsStyles[id],
        destStyles,
        oldCurrentStyles,
        oldCurrentVelocities,
      );
      if (leavingStyle == null) {
        return null;
      }
      if (shouldStopAnimationEach(oldCurrentStyles[id], leavingStyle, oldCurrentVelocities[id])) {
        return null;
      }
      return leavingStyle;
    },
  );

  const newCurrentStyles = mapObject((newMergedPropsStyle, id) => {
    if (oldCurrentStyles.hasOwnProperty(id)) {
      return oldCurrentStyles[id];
    }
    // TODO: willEnter now expects no spring() wrapper. Check HISTORY.md.
    // provide warning soon
    return willEnter(
      id,
      destStyles[id],
      newMergedPropsStyles,
      // TODO: new or old?
      oldCurrentStyles,
      oldCurrentVelocities,
    );
  }, newMergedPropsStyles);

  const newCurrentVelocities = mapObject((newMergedPropsStyle, id) => {
    return oldCurrentVelocities.hasOwnProperty(id)
      ? oldCurrentVelocities[id]
      : mapObject(zero, newMergedPropsStyle);
  }, newMergedPropsStyles);

  const newLastIdealStyles = {...newCurrentStyles, ...oldLastIdealStyles};
  const newLastIdealVelocities = {...newCurrentVelocities, ...oldLastIdealVelocities};

  return [newMergedPropsStyles, newCurrentStyles, newCurrentVelocities, newLastIdealStyles, newLastIdealVelocities];
}

export default function makeTransitionMotion(React: Object): Object {
  const {PropTypes} = React;

  const TransitionMotion = React.createClass({
    propTypes: {
      // TOOD: warn against putting a config in here
      defaultStyles: PropTypes.objectOf(PropTypes.object),
      styles: PropTypes.oneOfType([PropTypes.func, PropTypes.object]).isRequired,
      children: PropTypes.func.isRequired,
      willLeave: PropTypes.func,
      willEnter: PropTypes.func,
    },

    getDefaultProps(): {willEnter: WillEnter, willLeave: WillLeave} {
      return {
        willEnter: (key, value) => stripStyle(value),
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
      let oldMergedPropsStyles;
      if (defaultStyles == null) {
        oldMergedPropsStyles = destStyles;
      } else {
        oldMergedPropsStyles = mapObject((defaultStyle, id) => {
          if (destStyles.hasOwnProperty(id)) {
            return destStyles[id];
          }
          return defaultStyle;
        }, defaultStyles);
      }
      // TODO: optimize
      const [mergedPropsStyles, currentStyles, currentVelocities, lastIdealStyles, lastIdealVelocities] = mergeAndSync(
        // $FlowFixMe
        willEnter,
        // $FlowFixMe
        willLeave,
        oldMergedPropsStyles,
        destStyles,
        defaultStyles == null ? mapObject(stripStyle, destStyles) : defaultStyles, // oldCurrentStyles really
        defaultStyles == null ? mapObject(a => mapObject(zero, a), destStyles) : mapObject(a => mapObject(zero, a), defaultStyles), // oldCurrentVelocities really
        defaultStyles == null ? mapObject(stripStyle, destStyles) : defaultStyles, // oldLastIdealStyles really
        defaultStyles == null ? mapObject(a => mapObject(zero, a), destStyles) : mapObject(a => mapObject(zero, a), defaultStyles), // oldLastIdealVelocities really
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
    clearUnreadPropStyle(unreadPropStyle: TransitionStyles): void {
      let [newMergedPropsStyles, newCurrentStyles, newCurrentVelocities, newLastIdealStyles, newLastIdealVelocities] = mergeAndSync(
        // $FlowFixMe
        this.props.willEnter,
        // $FlowFixMe
        this.props.willLeave,
        this.state.mergedPropsStyles,
        unreadPropStyle,
        this.state.currentStyles,
        this.state.currentVelocities,
        this.state.lastIdealStyles,
        this.state.lastIdealVelocities,
      );

      forEachObject((destStyle, id) => {
        // TODO: optimize
        newCurrentStyles[id] = {...newCurrentStyles[id]};
        newMergedPropsStyles[id] = {...newMergedPropsStyles[id]};
        newCurrentVelocities[id] = {...newCurrentVelocities[id]};
        newLastIdealStyles[id] = {...newLastIdealStyles[id]};
        newLastIdealVelocities[id] = {...newLastIdealVelocities[id]};

        for (let key in destStyle) {
          if (!destStyle.hasOwnProperty(key)) {
            continue;
          }

          const styleValue = destStyle[key];
          if (typeof styleValue === 'number') {
            newCurrentStyles[id][key] = styleValue;
            newMergedPropsStyles[id][key] = styleValue;
            newCurrentVelocities[id][key] = 0;
            newLastIdealStyles[id][key] = styleValue;
            newLastIdealVelocities[id][key] = 0;
          }
        }
      }, unreadPropStyle);

      this.setState({
        currentStyles: newCurrentStyles,
        currentVelocities: newCurrentVelocities,
        mergedPropsStyles: newMergedPropsStyles,
        lastIdealStyles: newLastIdealStyles,
        lastIdealVelocities: newLastIdealVelocities,
      });
    },

    startAnimationIfNecessary(): void {
      // console.log('started');
      // TODO: remove
      if (this.animationID != null) {
        throw new Error('Testing. Something wrong. animationID not null.');
      }
      // TODO: when config is {a: 10} and dest is {a: 10} do we raf once and
      // call cb? No, otherwise accidental parent rerender causes cb trigger

      this.animationID = defaultRaf(() => {
        // console.log('one raf called');
        const propStyles = this.props.styles;
        let destStyles: TransitionStyles = typeof propStyles === 'function'
          ? propStyles(this.state.lastIdealStyles)
          : propStyles;

        // check if we need to animate in the first place
        if (shouldStopAnimation(
          this.state.currentStyles,
          destStyles,
          this.state.currentVelocities,
        )) {
          // TODO: no need to cancel animationID here; shouldn't have any in
          // flight?
          this.animationID = null;
          this.accumulatedTime = 0;
          return;
        }
        // console.log('dont stop, continue');

        const currentTime = defaultNow();
        const timeDelta = currentTime - this.prevTime;
        this.prevTime = currentTime;
        this.accumulatedTime = this.accumulatedTime + timeDelta;
        // more than 10 frames? prolly switched browser tab. Restart
        if (this.accumulatedTime > msPerFrame * 10) {
          this.accumulatedTime = 0;
        }

        if (this.accumulatedTime === 0) {
          // console.log('bail, accumulatedTime = 0');
          // assume no concurrent rAF here
          this.animationID = null;
          this.startAnimationIfNecessary();
          return;
        }

        let currentFrameCompletion =
          (this.accumulatedTime - Math.floor(this.accumulatedTime / msPerFrame) * msPerFrame) / msPerFrame;
        const framesToCatchUp = Math.floor(this.accumulatedTime / msPerFrame);

        // console.log(currentFrameCompletion, this.accumulatedTime, framesToCatchUp, '-------------111');

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
        forEachObject((destStyle, id) => {
          // TODO: no need to alloc so much. Optimize
          newCurrentStyles[id] = {...newCurrentStyles[id]};
          newMergedPropsStyles[id] = {...newMergedPropsStyles[id]};
          newCurrentVelocities[id] = {...newCurrentVelocities[id]};
          newLastIdealStyles[id] = {...newLastIdealStyles[id]};
          newLastIdealVelocities[id] = {...newLastIdealVelocities[id]};

          let newCurrentStyle = newCurrentStyles[id];
          let newCurrentVelocity = newCurrentVelocities[id];
          let newLastIdealStyle = newLastIdealStyles[id];
          let newLastIdealVelocity = newLastIdealVelocities[id];

          for (let key in destStyle) {
            if (!destStyle.hasOwnProperty(key)) {
              continue;
            }

            const styleValue = destStyle[key];
            if (typeof styleValue === 'number') {
              newCurrentStyle[key] = styleValue;
              newCurrentVelocity[key] = 0;
              newLastIdealStyle[key] = styleValue;
              newLastIdealVelocity[key] = 0;
            } else {
              for (let j = 0; j < framesToCatchUp; j++) {
                const interpolated = stepper(
                  msPerFrame / 1000,
                  newLastIdealStyle[key],
                  newLastIdealVelocity[key],
                  styleValue.val,
                  styleValue.stiffness,
                  styleValue.damping,
                  styleValue.precision,
                );

                newLastIdealStyle[key] = interpolated[0];
                newLastIdealVelocity[key] = interpolated[1];
                // console.log(interpolated, '----------------222');
              }
              const nextIdeal = stepper(
                msPerFrame / 1000,
                newLastIdealStyle[key],
                newLastIdealVelocity[key],
                styleValue.val,
                styleValue.stiffness,
                styleValue.damping,
                styleValue.precision,
              );

              newCurrentStyle[key] =
                newLastIdealStyle[key] +
                (nextIdeal[0] - newLastIdealStyle[key]) * currentFrameCompletion;
              newCurrentVelocity[key] =
                newLastIdealVelocity[key] +
                (nextIdeal[1] - newLastIdealVelocity[key]) * currentFrameCompletion;
            }

            // console.log(newCurrentStyle[key], newCurrentVelocity[key], '--------------------333');
          }
        }, newMergedPropsStyles);

        this.animationID = null;
        this.accumulatedTime -= framesToCatchUp * msPerFrame;
        // console.log(this.accumulatedTime, '---------------444');

        // invariant
        // for (let key in newCurrentStyles) {
        //   if (newCurrentStyles.hasOwnProperty(key)) {
        //     if (!newMergedPropsStyles.hasOwnProperty(key)) {
        //       debugger;
        //     }
        //   }
        // }
        // for (let key in newMergedPropsStyles) {
        //   if (newMergedPropsStyles.hasOwnProperty(key)) {
        //     if (!newCurrentStyles.hasOwnProperty(key)) {
        //       debugger;
        //     }
        //   }
        // }
        //
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

    componentWillReceiveProps(props) {
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

    render() {
      const renderedChildren = this.props.children(this.state.currentStyles);
      return renderedChildren && React.Children.only(renderedChildren);
    },
  });

  return TransitionMotion;
}
