/* @flow */
import zero from './zero';
import stripStyle from './stripStyle';
import stepper from './stepper';
import defaultNow from 'performance-now';
import defaultRaf from 'raf';

import type {PlainStyle, Style, Velocity, StaggeredPlainStyles, StaggeredStyles, StaggeredVelocities} from './Types';
const msPerFrame = 1000 / 60;

type StaggeredMotionState = {
  currentStyles: StaggeredPlainStyles,
  currentVelocities: StaggeredVelocities,
  lastIdealStyles: StaggeredPlainStyles,
  lastIdealVelocities: StaggeredVelocities,
};

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
// nothing of whether currentStyle is stale (see unreadPropStyle)
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
  currentStyles: StaggeredPlainStyles,
  destStyles: StaggeredStyles,
  currentVelocities: StaggeredVelocities,
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
      const currentStyles: StaggeredPlainStyles = defaultStyles || styles().map(stripStyle);
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
    unreadPropStyle: (null: ?StaggeredStyles),
    // after checking for unreadPropStyle != null, we manually go set the
    // non-interpolating values (those that are a number, without a spring
    // config)
    clearUnreadPropStyle(unreadPropStyle: StaggeredStyles): void {
      let newCurrentStyles = myClone(this.state.currentStyles);
      let newCurrentVelocities = myClone(this.state.currentVelocities);
      let lastIdealStyles = myClone(this.state.lastIdealStyles);
      let lastIdealVelocities = myClone(this.state.lastIdealVelocities);

      unreadPropStyle.forEach((destStyle, i) => {
        for (let key in destStyle) {
          if (!destStyle.hasOwnProperty(key)) {
            continue;
          }

          const styleValue = destStyle[key];
          if (typeof styleValue === 'number') {
            newCurrentStyles[i][key] = styleValue;
            newCurrentVelocities[i][key] = 0;
            lastIdealStyles[i][key] = styleValue;
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
      // TODO: remove
      if (this.animationID != null) {
        throw new Error('Testing. Something wrong. animationID not null.');
      }
      // TODO: when config is {a: 10} and dest is {a: 10} do we raf once and
      // call cb? No, otherwise accidental parent rerender causes cb trigger

      this.animationID = defaultRaf(() => {
        // console.log('one raf called');
        const destStyles: StaggeredStyles = this.props.styles(this.state.lastIdealStyles);

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

        this.unreadPropStyle = null;

        this.startAnimationIfNecessary();
      });
    },

    componentDidMount() {
      this.prevTime = defaultNow();
      this.startAnimationIfNecessary();
    },

    componentWillReceiveProps(props) {
      if (this.unreadPropStyle != null) {
        // previous props haven't had the chance to be set yet; set them here
        this.clearUnreadPropStyle(this.unreadPropStyle);
      }

      this.unreadPropStyle = props.styles(this.state.lastIdealStyles);
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

  return StaggeredMotion;
}
