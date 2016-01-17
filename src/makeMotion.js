/* @flow */
import zero from './zero';
import stripStyle from './stripStyle';
import stepper from './stepper';
import {default as defaultNow} from 'performance-now';
import {default as defaultRaf} from 'raf';

import type {CurrentStyle, Style, Velocity} from './Types';
const msPerFrame = 1000 / 60;

function mapObject<Val1, Val2>(f: (val: Val1, key: string) => Val2, obj: {[key: string]: Val1}): {[key: string]: Val2} {
  let ret = {};
  for (const key in obj) {
    if (!obj.hasOwnProperty(key)) {
      continue;
    }
    ret[key] = f(obj[key], key);
  }
  return ret;
}

// usage assumption: currentStyle values have already been rendered but it says
// nothing of whether currentStyle is stale (see Motion's hasUnreadPropStyle)
function shouldStopAnimation(currentStyle: CurrentStyle, destStyle: Style, currentVelocity: Velocity): boolean {
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

export default function makeMotion(React: Object): Object {
  const {PropTypes} = React;

  type MotionState = {
    currentStyle: CurrentStyle,
    currentVelocity: Velocity,
    lastIdealStyle: CurrentStyle,
    lastIdealVelocity: Velocity,
  };

  const Motion = React.createClass({
    propTypes: {
      // TOOD: warn against putting a config in here
      defaultStyle: PropTypes.objectOf(PropTypes.number),
      style: PropTypes.object.isRequired,
      children: PropTypes.func.isRequired,
    },

    getInitialState(): MotionState {
      const {defaultStyle, style} = this.props;
      const currentStyle: CurrentStyle = defaultStyle || stripStyle(style);
      const currentVelocity = mapObject(zero, currentStyle);
      return {
        currentStyle: currentStyle,
        currentVelocity: currentVelocity,
        lastIdealStyle: currentStyle,
        lastIdealVelocity: currentVelocity,
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

    clearUnreadPropStyle(destStyle: Style): void {
      let newCurrentStyle: CurrentStyle = {...this.state.currentStyle};
      let newCurrentVelocity: Velocity = {...this.state.currentVelocity};
      let lastIdealStyle: CurrentStyle = {...this.state.lastIdealStyle};
      let lastIdealVelocity: Velocity = {...this.state.lastIdealVelocity};

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
          lastIdealStyle[key] = destStyle[key];
          lastIdealVelocity[key] = 0;
        }
      }

      this.setState({
        currentStyle: newCurrentStyle,
        currentVelocity: newCurrentVelocity,
        lastIdealStyle,
        lastIdealVelocity,
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
        // check if we need to animate in the first place
        const propsStyle: Style = this.props.style;
        if (shouldStopAnimation(
          this.state.currentStyle,
          propsStyle,
          this.state.currentVelocity,
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

        // TODO: no need to alloc so much. Optimize
        let newLastIdealStyle: CurrentStyle = {...this.state.lastIdealStyle};
        let newLastIdealVelocity: Velocity = {...this.state.lastIdealVelocity};
        let newCurrentStyle: CurrentStyle = {};
        let newCurrentVelocity: Velocity = {};

        for (let key in propsStyle) {
          if (!propsStyle.hasOwnProperty(key)) {
            continue;
          }

          if (typeof propsStyle[key] === 'number') {
            newCurrentStyle[key] = propsStyle[key];
            newCurrentVelocity[key] = 0;
            if (typeof propsStyle[key] !== 'number') {
              throw new Error('flow plz');
            }
            newLastIdealStyle[key] = propsStyle[key];
            newLastIdealVelocity[key] = 0;
          } else {
            for (let i = 0; i < framesToCatchUp; i++) {
              const interpolated = stepper(
                msPerFrame / 1000,
                newLastIdealStyle[key],
                newLastIdealVelocity[key],
                propsStyle[key].val,
                propsStyle[key].stiffness,
                propsStyle[key].damping,
              );

              newLastIdealStyle[key] = interpolated[0];
              newLastIdealVelocity[key] = interpolated[1];
              // console.log(interpolated, '----------------222');
            }
            const nextIdeal = stepper(
              msPerFrame / 1000,
              newLastIdealStyle[key],
              newLastIdealVelocity[key],
              propsStyle[key].val,
              propsStyle[key].stiffness,
              propsStyle[key].damping,
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

        this.animationID = null;
        this.accumulatedTime -= framesToCatchUp * msPerFrame;
        // console.log(this.accumulatedTime, '---------------444');

        this.setState({
          currentStyle: newCurrentStyle,
          currentVelocity: newCurrentVelocity,
          lastIdealStyle: newLastIdealStyle,
          lastIdealVelocity: newLastIdealVelocity,
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
        this.clearUnreadPropStyle(this.props.style);
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
      const strippedStyle: CurrentStyle = this.state.currentStyle;
      // console.log('rendered', strippedStyle);
      const renderedChildren = this.props.children(strippedStyle);
      return renderedChildren && React.Children.only(renderedChildren);
    },
  });

  return Motion;
}
