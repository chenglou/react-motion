/* @flow */
import mapToZero from './mapToZero';
import stripStyle from './stripStyle';
import stepper from './stepper';
import defaultNow from 'performance-now';
import defaultRaf from 'raf';
import shouldStopAnimation from './shouldStopAnimation';
import React, {PropTypes} from 'react';

import type {PlainStyle, Style, Velocity, StaggeredProps} from './Types';

const msPerFrame = 1000 / 60;

type StaggeredMotionState = {
  currentStyles: Array<PlainStyle>,
  currentVelocities: Array<Velocity>,
  lastIdealStyles: Array<PlainStyle>,
  lastIdealVelocities: Array<Velocity>,
};

function shouldStopAnimationAll(
  currentStyles: Array<PlainStyle>,
  styles: Array<Style>,
  currentVelocities: Array<Velocity>,
): boolean {
  for (let i = 0; i < currentStyles.length; i++) {
    if (!shouldStopAnimation(currentStyles[i], styles[i], currentVelocities[i])) {
      return false;
    }
  }
  return true;
}

const StaggeredMotion = React.createClass({
  propTypes: {
    // TOOD: warn against putting a config in here
    defaultStyles: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.number)),
    styles: PropTypes.func.isRequired,
    children: PropTypes.func.isRequired,
  },

  getInitialState(): StaggeredMotionState {
    const {defaultStyles, styles} = this.props;
    const currentStyles: Array<PlainStyle> = defaultStyles || styles().map(stripStyle);
    const currentVelocities = currentStyles.map(currentStyle => mapToZero(currentStyle));
    return {
      currentStyles: currentStyles,
      currentVelocities: currentVelocities,
      lastIdealStyles: currentStyles,
      lastIdealVelocities: currentVelocities,
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
  unreadPropStyles: (null: ?Array<Style>),
  // after checking for unreadPropStyles != null, we manually go set the
  // non-interpolating values (those that are a number, without a spring
  // config)
  clearUnreadPropStyle(unreadPropStyles: Array<Style>): void {
    let {currentStyles, currentVelocities, lastIdealStyles, lastIdealVelocities} = this.state;

    let someDirty = false;
    for (let i = 0; i < unreadPropStyles.length; i++) {
      const unreadPropStyle = unreadPropStyles[i];
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
            currentStyles[i] = {...currentStyles[i]};
            currentVelocities[i] = {...currentVelocities[i]};
            lastIdealStyles[i] = {...lastIdealStyles[i]};
            lastIdealVelocities[i] = {...lastIdealVelocities[i]};
          }
          currentStyles[i][key] = styleValue;
          currentVelocities[i][key] = 0;
          lastIdealStyles[i][key] = styleValue;
          lastIdealVelocities[i][key] = 0;
        }
      }
    }

    if (someDirty) {
      this.setState({currentStyles, currentVelocities, lastIdealStyles, lastIdealVelocities});
    }
  },

  startAnimationIfNecessary(): void {
    // TODO: when config is {a: 10} and dest is {a: 10} do we raf once and
    // call cb? No, otherwise accidental parent rerender causes cb trigger
    this.animationID = defaultRaf(() => {
      const destStyles: Array<Style> = this.props.styles(this.state.lastIdealStyles);

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

      let newLastIdealStyles = [];
      let newLastIdealVelocities = [];
      let newCurrentStyles = [];
      let newCurrentVelocities = [];

      for (let i = 0; i < destStyles.length; i++) {
        const destStyle = destStyles[i];
        let newCurrentStyle: PlainStyle = {};
        let newCurrentVelocity: Velocity = {};
        let newLastIdealStyle: PlainStyle = {};
        let newLastIdealVelocity: Velocity = {};

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
            let newLastIdealStyleValue = this.state.lastIdealStyles[i][key];
            let newLastIdealVelocityValue = this.state.lastIdealVelocities[i][key];
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

        newCurrentStyles[i] = newCurrentStyle;
        newCurrentVelocities[i] = newCurrentVelocity;
        newLastIdealStyles[i] = newLastIdealStyle;
        newLastIdealVelocities[i] = newLastIdealVelocity;
      }

      this.animationID = null;
      // the amount we're looped over above
      this.accumulatedTime -= framesToCatchUp * msPerFrame;

      this.setState({
        currentStyles: newCurrentStyles,
        currentVelocities: newCurrentVelocities,
        lastIdealStyles: newLastIdealStyles,
        lastIdealVelocities: newLastIdealVelocities,
      });

      this.unreadPropStyles = null;

      this.startAnimationIfNecessary();
    });
  },

  componentDidMount() {
    this.prevTime = defaultNow();
    this.startAnimationIfNecessary();
  },

  componentWillReceiveProps(props: StaggeredProps) {
    if (this.unreadPropStyles != null) {
      // previous props haven't had the chance to be set yet; set them here
      this.clearUnreadPropStyle(this.unreadPropStyles);
    }

    this.unreadPropStyles = props.styles(this.state.lastIdealStyles);
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
    const renderedChildren = this.props.children(this.state.currentStyles);
    return renderedChildren && React.Children.only(renderedChildren);
  },
});

export default StaggeredMotion;
