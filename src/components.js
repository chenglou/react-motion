import now from 'performance-now';
import raf from 'raf';

import mapTree from './mapTree';
import noVelocity from './noVelocity';
import compareTrees from './compareTrees';
import mergeDiff from './mergeDiff';
import zero from './zero';
import {interpolateValue, updateCurrValue, updateCurrVelocity} from './updateTree';

const timeStep = 1 / 60 * 1000;
const timeScale = 1;
const maxSteps = 10;

export default function components(React) {
  let {PropTypes} = React;

  const Spring = React.createClass({
    propTypes: {
      defaultValue: PropTypes.oneOfType([
        PropTypes.object,
        PropTypes.array,
        PropTypes.number,
      ]),
      endValue: PropTypes.oneOfType([
        PropTypes.func,
        PropTypes.object,
        PropTypes.array,
        PropTypes.number,
      ]).isRequired,
      children: PropTypes.func.isRequired,
    },

    prevTime: 0,
    accumulatedTime: 0,
    active: false,
    hasUnmounted: false,

    currFrameValue: null,
    currFrameVelocity: null,
    nextFrameValue: null,
    nextFrameVelocity: null,

    getInitialState() {
      const {endValue, defaultValue} = this.props;
      let currValue;
      if (defaultValue == null) {
        if (typeof endValue === 'function') {
          // TODO: provide perf tip here when endValue argument count is 0
          // (meaning you could have passed an obj)
          currValue = endValue();
        } else {
          currValue = endValue;
        }
      } else {
        currValue = defaultValue;
      }

      const vel = mapTree(zero, currValue);

      // We can't use `setState` because we need to synchronously set them and
      // also because they're not directly the values used for rendering.
      //
      // It looks like this:
      // --------|---------------------*----------------------------------|-----
      //   currFrameValue1          interpolatedValue            nextFrameValue1
      //
      //
      // If the next `raf` comes too quickly, we might get
      // --------|--------------------------------------*-----------------|-----
      //   currFrameValue1                      interpolatedValue nextFrameValue1
      //
      //
      // If the next `raf` comes a little later, we might get
      // --------|---------------*----------------------------------------|-----
      //   nextFrameValue1  interpolatedValue                     nextFrameValue2
      //
      //         ^
      //         |
      //      notice we moved by one frame
      this.currFrameValue = currValue;
      this.currFrameVelocity = vel;
      this.nextFrameValue = currValue;
      this.nextFrameVelocity = vel;
      return {
        currValue: currValue,
        currVelocity: vel,
      };
    },

    componentDidMount() {
      this.startAnimating();
    },

    componentWillReceiveProps() {
      this.startAnimating();
    },

    componentWillUnmount() {
      this.stopAnimation();
      this.hasUnmounted = true;
    },

    startAnimating() {
      if (!this.active) {
        this.active = true;
        raf(this.animationLoop);
      }
    },

    animationLoop() {
      const {
        animationStep,
        animationLoop,
      } = this;

      const currentTime = now();
      const frameTime = currentTime - this.prevTime; // delta

      this.prevTime = currentTime;
      this.accumulatedTime += frameTime * timeScale;

      if (this.accumulatedTime > timeStep * maxSteps) {
        this.accumulatedTime = 0;
      }

      const frameNumber = Math.ceil(this.accumulatedTime / timeStep);
      let {
        currFrameValue,
        currFrameVelocity,
        nextFrameValue,
        nextFrameVelocity,
      } = this;

      let newCurrValue = nextFrameValue;
      let newCurrVelocity = nextFrameVelocity;
      let newPrevValue = currFrameValue;
      let newPrevVelocity = currFrameVelocity;

      if (this.active) {
        // Seems like because the TS sets destVals as enterVals for the first
        // tick, we might render that value twice. We render it once, currValue
        // is enterVal and destVal is enterVal. The next tick is faster than
        // 16ms, so accumulatedTime (which would be about -16ms from the
        // previous tick) is negative (-16ms + any number less than 16ms < 0).
        // So we just render part ways towards the nextState, but that's
        // enterVal still. We render say 75% between currValue (=== enterVal)
        // and destValue (=== enterVal). So we render the same value a second
        // time. The solution bellow is to recalculate the destination state
        // even when you're moving partially towards it.
        if (this.accumulatedTime <= 0) {
          let newState = animationStep(timeStep / 1000, currFrameValue, currFrameVelocity);
          newCurrValue = newState.currValue;
          newCurrVelocity = newState.currVelocity;
        } else {
          for (let j = 0; j < frameNumber; j++) {
            let newState = animationStep(timeStep / 1000, newCurrValue, newCurrVelocity);
            newCurrValue = newState.currValue;
            newCurrVelocity = newState.currVelocity;

            newPrevValue = nextFrameValue;
            nextFrameValue = newCurrValue;

            newPrevVelocity = nextFrameVelocity;
            nextFrameVelocity = newCurrVelocity;
          }
        }
      }

      this.accumulatedTime = this.accumulatedTime - frameNumber * timeStep;
      this.nextFrameValue = newCurrValue;
      this.nextFrameVelocity = newCurrVelocity;
      this.currFrameValue = newPrevValue;
      this.currFrameVelocity = newPrevVelocity;

      // The `setState` will trigger a render, independent from the `raf`
      if (!this.hasUnmounted) {
        const alpha = !this.active ? 1 : 1 + this.accumulatedTime / timeStep;
        this.setState({
          currValue: interpolateValue(alpha, newCurrValue, newPrevValue),
          currVelocity: newCurrVelocity,
        });
      }

      // We continue `raf`ing if the `Spring`'s active
      if (this.active) {
        raf(animationLoop);
      }
    },

    animationStep(timestep, currValue, currVelocity) {
      let {endValue} = this.props;

      if (typeof endValue === 'function') {
        endValue = endValue(currValue);
      }

      const newCurrValue = updateCurrValue(timestep, currValue, currVelocity, endValue);
      const newCurrVelocity = updateCurrVelocity(timestep, currValue, currVelocity, endValue);

      if (noVelocity(newCurrVelocity)) {
        // check explanation in `Spring.animationRender`
        this.active = false; // Nasty side effects...
      }

      return {
        currValue: newCurrValue,
        currVelocity: newCurrVelocity,
      };
    },

    render() {
      const renderedChildren = this.props.children(this.state.currValue);
      return renderedChildren && React.Children.only(renderedChildren);
    },
  });

  const TransitionSpring = React.createClass({
    propTypes: {
      defaultValue: PropTypes.objectOf(PropTypes.any),
      endValue: PropTypes.oneOfType([
        PropTypes.func,
        PropTypes.objectOf(PropTypes.any.isRequired),
        // PropTypes.arrayOf(PropTypes.shape({
        //   key: PropTypes.any.isRequired,
        // })),
        // PropTypes.arrayOf(PropTypes.element),
      ]).isRequired,
      willLeave: PropTypes.oneOfType([
        PropTypes.func,
        // PropTypes.object,
        // PropTypes.array,
      ]),
      willEnter: PropTypes.oneOfType([
        PropTypes.func,
        // PropTypes.object,
        // PropTypes.array,
      ]),
      children: PropTypes.func.isRequired,
    },

    getDefaultProps() {
      return {
        willEnter: (key, value) => value,
        willLeave: () => null,
      };
    },

    prevTime: 0,
    accumulatedTime: 0,
    active: false,
    hasUnmounted: false,

    currFrameValue: null,
    currFrameVelocity: null,
    nextFrameValue: null,
    nextFrameVelocity: null,

    getInitialState() {
      const {endValue, defaultValue} = this.props;
      let currValue;
      if (defaultValue == null) {
        if (typeof endValue === 'function') {
          currValue = endValue();
        } else {
          currValue = endValue;
        }
      } else {
        currValue = defaultValue;
      }

      const vel = mapTree(zero, currValue);

      // See getInitialState in `Spring`
      this.currFrameValue = currValue;
      this.currFrameVelocity = vel;
      this.nextFrameValue = currValue;
      this.nextFrameVelocity = vel;
      return {
        currValue: currValue,
        currVelocity: vel,
      };
    },

    componentDidMount() {
      this.startAnimating();
    },

    componentWillReceiveProps() {
      this.startAnimating();
    },

    componentWillUnmount() {
      this.stopAnimation();
    },

    startAnimating() {
      if (!this.active) {
        this.active = true;
        raf(this.animationLoop);
      }
    },

    // Look at `Spring` for comments (animationLoops are identical)
    animationLoop() {
      const {
        animationStep,
        animationLoop,
      } = this;

      const currentTime = now();
      const frameTime = currentTime - this.prevTime; // delta

      this.prevTime = currentTime;
      this.accumulatedTime += frameTime * timeScale;

      if (this.accumulatedTime > timeStep * maxSteps) {
        this.accumulatedTime = 0;
      }

      const frameNumber = Math.ceil(this.accumulatedTime / timeStep);
      let {
        currFrameValue,
        currFrameVelocity,
        nextFrameValue,
        nextFrameVelocity,
      } = this;

      let newCurrValue = nextFrameValue;
      let newCurrVelocity = nextFrameVelocity;
      let newPrevValue = currFrameValue;
      let newPrevVelocity = currFrameVelocity;

      if (this.active) {
        if (this.accumulatedTime <= 0) {
          let newState = animationStep(timeStep / 1000, currFrameValue, currFrameVelocity);
          newCurrValue = newState.currValue;
          newCurrVelocity = newState.currVelocity;
        } else {
          for (let j = 0; j < frameNumber; j++) {
            let newState = animationStep(timeStep / 1000, newCurrValue, newCurrVelocity);
            newCurrValue = newState.currValue;
            newCurrVelocity = newState.currVelocity;

            newPrevValue = nextFrameValue;
            nextFrameValue = newCurrValue;

            newPrevVelocity = nextFrameVelocity;
            nextFrameVelocity = newCurrVelocity;
          }
        }
      }

      this.accumulatedTime = this.accumulatedTime - frameNumber * timeStep;
      this.nextFrameValue = newCurrValue;
      this.nextFrameVelocity = newCurrVelocity;
      this.currFrameValue = newPrevValue;
      this.currFrameVelocity = newPrevVelocity;

      if (!this.hasUnmounted) {
        const alpha = !this.active ? 1 : 1 + this.accumulatedTime / timeStep;
        this.setState({
          currValue: interpolateValue(alpha, newCurrValue, newPrevValue),
          currVelocity: newCurrVelocity,
        });
      }

      if (this.active) {
        raf(animationLoop);
      }
    },

    animationStep(timestep, currValue, currVelocity) {
      let {willEnter, willLeave, endValue} = this.props;

      if (typeof endValue === 'function') {
        endValue = endValue(currValue);
      }

      let mergedValue = endValue; // set mergedValue to endValue as the default
      let hasNewKey = false;

      mergedValue = mergeDiff(
        currValue,
        endValue,
        // TODO: stop allocating like crazy in this whole code path
        key => {
          const res = willLeave(key, currValue[key], endValue, currValue, currVelocity);
          if (res == null) {
            // For legacy reason. We won't allow returning null soon
            // TODO: remove, after next release
            return null;
          }

          if (noVelocity(currVelocity[key]) && compareTrees(currValue[key], res)) {
            return null;
          }
          return res;
        }
      );

      Object.keys(mergedValue)
        .filter(key => !currValue.hasOwnProperty(key))
        .forEach(key => {
          hasNewKey = true;
          const enterValue = willEnter(key, mergedValue[key], endValue, currValue, currVelocity);
          currValue[key] = enterValue;
          mergedValue[key] = enterValue;
          currVelocity[key] = mapTree(zero, currValue[key]);
        });

      const newCurrValue = updateCurrValue(timestep, currValue, currVelocity, mergedValue);
      const newCurrVelocity = updateCurrVelocity(timestep, currValue, currVelocity, mergedValue);

      if (!hasNewKey && noVelocity(newCurrVelocity)) {
        // check explanation in `Spring.animationRender`
        this.active = false; // Nasty side effects...
      }

      return {
        currValue: newCurrValue,
        currVelocity: newCurrVelocity,
      };
    },

    render() {
      const renderedChildren = this.props.children(this.state.currValue);
      return renderedChildren && React.Children.only(renderedChildren);
    },
  });

  return {Spring, TransitionSpring};
}
