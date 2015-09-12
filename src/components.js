import noVelocity from './noVelocity';
import hasReachedStyle from './hasReachedStyle';
import mergeDiff from './mergeDiff';
import configAnimation from './animationLoop';
import zero from './zero';
import {interpolateValue, updateCurrentStyle, updateCurrentVelocity} from './updateTree';
import presets from './presets';
import deprecatedSprings from './deprecatedSprings';

const startAnimation = configAnimation();

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

function everyObj(f, obj) {
  for (let key in obj) {
    if (!obj.hasOwnProperty(key)) {
      continue;
    }
    if (!f(obj[key], key)) {
      return false;
    }
  }
  return true;
}

function animationStepMotion(stopAnimation, getProps, timestep, state) {
  let {currentStyle, currentVelocity} = state;
  let {style} = getProps();

  const newCurrentStyle =
    updateCurrentStyle(timestep, currentStyle, currentVelocity, style);
  const newCurrentVelocity =
    updateCurrentVelocity(timestep, currentStyle, currentVelocity, style);

  if (noVelocity(currentVelocity, newCurrentStyle) &&
      noVelocity(newCurrentVelocity, newCurrentStyle)) {
    // check explanation in `Motion.animationRender`
    stopAnimation(); // Nasty side effects....
  }

  return {
    currentStyle: newCurrentStyle,
    currentVelocity: newCurrentVelocity,
  };
}

function animationStepTransitionMotion(stopAnimation, getProps, timestep, state) {
  let {currentStyles, currentVelocities} = state;
  let {styles, willEnter, willLeave} = getProps();

  if (typeof styles === 'function') {
    styles = styles(currentStyles);
  }

  let mergedStyles = styles; // set mergedStyles to styles as the default
  let hasNewKey = false;

  mergedStyles = mergeDiff(
    currentStyles,
    styles,
    // TODO: stop allocating like crazy in this whole code path
    key => {
      const res = willLeave(key, currentStyles[key], styles, currentStyles, currentVelocities);
      if (res == null) {
        // For legacy reason. We won't allow returning null soon
        // TODO: remove, after next release
        return null;
      }

      if (noVelocity(currentVelocities[key], currentStyles[key]) &&
          hasReachedStyle(currentStyles[key], res)) {
        return null;
      }
      return res;
    }
  );

  Object.keys(mergedStyles)
    .filter(key => !currentStyles.hasOwnProperty(key))
    .forEach(key => {
      hasNewKey = true;
      const enterStyle = willEnter(key, mergedStyles[key], styles, currentStyles, currentVelocities);

      // We can mutate this here because mergeDiff returns a new Obj
      mergedStyles[key] = enterStyle;

      currentStyles = {
        ...currentStyles,
        [key]: enterStyle,
      };
      currentVelocities = {
        ...currentVelocities,
        [key]: mapObject(zero, enterStyle),
      };
    });

  const newCurrentStyles = mapObject((mergedStyle, key) => {
    return updateCurrentStyle(timestep, currentStyles[key], currentVelocities[key], mergedStyle);
  }, mergedStyles);
  const newCurrentVelocities = mapObject((mergedStyle, key) => {
    return updateCurrentVelocity(timestep, currentStyles[key], currentVelocities[key], mergedStyle);
  }, mergedStyles);

  if (!hasNewKey &&
      everyObj((v, k) => noVelocity(v, currentStyles[k]), currentVelocities) &&
      everyObj((v, k) => noVelocity(v, newCurrentStyles[k]), newCurrentVelocities)) {
    // check explanation in `Motion.animationRender`
    stopAnimation(); // Nasty side effects....
  }

  return {
    currentStyles: newCurrentStyles,
    currentVelocities: newCurrentVelocities,
  };
}

// instead of exposing {val: bla, config: bla}, use a helper
function spring(val, config = presets.noWobble) {
  return {val, config};
}

// turn {x: {val: 1, config: [1, 2]}, y: 2} into {x: 1, y: 2}
function stripStyle(style) {
  let ret = {};
  for (let key in style) {
    if (!style.hasOwnProperty(key)) {
      continue;
    }
    ret[key] = style[key].val == null ? style[key] : style[key].val;
  }
  return ret;
}

export default function components(React) {
  const {PropTypes} = React;

  const Motion = React.createClass({
    // TODO: check props, provide more descriptive warning.
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
      // unmounts Motion
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
      const strippedStyle = stripStyle(this.state.currentStyle);
      const renderedChildren = this.props.children(strippedStyle);
      return renderedChildren && React.Children.only(renderedChildren);
    },
  });


  // TODO: warn when obj uses numerical keys
  // TODO: warn when endValue doesn't contain a val
  const TransitionMotion = React.createClass({
    propTypes: {
      defaultStyles: PropTypes.objectOf(PropTypes.any),
      // TODO: warn for style
      styles: PropTypes.oneOfType([
        PropTypes.func,
        PropTypes.objectOf(PropTypes.any.isRequired),
      ]).isRequired,
      willLeave: PropTypes.oneOfType([
        PropTypes.func,
      ]),
      willEnter: PropTypes.oneOfType([
        PropTypes.func,
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
      const {styles, defaultStyles} = this.props;
      let currentStyles;
      if (defaultStyles == null) {
        if (typeof styles === 'function') {
          currentStyles = styles();
        } else {
          currentStyles = styles;
        }
      } else {
        currentStyles = defaultStyles;
      }
      return {
        currentStyles: currentStyles,
        currentVelocities: mapObject(s => mapObject(zero, s), currentStyles),
      };
    },

    componentDidMount() {
      this.animationStep = animationStepTransitionMotion.bind(
        null,
        () => this.stopAnimation(),
        () => this.props,
      );
      this.startAnimating();
    },

    componentWillReceiveProps() {
      this.startAnimating();
      // TODO: accept PR.
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
      // See comment in Motion.
      if (!this.hasUnmounted) {
        this.setState({
          currentStyles: interpolateValue(
            alpha,
            nextState.currentStyles,
            prevState.currentStyles,
          ),
          currentVelocities: nextState.currentVelocities,
        });
      }
    },

    render() {
      const strippedStyle = mapObject(stripStyle, this.state.currentStyles);
      const renderedChildren = this.props.children(strippedStyle);
      return renderedChildren && React.Children.only(renderedChildren);
    },
  });

  const {Spring, TransitionSpring} = deprecatedSprings(React);

  return {Spring, TransitionSpring, Motion, TransitionMotion, spring};
}
