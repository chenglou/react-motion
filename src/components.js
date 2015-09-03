import mapTree from './mapTree';
import noVelocity from './noVelocity';
import compareTrees from './compareTrees';
import mergeDiff from './mergeDiff';
import configAnimation from './animationLoop';
import zero from './zero';
import {interpolateValue, updateCurrValue, updateCurrVelocity} from './updateTree';
import presets from './presets';
import stepper from './stepper';


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

        // We can mutate this here because mergeDiff returns a new Obj
        mergedValue[key] = enterValue;

        currValue = {
          ...currValue,
          [key]: enterValue,
        };
        currVelocity = {
          ...currVelocity,
          [key]: mapTree(zero, enterValue),
        };
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

// temporary forks of updateCurrVal, updateCurrVelocity and animationStep
// don't be scared by the amount of code! It's mostly duplicate for now
function updateCurrentStyle(frameRate, currentStyle, currentVelocity, style) {
  let ret = {};
  for (let key in style) {
    if (!style.hasOwnProperty(key)) {
      continue;
    }
    if (!style[key].config) {
      ret[key] = style[key];
      // not a spring config, not something we want to interpolate
      continue;
    }
    const [k, b] = style[key].config;
    const val = stepper(
      frameRate,
      currentStyle[key].val,
      currentVelocity[key],
      style[key].val,
      k,
      b,
    )[0];
    ret[key] = {
      val: val,
      config: style[key].config,
    };
  }
  return ret;
}

function updateCurrentVelocity(frameRate, currentStyle, currentVelocity, style) {
  let ret = {};
  for (let key in style) {
    if (!style.hasOwnProperty(key)) {
      continue;
    }
    if (!style[key].config) {
      // not a spring config, not something we want to interpolate
      ret[key] = style[key];
      continue;
    }
    const [k, b] = style[key].config;
    const val = stepper(
      frameRate,
      currentStyle[key].val,
      currentVelocity[key],
      style[key].val,
      k,
      b,
    )[1];
    ret[key] = val;
  }
  return ret;
}

// Temporary new loop for the Motion component
function animationStepMotion(shouldMerge, stopAnimation, getProps, timestep, state) {
  let {currentStyle, currentVelocity} = state;
  let {style} = getProps();

  const newCurrentStyle =
    updateCurrentStyle(timestep, currentStyle, currentVelocity, style);
  const newCurrentVelocity =
    updateCurrentVelocity(timestep, currentStyle, currentVelocity, style);

  if (noVelocity(currentVelocity) && noVelocity(newCurrentVelocity)) {
    // check explanation in `Motion.animationRender`
    stopAnimation(); // Nasty side effects....
  }

  return {
    currentStyle: newCurrentStyle,
    currentVelocity: newCurrentVelocity,
  };
}

function mapObject(f, obj) {
  let ret = {};
  for (let key in obj) {
    if (!obj.hasOwnProperty(key)) {
      continue;
    }
    ret[key] = f(obj[key], key);
  }
  return ret;
}

// instead of exposing {val: bla, config: bla}, use a helper
function spring(val, config = presets.noWobble) {
  return {val, config};
}

let hasWarnedForSpring = false;
// let hasWarnedForTransitionSpring = false;

export default function components(React) {
  const {PropTypes} = React;

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

    componentWillMount() {
      if (process.env.NODE_ENV === 'development') {
        if (!hasWarnedForSpring) {
          hasWarnedForSpring = true;
          // TODO: check props, provide more descriptive warning.
          console.error(
            `Spring has now been renamed to Motion. Please see the release note
for the upgrade path. Thank you!`
          );
        }
      }
    },

    render() {
      return null;
    },
  });

  // this is mostly the same code as SPring, again, temporary!
  const Motion = React.createClass({
    propTypes: {
      defaultStyle: PropTypes.object,
      style: PropTypes.object,
      children: PropTypes.func,
    },

    getInitialState() {
      const {defaultStyle, style} = this.props;
      const currentStyle = defaultStyle || style;
      return {
        currentStyle: currentStyle,
        currentVelocity: mapObject(zero, currentStyle),
      };
    },

    componentDidMount() {
      this.animationStep = animationStepMotion.bind(
        null,
        false,
        () => this.stopAnimation(),
        () => this.props,
      );
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
      // user does some checks in `style` and calls an owner handler
      // owner sets state in the callback, triggering a re-render
      // re-render unmounts the Spring
      if (!this.hasUnmounted) {
        this.setState({
          currentStyle: interpolateValue(
            alpha,
            nextState.currentStyle,
            prevState.currentStyle,
          ),
          currentVelocity: nextState.currentVelocity,
        });
      }
    },

    render() {
      const renderedChildren = this.props.children(this.state.currentStyle);
      return renderedChildren && React.Children.only(renderedChildren);
    },
  });


  // TODO: warn when obj uses numerical keys
  // TODO: warn when endValue doesn't contain a val
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
      this.hasUnmounted = true;
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

  return {Spring, TransitionSpring, Motion, spring};
}
