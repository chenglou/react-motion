/* @flow */
import mapToZero from './mapToZero';
import stripStyle from './stripStyle';
import stepper from './stepper';
import defaultNow from 'performance-now';
import defaultRaf from 'raf';
import shouldStopAnimation from './shouldStopAnimation';
import React from 'react';
import PropTypes from 'prop-types';
import createReactClass from 'create-react-class';

import type {ReactElement, PlainStyle, Style, Velocity, MotionProps} from './Types';

const msPerFrame = 1000 / 60;

type MotionState = {
  currentStyle: PlainStyle,
  currentVelocity: Velocity,
  lastIdealStyle: PlainStyle,
  lastIdealVelocity: Velocity,
};

const Motion = createReactClass({
  propTypes: {
    // TOOD: warn against putting a config in here
    defaultStyle: PropTypes.objectOf(PropTypes.number),
    style: PropTypes.objectOf(PropTypes.oneOfType([
      PropTypes.number,
      PropTypes.object,
    ])).isRequired,
    children: PropTypes.func.isRequired,
    onRest: PropTypes.func,
  },

  getInitialState(): MotionState {
    const {defaultStyle, style} = this.props;
    const currentStyle = defaultStyle || stripStyle(style);
    const currentVelocity = mapToZero(currentStyle);
    return {
      currentStyle,
      currentVelocity,
      lastIdealStyle: currentStyle,
      lastIdealVelocity: currentVelocity,
    };
  },

  wasAnimating: false,
  animationID: (null: ?number),
  prevTime: 0,
  accumulatedTime: 0,
  // it's possible that currentStyle's value is stale: if props is immediately
  // changed from 0 to 400 to spring(0) again, the async currentStyle is still
  // at 0 (didn't have time to tick and interpolate even once). If we naively
  // compare currentStyle with destVal it'll be 0 === 0 (no animation, stop).
  // In reality currentStyle should be 400
  unreadPropStyle: (null: ?Style),
  // after checking for unreadPropStyle != null, we manually go set the
  // non-interpolating values (those that are a number, without a spring
  // config)
  clearUnreadPropStyle(destStyle: Style): void {
    let dirty = false;
    let {currentStyle, currentVelocity, lastIdealStyle, lastIdealVelocity} = this.state;

    for (let key in destStyle) {
      if (!Object.prototype.hasOwnProperty.call(destStyle, key)) {
        continue;
      }

      const styleValue = destStyle[key];
      if (typeof styleValue === 'number') {
        if (!dirty) {
          dirty = true;
          currentStyle = {...currentStyle};
          currentVelocity = {...currentVelocity};
          lastIdealStyle = {...lastIdealStyle};
          lastIdealVelocity = {...lastIdealVelocity};
        }

        currentStyle[key] = styleValue;
        currentVelocity[key] = 0;
        lastIdealStyle[key] = styleValue;
        lastIdealVelocity[key] = 0;
      }
    }

    if (dirty) {
      this.setState({currentStyle, currentVelocity, lastIdealStyle, lastIdealVelocity});
    }
  },

  startAnimationIfNecessary(): void {
    // TODO: when config is {a: 10} and dest is {a: 10} do we raf once and
    // call cb? No, otherwise accidental parent rerender causes cb trigger
    this.animationID = defaultRaf((timestamp) => {
      // check if we need to animate in the first place
      const propsStyle: Style = this.props.style;
      if (shouldStopAnimation(
        this.state.currentStyle,
        propsStyle,
        this.state.currentVelocity,
      )) {
        if (this.wasAnimating && this.props.onRest) {
          this.props.onRest();
        }

        // no need to cancel animationID here; shouldn't have any in flight
        this.animationID = null;
        this.wasAnimating = false;
        this.accumulatedTime = 0;
        return;
      }

      this.wasAnimating = true;

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

      let newLastIdealStyle: PlainStyle = {};
      let newLastIdealVelocity: Velocity = {};
      let newCurrentStyle: PlainStyle = {};
      let newCurrentVelocity: Velocity = {};

      for (let key in propsStyle) {
        if (!Object.prototype.hasOwnProperty.call(propsStyle, key)) {
          continue;
        }

        const styleValue = propsStyle[key];
        if (typeof styleValue === 'number') {
          newCurrentStyle[key] = styleValue;
          newCurrentVelocity[key] = 0;
          newLastIdealStyle[key] = styleValue;
          newLastIdealVelocity[key] = 0;
        } else {
          let newLastIdealStyleValue = this.state.lastIdealStyle[key];
          let newLastIdealVelocityValue = this.state.lastIdealVelocity[key];
          for (let i = 0; i < framesToCatchUp; i++) {
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

      this.animationID = null;
      // the amount we're looped over above
      this.accumulatedTime -= framesToCatchUp * msPerFrame;

      this.setState({
        currentStyle: newCurrentStyle,
        currentVelocity: newCurrentVelocity,
        lastIdealStyle: newLastIdealStyle,
        lastIdealVelocity: newLastIdealVelocity,
      });

      this.unreadPropStyle = null;

      this.startAnimationIfNecessary();
    });
  },

  componentDidMount() {
    this.prevTime = defaultNow();
    this.startAnimationIfNecessary();
  },

  componentWillReceiveProps(props: MotionProps) {
    if (this.unreadPropStyle != null) {
      // previous props haven't had the chance to be set yet; set them here
      this.clearUnreadPropStyle(this.unreadPropStyle);
    }

    this.unreadPropStyle = props.style;
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
    const renderedChildren = this.props.children(this.state.currentStyle);
    return renderedChildren && React.Children.only(renderedChildren);
  },
});

export default Motion;
