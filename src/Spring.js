import React, {PropTypes} from 'react';
import mapTree from './mapTree';
import noVelocity from './noVelocity';
import mergeDiff from './mergeDiff';
import configAnimation from './animationLoop';
import zero from './zero';
import {interpolateValue, updateCurrValue, updateCurrVelocity} from './updateTree';

const startAnimation = configAnimation();

function animationStep(shouldMerge, stopAnimation, getProps, timestep, state) {
  let {currValue, currVelocity} = state;
  let {willEnter, willLeave, endValue} = getProps();

  if (typeof endValue === 'function') {
    endValue = endValue(currValue);
  }

  let mergedValue = endValue; // set mergedValue to endValue as the default
  let hasNewKey = false;

  if (shouldMerge) {
    mergedValue = mergeDiff(
      currValue,
      endValue,
      // TODO: stop allocating like crazy in this whole code path
      key => willLeave(key, currValue[key], endValue, currValue, currVelocity)
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
  }

  const newCurrValue = updateCurrValue(timestep, currValue, currVelocity, mergedValue);
  const newCurrVelocity = updateCurrVelocity(timestep, currValue, currVelocity, mergedValue);

  if (!hasNewKey && noVelocity(currVelocity) && noVelocity(newCurrVelocity)) {
    // check explanation in `Spring.animationRender`
    stopAnimation(); // Nasty side effects....
  }

  return {
    currValue: newCurrValue,
    currVelocity: newCurrVelocity,
  };
}

export const Spring = React.createClass({
  propTypes: {
    defaultValue: PropTypes.oneOfType([
      PropTypes.object,
      PropTypes.array,
    ]),
    endValue: PropTypes.oneOfType([
      PropTypes.func,
      PropTypes.object,
      PropTypes.array,
    ]).isRequired,
    children: PropTypes.func.isRequired,
  },

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
    return {
      currValue: currValue,
      currVelocity: mapTree(zero, currValue),
    };
  },

  componentDidMount() {
    this.animationStep = animationStep.bind(null, false, () => this.stopAnimation(), () => this.props);
    this.startAnimating();
  },

  componentWillReceiveProps() {
    this.startAnimating();
  },

  stopAnimation: null,

  // used in animationRender
  hasUnmounted: false,

  animationStep: null,

  componentWillUnmount() {
    this.stopAnimation();
    this.hasUnmounted = true;
  },

  startAnimating() {
    // Is smart enough to not start it twice
    this.stopAnimation = startAnimation(
      this.state,
      this.animationStep,
      this.animationRender,
    );
  },

  animationRender(alpha, nextState, prevState) {
    // `this.hasUnmounted` might be true in the following condition:
    // user does some checks in `endValue` and calls an owner handler
    // owner sets state in the callback, triggering a re-render
    // re-render unmounts the Spring
    if (!this.hasUnmounted) {
      this.setState({
        currValue: interpolateValue(alpha, nextState.currValue, prevState.currValue),
        currVelocity: nextState.currVelocity,
      });
    }
  },

  render() {
    const renderedChildren = this.props.children(this.state.currValue);
    return renderedChildren && React.Children.only(renderedChildren);
  },
});

export const TransitionSpring = React.createClass({
  propTypes: {
    defaultValue: PropTypes.objectOf(PropTypes.any),
    endValue: PropTypes.oneOfType([
      PropTypes.func,
      PropTypes.objectOf(PropTypes.any.isRequired),
      // coming soon
      // PropTypes.arrayOf(PropTypes.shape({
      //   key: PropTypes.any.isRequired,
      // })),
      // PropTypes.arrayOf(PropTypes.element),
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
    return {
      currValue: currValue,
      currVelocity: mapTree(zero, currValue),
    };
  },

  componentDidMount() {
    this.animationStep = animationStep.bind(null, true, () => this.stopAnimation(), () => this.props);
    this.startAnimating();
  },

  componentWillReceiveProps() {
    this.startAnimating();
  },

  stopAnimation: null,

  // used in animationRender
  hasUnmounted: false,

  animationStep: null,

  componentWillUnmount() {
    this.stopAnimation();
  },

  startAnimating() {
    this.stopAnimation = startAnimation(
      this.state,
      this.animationStep,
      this.animationRender,
    );
  },

  animationRender(alpha, nextState, prevState) {
    // See comment in Spring.
    if (!this.hasUnmounted) {
      this.setState({
        currValue: interpolateValue(alpha, nextState.currValue, prevState.currValue),
        currVelocity: nextState.currVelocity,
      });
    }
  },

  render() {
    const renderedChildren = this.props.children(this.state.currValue);
    return renderedChildren && React.Children.only(renderedChildren);
  },
});
