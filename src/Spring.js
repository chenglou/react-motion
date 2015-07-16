import React, {PropTypes} from 'react';
import {mapTree, clone, isPlainObject} from './utils';
import stepper from './stepper';
import createAnimationLoop from './animationLoop';

const animationLoop = createAnimationLoop({
  timeStep: 1 / 60,
  timeScale: 1,
  maxSteps: 10,
  getTime: performance.now.bind(performance),
  ticker: window.requestAnimationFrame.bind(window),
});

function zero() {
  return 0;
}

// TODO: test
function mergeDiff(collA, collB, onRemove, accum) {
  const [a, ...aa] = collA;
  const [b, ...bb] = collB;

  if (collA.length === 0 && collB.length === 0) {
    return accum;
  }
  if (collA.length === 0) {
    return accum.concat(collB);
  }
  if (collB.length === 0) {
    if (onRemove(a)) {
      return mergeDiff(aa, collB, onRemove, accum);
    }
    return mergeDiff(aa, collB, onRemove, accum.concat(a));
  }
  if (a === b) { // fails for ([undefined], [], () => true). but don't do that
    return mergeDiff(aa, bb, onRemove, accum.concat(a));
  }
  if (collB.indexOf(a) === -1) {
    if (onRemove(a)) {
      return mergeDiff(aa, collB, onRemove, accum);
    }
    return mergeDiff(aa, collB, onRemove, accum.concat(a));
  }
  return mergeDiff(aa, collB, onRemove, accum);
}

function mergeDiffObj(a, b, onRemove) {
  const keys = mergeDiff(Object.keys(a), Object.keys(b), _a => !onRemove(_a), []);
  const ret = {};
  keys.forEach(key => {
    if (b.hasOwnProperty(key)) {
      ret[key] = b[key];
    } else {
      ret[key] = onRemove(key);
    }
  });

  return ret;
}

// TODO: refactor common logic with updateCurrVals and updateCurrV
function interpolateVals(alpha, nextVals, prevVals) {
  if (nextVals === null) {
    return null;
  }
  if (prevVals == null) {
    return nextVals;
  }
  if (nextVals._isReactElement) {
    return nextVals;
  }
  if (typeof nextVals === 'number') {
    return nextVals * alpha + prevVals * (1 - alpha);
  }
  if (nextVals.val != null && nextVals.config && nextVals.config.length === 0) {
    return nextVals;
  }
  if (nextVals.val != null) {
    return {
      val: interpolateVals(alpha, nextVals.val, prevVals.val),
      config: nextVals.config,
    };
  }
  if (Array.isArray(nextVals)) {
    return nextVals.map((_, i) => interpolateVals(alpha, nextVals[i], prevVals[i]));
  }
  if (Object.prototype.toString.call(nextVals) === '[object Object]') {
    const ret = {};
    Object.keys(nextVals).forEach(key => {
      ret[key] = interpolateVals(alpha, nextVals[key], prevVals[key]);
    });
    return ret;
  }
  return nextVals;
}

// TODO: refactor common logic with updateCurrV
export function updateCurrVals(frameRate, currVals, currV, endValue, k, b) {
  if (endValue === null) {
    return null;
  }
  if (typeof endValue === 'number') {
    if (k == null || b == null) {
      return endValue;
    }
    // TODO: do something to stepper to make this not allocate (2 steppers?)
    return stepper(frameRate, currVals, currV, endValue, k, b)[0];
  }
  if (endValue.val != null && endValue.config && endValue.config.length === 0) {
    return endValue;
  }
  if (endValue.val != null) {
    const [_k, _b] = endValue.config || [170, 26];
    let ret = {
      val: updateCurrVals(frameRate, currVals.val, currV.val, endValue.val, _k, _b),
    };
    if (endValue.config) {
      ret.config = endValue.config;
    }
    return ret;
  }
  if (Array.isArray(endValue)) {
    return endValue.map((_, i) => updateCurrVals(frameRate, currVals[i], currV[i], endValue[i], k, b));
  }
  if (isPlainObject(endValue)) {
    const ret = {};
    Object.keys(endValue).forEach(key => {
      ret[key] = updateCurrVals(frameRate, currVals[key], currV[key], endValue[key], k, b);
    });
    return ret;
  }
  return endValue;
}

export function updateCurrV(frameRate, currVals, currV, endValue, k, b) {
  if (endValue === null) {
    return null;
  }
  if (typeof endValue === 'number') {
    if (k == null || b == null) {
      return mapTree(zero, currV);
    }
    // TODO: do something to stepper to make this not allocate (2 steppers?)
    return stepper(frameRate, currVals, currV, endValue, k, b)[1];
  }
  if (endValue.val != null && endValue.config && endValue.config.length === 0) {
    return mapTree(zero, currV);
  }
  if (endValue.val != null) {
    const [_k, _b] = endValue.config || [170, 26];
    let ret = {
      val: updateCurrV(frameRate, currVals.val, currV.val, endValue.val, _k, _b),
    };
    if (endValue.config) {
      ret.config = endValue.config;
    }
    return ret;
  }
  if (Array.isArray(endValue)) {
    return endValue.map((_, i) => updateCurrV(frameRate, currVals[i], currV[i], endValue[i], k, b));
  }
  if (isPlainObject(endValue)) {
    const ret = {};
    Object.keys(endValue).forEach(key => {
      ret[key] = updateCurrV(frameRate, currVals[key], currV[key], endValue[key], k, b);
    });
    return ret;
  }
  return mapTree(zero, currV);
}

export function noSpeed(coll) {
  if (Array.isArray(coll)) {
    return coll.every(noSpeed);
  }
  if (isPlainObject(coll)) {
    return Object.keys(coll).every(key => key === 'config' ? true : noSpeed(coll[key]));
  }
  return typeof coll === 'number' ? coll === 0 : true;
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
      endValue = endValue();
    }
    return {
      currVals: endValue,
      currV: mapTree(zero, endValue),
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
        this.animationStep, this.animationRender, this.state
      );
      animationLoop.start();
    }
  },

  animationStep(timeStep, state) {
    const {currVals, currV} = state;
    let {endValue} = this.props;

    if (typeof endValue === 'function') {
      endValue = endValue(currVals);
    }

    const nextVals = updateCurrVals(timeStep, currVals, currV, endValue);
    const nextV = updateCurrV(timeStep, currVals, currV, endValue);

    if (noSpeed(currV) && noSpeed(nextV)) {
      this.unsubscribeAnimation();
      this.unsubscribeAnimation = undefined;
    }

    return {
      currVals: nextVals,
      currV: nextV,
    };
  },

  animationRender(alpha, nextState, prevState) {
    this.setState({
      currVals: interpolateVals(alpha, nextState.currVals, prevState.currVals),
      currV: nextState.currV,
    });
  },

  render() {
    const {currVals} = this.state;
    return React.Children.only(this.props.children(currVals));
  },
});

export const TransitionSpring = React.createClass({
  propTypes: {
    endValue: PropTypes.oneOfType([
      PropTypes.func,
      PropTypes.object,
      // coming soon
      // PropTypes.arrayOf(PropTypes.shape({
      //   key: PropTypes.any.isRequired,
      // })),
      // PropTypes.arrayOf(PropTypes.element),
    ]).isRequired,
    willLeave: PropTypes.oneOfType([
      PropTypes.func,
      PropTypes.object,
      PropTypes.array,
      // TODO: numbers? strings?
    ]),
    willEnter: PropTypes.oneOfType([
      PropTypes.func,
      PropTypes.object,
      PropTypes.array,
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
      currVals: endValue,
      currV: mapTree(zero, endValue),
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
        this.animationStep, this.animationRender, this.state
      );
      animationLoop.start();
    }
  },

  animationStep(timeStep, state) {
    let {currVals, currV} = state;
    let {endValue} = this.props;
    const {willEnter, willLeave} = this.props;

    if (typeof endValue === 'function') {
      endValue = endValue(currVals);
    }

    let mergedVals;

    if (Array.isArray(endValue)) {
      let currValsObj = {};
      currVals.forEach(objWithKey => {
        currValsObj[objWithKey.key] = objWithKey;
      });

      let endValueObj = {};
      endValue.forEach(objWithKey => {
        endValueObj[objWithKey.key] = objWithKey;
      });
      let currVObj = {};
      endValue.forEach(objWithKey => {
        currVObj[objWithKey.key] = objWithKey;
      });

      const mergedValsObj = mergeDiffObj(
        currValsObj,
        endValueObj,
        key => willLeave(key, endValue, currVals, currV)
      );

      let mergedValsKeys = Object.keys(mergedValsObj);
      mergedVals = mergedValsKeys.map(key => mergedValsObj[key]);
      mergedValsKeys
        .filter(key => !currValsObj.hasOwnProperty(key))
        .forEach(key => {
          currValsObj[key] = willEnter(key, mergedValsObj[key], endValue, currVals, currV);
          currVObj[key] = mapTree(zero, currValsObj[key]);
        });

      currVals = Object.keys(currValsObj).map(key => currValsObj[key]);
      currV = Object.keys(currVObj).map(key => currVObj[key]);
    } else {
      // only other option is obj
      mergedVals = mergeDiffObj(
        currVals,
        endValue,
        // TODO: stop allocating like crazy in this whole code path
        key => willLeave(key, endValue, currVals, currV)
      );

      // TODO: check if this is necessary
      currVals = clone(currVals);
      currV = clone(currV);
      Object.keys(mergedVals)
        .filter(key => !currVals.hasOwnProperty(key))
        .forEach(key => {
          // TODO: param format changed, check other demos
          currVals[key] = willEnter(key, mergedVals[key], endValue, currVals, currV);
          currV[key] = mapTree(zero, currVals[key]);
        });
    }

    const nextVals = updateCurrVals(timeStep, currVals, currV, mergedVals);
    const nextV = updateCurrV(timeStep, currVals, currV, mergedVals);

    if (noSpeed(currV) && noSpeed(nextV)) {
      this.unsubscribeAnimation();
      this.unsubscribeAnimation = undefined;
    }

    return {
      currVals: nextVals,
      currV: nextV,
    };
  },

  animationRender(alpha, nextState, prevState) {
    this.setState({
      currVals: interpolateVals(alpha, nextState.currVals, prevState.currVals),
      currV: nextState.currV,
    });
  },

  render() {
    const {currVals} = this.state;
    return React.Children.only(this.props.children(currVals));
  },
});

function reorderKeys(obj, f) {
  const ret = {};
  f(Object.keys(obj)).forEach(key => {
    ret[key] = obj[key];
  });
  return ret;
}

export const utils = {
  reorderKeys,
};
