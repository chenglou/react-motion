/* @flow */
import zero from './zero';
import stripStyle from './stripStyle';
import stepper from './stepper';
import {default as mergeDiff} from './mergeDiff';
import {default as defaultNow} from 'performance-now';
import {default as defaultRaf} from 'raf';

import type {CurrentStyle, Style, Velocity} from './Types';
const msPerFrame = 1000 / 60;

// TODO: put these types in Types.js? Needa rename
type CurrentStyles = {[key: string]: CurrentStyle};
type Styles = {[key: string]: Style};
type Velocities = {[key: string]: Velocity};

type TransitionMotionState = {
  currentStyles: CurrentStyles,
  currentVelocities: Velocities,
  lastIdealStyles: CurrentStyles,
  lastIdealVelocities: Velocities,
  mergedPropsStyles: Styles,
};

type DestStylesFunc = (_: ?CurrentStyles) => Styles;
type PropStyles = Styles | DestStylesFunc;

type WillEnter = (key: string, b: Style, c: Styles, d: CurrentStyles, e: Velocities) => CurrentStyle;
type WillLeave = (key: string, b: Style, c: Styles, d: CurrentStyles, e: Velocities) => ?Style;

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
// nothing of whether currentStyle is stale (see Motion's hasUnreadPropStyle)
function shouldStopAnimationEach(currentStyle: CurrentStyle, destStyle: Style, currentVelocity: Velocity): boolean {
  for (let key in destStyle) {
    if (!destStyle.hasOwnProperty(key)) {
      continue;
    }
    if (destStyle[key] == null || (typeof destStyle[key] !== 'number' && destStyle[key].config == null)) {
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
  currentStyles: CurrentStyles,
  destStyles: Styles,
  currentVelocities: Velocities,
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
  oldMergedPropsStyles: Styles,
  destStyles: Styles,
  oldCurrentStyles: CurrentStyles,
  oldCurrentVelocities: Velocities,
  oldLastIdealStyles: CurrentStyles,
  oldLastIdealVelocities: Velocities,
): [Styles, CurrentStyles, Velocities, CurrentStyles, Velocities] {
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
      const destStyles: Styles = typeof styles === 'function' ? styles() : styles;

      if (willEnter == null || willLeave == null) {
        // TODO: use classes so flow can recognize default props
        throw new Error('impossible, flow');
      }

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
        willEnter,
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
    hasUnreadPropStyle: false,

    clearUnreadPropStyle(propStyles: PropStyles): void {
      if (this.props.willEnter == null || this.props.willLeave == null) {
        // TODO: use classes so flow can recognize default props
        throw new Error('impossible, flow');
      }

      const destStyles = typeof propStyles === 'function'
        ? propStyles(this.state.lastIdealStyles)
        : propStyles;

      let [newMergedPropsStyles, newCurrentStyles, newCurrentVelocities, newLastIdealStyles, newLastIdealVelocities] = mergeAndSync(
        this.props.willEnter,
        this.props.willLeave,
        this.state.mergedPropsStyles,
        destStyles,
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

          if (typeof destStyle[key] === 'number') {
            newCurrentStyles[id][key] = destStyle[key];
            if (typeof destStyle[key] !== 'number') {
              throw new Error('flow plz');
            }
            newMergedPropsStyles[id][key] = destStyle[key];
            newCurrentVelocities[id][key] = 0;
            if (typeof destStyle[key] !== 'number') {
              throw new Error('flow plz');
            }
            newLastIdealStyles[id][key] = destStyle[key];
            newLastIdealVelocities[id][key] = 0;
          }
        }
      }, destStyles);

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
      if (this.animationID != null) {
        throw new Error('Testing. Something wrong. animationID not null.');
      }
      // TODO: when config is {a: 10} and dest is {a: 10} do we raf once and
      // call cb? No, otherwise accidental parent rerender causes cb trigger

      this.animationID = defaultRaf(() => {
        // console.log('one raf called');
        const propStyles: PropStyles = this.props.styles;
        let destStyles: Styles = typeof propStyles === 'function'
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

        if (this.props.willEnter == null || this.props.willLeave == null) {
          // TODO: use classes so flow can recognize default props
          throw new Error('impossible, flow');
        }
        let [newMergedPropsStyles, newCurrentStyles, newCurrentVelocities, newLastIdealStyles, newLastIdealVelocities] = mergeAndSync(
          this.props.willEnter,
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

            if (typeof destStyle[key] === 'number') {
              newCurrentStyle[key] = destStyle[key];
              newCurrentVelocity[key] = 0;
              if (typeof destStyle[key] !== 'number') {
                throw new Error('flow plz');
              }
              newLastIdealStyle[key] = destStyle[key];
              newLastIdealVelocity[key] = 0;
            } else if (destStyle[key].config == null) {
              continue;
            } else {
              for (let j = 0; j < framesToCatchUp; j++) {
                const interpolated = stepper(
                  msPerFrame / 1000,
                  newLastIdealStyle[key],
                  newLastIdealVelocity[key],
                  destStyle[key].val,
                  destStyle[key].config[0],
                  destStyle[key].config[1],
                );

                newLastIdealStyle[key] = interpolated[0];
                newLastIdealVelocity[key] = interpolated[1];
                // console.log(interpolated, '----------------222');
              }
              const nextIdeal = stepper(
                msPerFrame / 1000,
                newLastIdealStyle[key],
                newLastIdealVelocity[key],
                destStyle[key].val,
                destStyle[key].config[0],
                destStyle[key].config[1],
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

        this.hasUnreadPropStyle = false;

        this.startAnimationIfNecessary();
      });
    },

    componentDidMount() {
      this.prevTime = defaultNow();
      this.startAnimationIfNecessary();
    },

    componentWillReceiveProps() {
      if (this.hasUnreadPropStyle) {
        this.clearUnreadPropStyle(this.props.styles);
      }

      this.hasUnreadPropStyle = true;
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
      const strippedStyle: CurrentStyles = this.state.currentStyles;
      // console.log('rendered', strippedStyle);
      const renderedChildren = this.props.children(strippedStyle);
      return renderedChildren && React.Children.only(renderedChildren);
    },
  });

  return TransitionMotion;
}
