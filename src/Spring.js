import React, {PropTypes} from 'react';
import mapTree from './mapTree';
import isPlainObject from 'lodash.isPlainObject';
import stepper from './stepper';
import noVelocity from './noVelocity';
import mergeDiff from './mergeDiff';
import createAnimationLoop from './animationLoop';

const animationLoop = createAnimationLoop({
  // Fixed time step in seconds.
  timeStep: 1 / 60,
  // Slow-mo anyone? Give 0.1 a try.
  timeScale: 1,
  // Pause if we have more than this many steps worth of accumulated time.
  maxSteps: 10,
});

function zero() {
  return 0;
}

function assignByObjKey(ret, objWithKey) {
  ret[objWithKey.key] = objWithKey;
  return ret;
}

// TODO: refactor common logic with updateCurrValue and updateCurrVelocity
function interpolateValue(alpha, nextValue, prevValue) {
  if (nextValue === null) {
    return null;
  }
  if (prevValue == null) {
    return nextValue;
  }
  if (typeof nextValue === 'number') {
    // https://github.com/chenglou/react-motion/pull/57#issuecomment-121924628
    return nextValue * alpha + prevValue * (1 - alpha);
  }
  if (nextValue.val != null && nextValue.config && nextValue.config.length === 0) {
    return nextValue;
  }
  if (nextValue.val != null) {
    let ret = {
      val: interpolateValue(alpha, nextValue.val, prevValue.val),
    };
    if (nextValue.config) {
      ret.config = nextValue.config;
    }
    return ret;
  }
  if (Array.isArray(nextValue)) {
    return nextValue.map((_, i) => interpolateValue(alpha, nextValue[i], prevValue[i]));
  }
  if (isPlainObject(nextValue)) {
    return Object.keys(nextValue).reduce((ret, key) => {
      ret[key] = interpolateValue(alpha, nextValue[key], prevValue[key]);
      return ret;
    }, {});
  }
  return nextValue;
}

// TODO: refactor common logic with updateCurrVelocity
export function updateCurrValue(frameRate, currValue, currVelocity, endValue, k, b) {
  if (endValue === null) {
    return null;
  }
  if (typeof endValue === 'number') {
    if (k == null || b == null) {
      return endValue;
    }
    // TODO: do something to stepper to make this not allocate (2 steppers?)
    return stepper(frameRate, currValue, currVelocity, endValue, k, b)[0];
  }
  if (endValue.val != null && endValue.config && endValue.config.length === 0) {
    return endValue;
  }
  if (endValue.val != null) {
    const [_k, _b] = endValue.config || [170, 26];
    let ret = {
      val: updateCurrValue(frameRate, currValue.val, currVelocity.val, endValue.val, _k, _b),
    };
    if (endValue.config) {
      ret.config = endValue.config;
    }
    return ret;
  }
  if (Array.isArray(endValue)) {
    return endValue.map((_, i) => updateCurrValue(frameRate, currValue[i], currVelocity[i], endValue[i], k, b));
  }
  if (isPlainObject(endValue)) {
    return Object.keys(endValue).reduce((ret, key) => {
      ret[key] = updateCurrValue(frameRate, currValue[key], currVelocity[key], endValue[key], k, b);
      return ret;
    }, {});
  }
  return endValue;
}

export function updateCurrVelocity(frameRate, currValue, currVelocity, endValue, k, b) {
  if (endValue === null) {
    return null;
  }
  if (typeof endValue === 'number') {
    if (k == null || b == null) {
      return mapTree(zero, currVelocity);
    }
    // TODO: do something to stepper to make this not allocate (2 steppers?)
    return stepper(frameRate, currValue, currVelocity, endValue, k, b)[1];
  }
  if (endValue.val != null && endValue.config && endValue.config.length === 0) {
    return mapTree(zero, currVelocity);
  }
  if (endValue.val != null) {
    const [_k, _b] = endValue.config || [170, 26];
    let ret = {
      val: updateCurrVelocity(frameRate, currValue.val, currVelocity.val, endValue.val, _k, _b),
    };
    if (endValue.config) {
      ret.config = endValue.config;
    }
    return ret;
  }
  if (Array.isArray(endValue)) {
    return endValue.map((_, i) => updateCurrVelocity(frameRate, currValue[i], currVelocity[i], endValue[i], k, b));
  }
  if (isPlainObject(endValue)) {
    return Object.keys(endValue).reduce((ret, key) => {
      ret[key] = updateCurrVelocity(frameRate, currValue[key], currVelocity[key], endValue[key], k, b);
      return ret;
    }, {});
  }
  return mapTree(zero, currVelocity);
}

export const Spring = React.createClass({
  propTypes: {
    endValue: PropTypes.oneOfType([
      PropTypes.func,
      PropTypes.object,
      PropTypes.array,
    ]).isRequired,
    children: PropTypes.func.isRequired,
  },

  getInitialState() {
    let {endValue} = this.props;
    if (typeof endValue === 'function') {
      // TODO: provide warning for failing to provide base case
      endValue = endValue();
    }
    return {
      currValue: endValue,
      currVelocity: mapTree(zero, endValue),
    };
  },

  componentDidMount() {
    this.startAnimating();
  },

  componentWillReceiveProps() {
    this.startAnimating();
  },

  unsubscribeAnimation: null,

  componentWillUnmount() {
    if (this.unsubscribeAnimation) {
      this.unsubscribeAnimation();
      this.unsubscribeAnimation = null;
    }
  },

  startAnimating() {
    if (!this.unsubscribeAnimation) {
      // means we're not animating
      this.unsubscribeAnimation = animationLoop.subscribe(
        this.animationStep,
        this.animationRender,
        this.state,
      );
      animationLoop.start();
    }
  },

  animationStep(timeStep, state) {
    const {currValue, currVelocity} = state;
    let {endValue} = this.props;

    if (typeof endValue === 'function') {
      endValue = endValue(currValue);
    }

    const newCurrValue = updateCurrValue(timeStep, currValue, currVelocity, endValue);
    const newCurrVelocity = updateCurrVelocity(timeStep, currValue, currVelocity, endValue);

    if (noVelocity(currVelocity) && noVelocity(newCurrVelocity)) {
      this.unsubscribeAnimation();
      this.unsubscribeAnimation = undefined;
    }

    return {
      currValue: newCurrValue,
      currVelocity: newCurrVelocity,
    };
  },

  animationRender(alpha, nextState, prevState) {
    this.setState({
      currValue: interpolateValue(alpha, nextState.currValue, prevState.currValue),
      currVelocity: nextState.currVelocity,
    });
  },

  render() {
    const {currValue} = this.state;
    return React.Children.only(this.props.children(currValue));
  },
});

export const TransitionSpring = React.createClass({
  propTypes: {
    endValue: PropTypes.oneOfType([
      PropTypes.func,
      PropTypes.objectOf({
        key: PropTypes.any.isRequired,
      }),
      // coming soon
      // PropTypes.arrayOf(PropTypes.shape({
      //   key: PropTypes.any.isRequired,
      // })),
      PropTypes.arrayOf(PropTypes.element),
    ]).isRequired,
    willLeave: PropTypes.oneOfType([
      PropTypes.func,
      // PropTypes.object,
      // PropTypes.array,
      // TODO: numbers? strings?
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

  getInitialState() {
    let {endValue} = this.props;
    if (typeof endValue === 'function') {
      endValue = endValue();
    }
    return {
      currValue: endValue,
      currVelocity: mapTree(zero, endValue),
    };
  },

  componentDidMount() {
    this.startAnimating();
  },

  componentWillReceiveProps() {
    this.startAnimating();
  },

  componentWillUnmount() {
    if (this.unsubscribeAnimation) {
      this.unsubscribeAnimation();
      this.unsubscribeAnimation = undefined;
    }
  },

  startAnimating() {
    if (!this.unsubscribeAnimation) {
      this.unsubscribeAnimation = animationLoop.subscribe(
        this.animationStep,
        this.animationRender,
        this.state
      );
      animationLoop.start();
    }
  },

  animationStep(timeStep, state) {
    let {currValue, currVelocity} = state;
    let {endValue} = this.props;
    const {willEnter, willLeave} = this.props;

    if (typeof endValue === 'function') {
      endValue = endValue(currValue);
    }

    let mergedValue;
    if (Array.isArray(endValue)) {
      const currValueObj = currValue.reduce(assignByObjKey, {});
      const endValueObj = endValue.reduce(assignByObjKey, {});
      const currVelocityObj = endValue.reduce(assignByObjKey, {});

      const mergedValueObj = mergeDiff(
        currValueObj,
        endValueObj,
        key => willLeave(key, endValue, currValue, currVelocity)
      );

      let mergedValueKeys = Object.keys(mergedValueObj);
      mergedValueKeys
        .filter(key => !currValueObj.hasOwnProperty(key))
        .forEach(key => {
          const enterValue = willEnter(key, mergedValueObj[key], endValue, currValue, currVelocity);
          currValueObj[key] = enterValue;
          // We want the willEnter value to be stored as the endValue (in this
          // case, since it's entering, doesn't matter) once. This is very
          // different than providing a mere data structure to make the
          // currValue, currVelocity and endValue trees look the same for the purpose
          // of interpolating on trees of same shape, and then use endValue's
          // values to compute currentInterpolationValues anyway. Previously,
          // after providing willEnter value, we still use the non-numerical
          // values of endValue. But now that we use the non-numerical value
          // of willEnter once, we've effectively replace CSSTG since you can
          // let the react reconciler handle reconciling between 2 components
          // that differ by only a className
          mergedValueObj[key] = enterValue;
          currVelocityObj[key] = mapTree(zero, currValueObj[key]);
        });

      mergedValue = mergedValueKeys.map(key => mergedValueObj[key]);
      currValue = Object.keys(currValueObj).map(key => currValueObj[key]);
      currVelocity = Object.keys(currVelocityObj).map(key => currVelocityObj[key]);
    } else {
      // only other option is obj
      mergedValue = mergeDiff(
        currValue,
        endValue,
        // TODO: stop allocating like crazy in this whole code path
        key => willLeave(key, endValue, currValue, currVelocity)
      );

      Object.keys(mergedValue)
        .filter(key => !currValue.hasOwnProperty(key))
        .forEach(key => {
          const enterValue = willEnter(key, mergedValue[key], endValue, currValue, currVelocity);
          currValue[key] = enterValue;
          mergedValue[key] = enterValue;
          currVelocity[key] = mapTree(zero, currValue[key]);
        });
    }

    const newCurrValue = updateCurrValue(timeStep, currValue, currVelocity, mergedValue);
    const newCurrVelocity = updateCurrVelocity(timeStep, currValue, currVelocity, mergedValue);

    if (noVelocity(currVelocity) && noVelocity(newCurrVelocity)) {
      this.unsubscribeAnimation();
      this.unsubscribeAnimation = undefined;
    }

    return {
      currValue: newCurrValue,
      currVelocity: newCurrVelocity,
    };
  },

  animationRender(alpha, nextState, prevState) {
    this.setState({
      currValue: interpolateValue(alpha, nextState.currValue, prevState.currValue),
      currVelocity: nextState.currVelocity,
    });
  },

  render() {
    const {currValue} = this.state;
    return React.Children.only(this.props.children(currValue));
  },
});
