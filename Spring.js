import React, {PropTypes} from 'react';
import {mapTree, clone} from './utils';
import stepper from './stepper';
import createAnimationLoop from './src/animationLoop';

// ---------
const animationLoop = createAnimationLoop({
  timeStep: 1000 / 60, // ms
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

// TODO: tests
function updateState(state, endValue, timeStep, k, b) {
  const {currVals, currV} = state;

  if (endValue === null) {
    return {
      currVals: null,
      currV: null,
    };
  }

  if (endValue._isReactElement) {
    return {
      currVals: endValue,
      currV: endValue,
    };
  }

  if (typeof endValue === 'number') {
    if (k == null || b == null) {
      return {
        currVals: endValue,
        currV: mapTree(zero, currV),
      };
    }

    const [x, v] = stepper(timeStep, currVals, currV, endValue, k, b);

    return {
      currVals: x,
      currV: v,
    };
  }

  if (endValue.val != null && endValue.config && endValue.config.length === 0) {
    return {
      currVals: endValue,
      currV: mapTree(zero, currV),
    };
  }

  if (endValue.val != null) {
    const [_k, _b] = endValue.config || [170, 26];

    const tempState = updateState({
      currVals: currVals.val,
      currV: currV.val,
    }, endValue.val, timeStep, _k, _b);

    return {
      currVals: {
        val: tempState.currVals,
        config: endValue.config,
      },
      currV: {
        val: tempState.currV,
        config: endValue.config,
      },
    };
  }

  if (Array.isArray(endValue)) {
    return endValue.reduce(
      (ret, _, i) => {
        const tempState = updateState({
          currVals: currVals[i],
          currV: currV[i],
        }, endValue[i], timeStep, k, b);

        ret.currVals.push(tempState.currVals);
        ret.currV.push(tempState.currV);

        return ret;
      },
      {
        currVals: [],
        currV: [],
      }
    );
  }

  if (Object.prototype.toString.call(endValue) === '[object Object]') {
    const ret = {
      currVals: {},
      currV: {},
    };
    Object.keys(endValue).forEach(key => {
      const tempState = updateState({
        currVals: currVals[key],
        currV: currV[key],
      }, endValue[key], timeStep, k, b);

      ret.currVals[key] = tempState.currVals;
      ret.currV[key] = tempState.currV;
    });
    return ret;
  }

  return {
    currVals: endValue,
    currV: mapTree(zero, currV),
  };
}

function noSpeed(coll) {
  if (Array.isArray(coll)) {
    return coll.every(noSpeed);
  }
  if (Object.prototype.toString.call(coll) === '[object Object]') {
    return Object.keys(coll).every(key => key === 'config' ? true : noSpeed(coll[key]));
  }
  return coll === 0;
}


const Spring = React.createClass({
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
        this.state, this.animationStep, this.animationRender
      );
      animationLoop.start();
    }
  },

  animationStep(state, timeStep) {
    const {currVals, currV} = state;
    let {endValue} = this.props;

    if (typeof endValue === 'function') {
      endValue = endValue(currVals);
    }

    const nextState = updateState(state, endValue, timeStep / 1000);

    if (noSpeed(currV) && noSpeed(nextState.currV)) {
      this.unsubscribeAnimation();
      this.unsubscribeAnimation = undefined;
    }

    return nextState;
  },

  animationRender(state) {
    // TODO: Interpolation
    this.setState(state);
  },

  render() {
    const {currVals} = this.state;
    return React.Children.only(this.props.children(currVals));
  },
});


export default Spring;


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
      willEnter: (key, endValue) => endValue[key],
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
        this.state, this.animationStep, this.animationRender
      );
      animationLoop.start();
    }
  },

  animationStep(state, timeStep) {
    let {currVals, currV} = state;
    let {endValue} = this.props;
    const {willEnter, willLeave} = this.props;

    if (typeof endValue === 'function') {
      endValue = endValue(currVals);
    }

    const mergedVals = mergeDiffObj(
      currVals,
      endValue,
      key => willLeave(key, endValue, currVals, currV)
    );

    currVals = clone(currVals);
    currV = clone(currV);
    Object.keys(mergedVals)
      .filter(key => !currVals.hasOwnProperty(key))
      .forEach(key => {
        currVals[key] = willEnter(key, endValue, currVals, currV);
        currV[key] = mapTree(zero, currVals[key]);
      });

    const nextState = updateState({currVals, currV}, mergedVals, timeStep / 1000);

    if (noSpeed(currV) && noSpeed(nextState.currV)) {
      this.unsubscribeAnimation();
      this.unsubscribeAnimation = undefined;
    }

    return nextState;
  },

  animationRender(state) {
    // TODO: Interpolation
    this.setState(state);
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
