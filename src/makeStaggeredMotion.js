/* @flow */
import zero from './zero';
import stripStyle from './stripStyle';
import stepper from './stepper';
import {default as defaultNow} from 'performance-now';
import {default as defaultRaf} from 'raf';

import type {CurrentStyle, Style, Velocity} from './Types';
const msPerFrame = 1000 / 60;

type CurrentStyles = Array<CurrentStyle>;
type Styles = Array<Style>;
type Velocities = Array<Velocity>;

type StaggeredMotionState = {
  currentStyles: CurrentStyles,
  currentVelocities: Velocities,
  lastIdealStyles: CurrentStyles,
  lastIdealVelocities: Velocities,
};

type DestStylesFunc = (_: ?CurrentStyles) => Styles;

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

function myClone<A>(a: Array<A>): Array<A> {
  return a.map(obj => ({...obj}));
}

// usage assumption: currentStyle values have already been rendered but it says
// nothing of whether currentStyle is stale (see Motion's hasUnreadPropStyle)
function shouldStopAnimationEach(currentStyle: CurrentStyle, destStyle: Style, currentVelocity: Velocity): boolean {
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
  currentStyles: CurrentStyles,
  destStyles: Styles,
  currentVelocities: Velocities,
): boolean {
  return currentStyles.every((currentStyle, key) => {
    const destStyle = destStyles[key];
    const currentVelocity = currentVelocities[key];
    return shouldStopAnimationEach(currentStyle, destStyle, currentVelocity);
  });
}

export default function makeStaggeredMotion(React: Object): Object {
  const {PropTypes} = React;

  const StaggeredMotion = React.createClass({
    propTypes: {
      // TOOD: warn against putting a config in here
      defaultStyles: PropTypes.arrayOf(PropTypes.object),
      styles: PropTypes.func.isRequired,
      children: PropTypes.func.isRequired,
    },

    getInitialState(): StaggeredMotionState {
      const {defaultStyles, styles} = this.props;
      const currentStyles: CurrentStyles = defaultStyles || styles().map(stripStyle);
      const currentVelocities = currentStyles.map(currentStyle => mapObject(zero, currentStyle));
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
    hasUnreadPropStyle: false,

    clearUnreadPropStyle(destStylesFunc: DestStylesFunc): void {
      let newCurrentStyles = myClone(this.state.currentStyles);
      let newCurrentVelocities = myClone(this.state.currentVelocities);
      let lastIdealStyles = myClone(this.state.lastIdealStyles);
      let lastIdealVelocities = myClone(this.state.lastIdealVelocities);

      const destStyles = destStylesFunc(this.state.lastIdealStyles);
      destStyles.forEach((destStyle, i) => {
        for (let key in destStyle) {
          if (!destStyle.hasOwnProperty(key)) {
            continue;
          }

          if (typeof destStyle[key] === 'number') {
            newCurrentStyles[i][key] = destStyle[key];
            newCurrentVelocities[i][key] = 0;
            if (typeof destStyle[key] !== 'number') {
              throw new Error('flow plz');
            }
            lastIdealStyles[i][key] = destStyle[key];
            lastIdealVelocities[i][key] = 0;
          }
        }
      });

      this.setState({
        currentStyles: newCurrentStyles,
        currentVelocities: newCurrentVelocities,
        lastIdealStyles,
        lastIdealVelocities,
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
        const destStyles: Styles = this.props.styles(this.state.lastIdealStyles);
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

        // TODO: no need to alloc so much. Optimize
        let newLastIdealStyles = myClone(this.state.lastIdealStyles);
        let newLastIdealVelocities = myClone(this.state.lastIdealVelocities);
        let newCurrentStyles = myClone(this.state.currentStyles);
        let newCurrentVelocities = myClone(this.state.currentVelocities);

        destStyles.forEach((destStyle, i) => {
          let newCurrentStyle = newCurrentStyles[i];
          let newCurrentVelocity = newCurrentVelocities[i];
          let newLastIdealStyle = newLastIdealStyles[i];
          let newLastIdealVelocity = newLastIdealVelocities[i];

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
        });

        this.animationID = null;
        this.accumulatedTime -= framesToCatchUp * msPerFrame;
        // console.log(this.accumulatedTime, '---------------444');

        this.setState({
          currentStyles: newCurrentStyles,
          currentVelocities: newCurrentVelocities,
          lastIdealStyles: newLastIdealStyles,
          lastIdealVelocities: newLastIdealVelocities,
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

  return StaggeredMotion;
}
