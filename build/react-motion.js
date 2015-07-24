(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("react"));
	else if(typeof define === 'function' && define.amd)
		define(["react"], factory);
	else if(typeof exports === 'object')
		exports["ReactMotion"] = factory(require("react"));
	else
		root["ReactMotion"] = factory(root["React"]);
})(this, function(__WEBPACK_EXTERNAL_MODULE_3__) {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "build/";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	exports.__esModule = true;
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }
	
	var _reorderKeys = __webpack_require__(1);
	
	var _reorderKeys2 = _interopRequireDefault(_reorderKeys);
	
	var _Spring = __webpack_require__(2);
	
	exports.Spring = _Spring.Spring;
	exports.TransitionSpring = _Spring.TransitionSpring;
	var utils = {
	  reorderKeys: _reorderKeys2['default']
	};
	exports.utils = utils;

/***/ },
/* 1 */
/***/ function(module, exports) {

	"use strict";
	
	exports.__esModule = true;
	exports["default"] = reorderKeys;
	
	function reorderKeys(obj, f) {
	  return f(Object.keys(obj)).reduce(function (ret, key) {
	    ret[key] = obj[key];
	    return ret;
	  }, {});
	}
	
	module.exports = exports["default"];

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	exports.__esModule = true;
	exports.updateCurrValue = updateCurrValue;
	exports.updateCurrVelocity = updateCurrVelocity;
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }
	
	var _react = __webpack_require__(3);
	
	var _react2 = _interopRequireDefault(_react);
	
	var _mapTree = __webpack_require__(4);
	
	var _mapTree2 = _interopRequireDefault(_mapTree);
	
	var _lodashIsplainobject = __webpack_require__(5);
	
	var _lodashIsplainobject2 = _interopRequireDefault(_lodashIsplainobject);
	
	var _stepper = __webpack_require__(10);
	
	var _stepper2 = _interopRequireDefault(_stepper);
	
	var _noVelocity = __webpack_require__(11);
	
	var _noVelocity2 = _interopRequireDefault(_noVelocity);
	
	var _mergeDiff = __webpack_require__(12);
	
	var _mergeDiff2 = _interopRequireDefault(_mergeDiff);
	
	var _animationLoop = __webpack_require__(13);
	
	var _animationLoop2 = _interopRequireDefault(_animationLoop);
	
	var animationLoop = _animationLoop2['default']({
	  // Fixed time step in seconds.
	  timeStep: 1 / 60,
	  // Slow-mo anyone? Give 0.1 a try.
	  timeScale: 1,
	  // Pause if we have more than this many steps worth of accumulated time.
	  maxSteps: 10
	});
	
	function zero() {
	  return 0;
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
	    var ret = {
	      val: interpolateValue(alpha, nextValue.val, prevValue.val)
	    };
	    if (nextValue.config) {
	      ret.config = nextValue.config;
	    }
	    return ret;
	  }
	  if (Array.isArray(nextValue)) {
	    return nextValue.map(function (_, i) {
	      return interpolateValue(alpha, nextValue[i], prevValue[i]);
	    });
	  }
	  if (_lodashIsplainobject2['default'](nextValue)) {
	    return Object.keys(nextValue).reduce(function (ret, key) {
	      ret[key] = interpolateValue(alpha, nextValue[key], prevValue[key]);
	      return ret;
	    }, {});
	  }
	  return nextValue;
	}
	
	// TODO: refactor common logic with updateCurrVelocity
	
	function updateCurrValue(frameRate, currValue, currVelocity, endValue, k, b) {
	  if (endValue === null) {
	    return null;
	  }
	  if (typeof endValue === 'number') {
	    if (k == null || b == null) {
	      return endValue;
	    }
	    // TODO: do something to stepper to make this not allocate (2 steppers?)
	    return _stepper2['default'](frameRate, currValue, currVelocity, endValue, k, b)[0];
	  }
	  if (endValue.val != null && endValue.config && endValue.config.length === 0) {
	    return endValue;
	  }
	  if (endValue.val != null) {
	    var _ref = endValue.config || [170, 26];
	
	    var _k = _ref[0];
	    var _b = _ref[1];
	
	    var ret = {
	      val: updateCurrValue(frameRate, currValue.val, currVelocity.val, endValue.val, _k, _b)
	    };
	    if (endValue.config) {
	      ret.config = endValue.config;
	    }
	    return ret;
	  }
	  if (Array.isArray(endValue)) {
	    return endValue.map(function (_, i) {
	      return updateCurrValue(frameRate, currValue[i], currVelocity[i], endValue[i], k, b);
	    });
	  }
	  if (_lodashIsplainobject2['default'](endValue)) {
	    return Object.keys(endValue).reduce(function (ret, key) {
	      ret[key] = updateCurrValue(frameRate, currValue[key], currVelocity[key], endValue[key], k, b);
	      return ret;
	    }, {});
	  }
	  return endValue;
	}
	
	function updateCurrVelocity(frameRate, currValue, currVelocity, endValue, k, b) {
	  if (endValue === null) {
	    return null;
	  }
	  if (typeof endValue === 'number') {
	    if (k == null || b == null) {
	      return _mapTree2['default'](zero, currVelocity);
	    }
	    // TODO: do something to stepper to make this not allocate (2 steppers?)
	    return _stepper2['default'](frameRate, currValue, currVelocity, endValue, k, b)[1];
	  }
	  if (endValue.val != null && endValue.config && endValue.config.length === 0) {
	    return _mapTree2['default'](zero, currVelocity);
	  }
	  if (endValue.val != null) {
	    var _ref2 = endValue.config || [170, 26];
	
	    var _k = _ref2[0];
	    var _b = _ref2[1];
	
	    var ret = {
	      val: updateCurrVelocity(frameRate, currValue.val, currVelocity.val, endValue.val, _k, _b)
	    };
	    if (endValue.config) {
	      ret.config = endValue.config;
	    }
	    return ret;
	  }
	  if (Array.isArray(endValue)) {
	    return endValue.map(function (_, i) {
	      return updateCurrVelocity(frameRate, currValue[i], currVelocity[i], endValue[i], k, b);
	    });
	  }
	  if (_lodashIsplainobject2['default'](endValue)) {
	    return Object.keys(endValue).reduce(function (ret, key) {
	      ret[key] = updateCurrVelocity(frameRate, currValue[key], currVelocity[key], endValue[key], k, b);
	      return ret;
	    }, {});
	  }
	  return _mapTree2['default'](zero, currVelocity);
	}
	
	var Spring = _react2['default'].createClass({
	  displayName: 'Spring',
	
	  propTypes: {
	    endValue: _react.PropTypes.oneOfType([_react.PropTypes.func, _react.PropTypes.object, _react.PropTypes.array]).isRequired,
	    children: _react.PropTypes.func.isRequired
	  },
	
	  getInitialState: function getInitialState() {
	    var endValue = this.props.endValue;
	
	    if (typeof endValue === 'function') {
	      // TODO: provide warning for failing to provide base case
	      endValue = endValue();
	    }
	    return {
	      currValue: endValue,
	      currVelocity: _mapTree2['default'](zero, endValue)
	    };
	  },
	
	  componentDidMount: function componentDidMount() {
	    this.startAnimating();
	  },
	
	  componentWillReceiveProps: function componentWillReceiveProps() {
	    this.startAnimating();
	  },
	
	  unsubscribeAnimation: null,
	
	  // used in animationRender
	  hasUnmounted: false,
	
	  componentWillUnmount: function componentWillUnmount() {
	    if (this.unsubscribeAnimation) {
	      this.unsubscribeAnimation();
	      this.unsubscribeAnimation = null;
	    }
	    this.hasUnmounted = true;
	  },
	
	  startAnimating: function startAnimating() {
	    if (!this.unsubscribeAnimation) {
	      // means we're not animating
	      this.unsubscribeAnimation = animationLoop.subscribe(this.animationStep, this.animationRender, this.state);
	      animationLoop.start();
	    }
	  },
	
	  animationStep: function animationStep(timeStep, state) {
	    var currValue = state.currValue;
	    var currVelocity = state.currVelocity;
	    var endValue = this.props.endValue;
	
	    if (typeof endValue === 'function') {
	      endValue = endValue(currValue);
	    }
	
	    var newCurrValue = updateCurrValue(timeStep, currValue, currVelocity, endValue);
	    var newCurrVelocity = updateCurrVelocity(timeStep, currValue, currVelocity, endValue);
	
	    if (_noVelocity2['default'](currVelocity) && _noVelocity2['default'](newCurrVelocity)) {
	      // check explanation in `animationRender`
	      if (!this.hasUnmounted) {
	        this.unsubscribeAnimation();
	        this.unsubscribeAnimation = null;
	      }
	    }
	
	    return {
	      currValue: newCurrValue,
	      currVelocity: newCurrVelocity
	    };
	  },
	
	  animationRender: function animationRender(alpha, nextState, prevState) {
	    // `this.hasUnmounted` might be true in the following condition:
	    // user does some checks in `endValue` and calls an owner handler
	    // owner sets state in the callback, triggering a re-render
	    // re-render unmounts the Spring
	    if (!this.hasUnmounted) {
	      this.setState({
	        currValue: interpolateValue(alpha, nextState.currValue, prevState.currValue),
	        currVelocity: nextState.currVelocity
	      });
	    }
	  },
	
	  render: function render() {
	    var currValue = this.state.currValue;
	
	    return _react2['default'].Children.only(this.props.children(currValue));
	  }
	});
	
	exports.Spring = Spring;
	var TransitionSpring = _react2['default'].createClass({
	  displayName: 'TransitionSpring',
	
	  propTypes: {
	    endValue: _react.PropTypes.oneOfType([_react.PropTypes.func, _react.PropTypes.objectOf({
	      key: _react.PropTypes.any.isRequired
	    })]).
	    // coming soon
	    // PropTypes.arrayOf(PropTypes.shape({
	    //   key: PropTypes.any.isRequired,
	    // })),
	    // PropTypes.arrayOf(PropTypes.element),
	    isRequired,
	    willLeave: _react.PropTypes.oneOfType([_react.PropTypes.func]),
	
	    // PropTypes.object,
	    // PropTypes.array,
	    // TODO: numbers? strings?
	    willEnter: _react.PropTypes.oneOfType([_react.PropTypes.func]),
	
	    // PropTypes.object,
	    // PropTypes.array,
	    children: _react.PropTypes.func.isRequired
	  },
	
	  getDefaultProps: function getDefaultProps() {
	    return {
	      willEnter: function willEnter(key, value) {
	        return value;
	      },
	      willLeave: function willLeave() {
	        return null;
	      }
	    };
	  },
	
	  getInitialState: function getInitialState() {
	    var endValue = this.props.endValue;
	
	    if (typeof endValue === 'function') {
	      endValue = endValue();
	    }
	    return {
	      currValue: endValue,
	      currVelocity: _mapTree2['default'](zero, endValue)
	    };
	  },
	
	  componentDidMount: function componentDidMount() {
	    this.startAnimating();
	  },
	
	  componentWillReceiveProps: function componentWillReceiveProps() {
	    this.startAnimating();
	  },
	
	  unsubscribeAnimation: null,
	
	  // used in animationRender
	  hasUnmounted: false,
	
	  componentWillUnmount: function componentWillUnmount() {
	    if (this.unsubscribeAnimation) {
	      this.unsubscribeAnimation();
	      this.unsubscribeAnimation = undefined;
	    }
	  },
	
	  startAnimating: function startAnimating() {
	    if (!this.unsubscribeAnimation) {
	      this.unsubscribeAnimation = animationLoop.subscribe(this.animationStep, this.animationRender, this.state);
	      animationLoop.start();
	    }
	  },
	
	  animationStep: function animationStep(timeStep, state) {
	    var currValue = state.currValue;
	    var currVelocity = state.currVelocity;
	    var endValue = this.props.endValue;
	    var _props = this.props;
	    var willEnter = _props.willEnter;
	    var willLeave = _props.willLeave;
	
	    if (typeof endValue === 'function') {
	      endValue = endValue(currValue);
	    }
	
	    var mergedValue = undefined;
	    // only other option is obj
	    mergedValue = _mergeDiff2['default'](currValue, endValue,
	    // TODO: stop allocating like crazy in this whole code path
	    function (key) {
	      return willLeave(key, currValue[key], endValue, currValue, currVelocity);
	    });
	
	    var hasNewKey = false;
	    Object.keys(mergedValue).filter(function (key) {
	      return !currValue.hasOwnProperty(key);
	    }).forEach(function (key) {
	      hasNewKey = true;
	      var enterValue = willEnter(key, mergedValue[key], endValue, currValue, currVelocity);
	      currValue[key] = enterValue;
	      mergedValue[key] = enterValue;
	      currVelocity[key] = _mapTree2['default'](zero, currValue[key]);
	    });
	
	    var newCurrValue = updateCurrValue(timeStep, currValue, currVelocity, mergedValue);
	    var newCurrVelocity = updateCurrVelocity(timeStep, currValue, currVelocity, mergedValue);
	
	    if (_noVelocity2['default'](currVelocity) && _noVelocity2['default'](newCurrVelocity) && !hasNewKey) {
	      // check explanation in `Spring.animationRender`
	      if (!this.hasUnmounted) {
	        this.unsubscribeAnimation();
	        this.unsubscribeAnimation = undefined;
	      }
	    }
	
	    return {
	      currValue: newCurrValue,
	      currVelocity: newCurrVelocity
	    };
	  },
	
	  animationRender: function animationRender(alpha, nextState, prevState) {
	    // See comment in Spring.
	    if (!this.hasUnmounted) {
	      this.setState({
	        currValue: interpolateValue(alpha, nextState.currValue, prevState.currValue),
	        currVelocity: nextState.currVelocity
	      });
	    }
	  },
	
	  render: function render() {
	    var currValue = this.state.currValue;
	
	    return _react2['default'].Children.only(this.props.children(currValue));
	  }
	});
	exports.TransitionSpring = TransitionSpring;

/***/ },
/* 3 */
/***/ function(module, exports) {

	module.exports = __WEBPACK_EXTERNAL_MODULE_3__;

/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	exports.__esModule = true;
	exports['default'] = mapTree;
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }
	
	var _lodashIsplainobject = __webpack_require__(5);
	
	// currenly a helper used for producing a tree of the same shape as the
	// input(s),  but with different values. It's technically not a real `map`
	// equivalent for trees, since it skips calling f on non-numbers.
	
	// TODO: probably doesn't need path, stop allocating uselessly
	// TODO: don't need to map over many trees anymore
	// TODO: skipping non-numbers is weird and non-generic. Use pre-order traversal
	// assume trees are of the same shape
	
	var _lodashIsplainobject2 = _interopRequireDefault(_lodashIsplainobject);
	
	function _mapTree(path, f, trees) {
	  var t1 = trees[0];
	  if (typeof t1 === 'number') {
	    return f.apply(undefined, [path].concat(trees));
	  }
	  if (Array.isArray(t1)) {
	    return t1.map(function (_, i) {
	      return _mapTree([].concat(path, [i]), f, trees.map(function (val) {
	        return val[i];
	      }));
	    });
	  }
	  if (_lodashIsplainobject2['default'](t1)) {
	    return Object.keys(t1).reduce(function (newTree, key) {
	      newTree[key] = _mapTree([].concat(path, [key]), f, trees.map(function (val) {
	        return val[key];
	      }));
	      return newTree;
	    }, {});
	  }
	  // return last one just because
	  return trees[trees.length - 1];
	}
	
	function mapTree(f) {
	  for (var _len = arguments.length, rest = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
	    rest[_key - 1] = arguments[_key];
	  }
	
	  return _mapTree([], f, rest);
	}
	
	module.exports = exports['default'];

/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * lodash 3.2.0 (Custom Build) <https://lodash.com/>
	 * Build: `lodash modern modularize exports="npm" -o ./`
	 * Copyright 2012-2015 The Dojo Foundation <http://dojofoundation.org/>
	 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
	 * Copyright 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
	 * Available under MIT license <https://lodash.com/license>
	 */
	'use strict';
	
	var baseFor = __webpack_require__(6),
	    isArguments = __webpack_require__(7),
	    keysIn = __webpack_require__(8);
	
	/** `Object#toString` result references. */
	var objectTag = '[object Object]';
	
	/**
	 * Checks if `value` is object-like.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
	 */
	function isObjectLike(value) {
	  return !!value && typeof value == 'object';
	}
	
	/** Used for native method references. */
	var objectProto = Object.prototype;
	
	/** Used to check objects for own properties. */
	var hasOwnProperty = objectProto.hasOwnProperty;
	
	/**
	 * Used to resolve the [`toStringTag`](http://ecma-international.org/ecma-262/6.0/#sec-object.prototype.tostring)
	 * of values.
	 */
	var objToString = objectProto.toString;
	
	/**
	 * The base implementation of `_.forIn` without support for callback
	 * shorthands and `this` binding.
	 *
	 * @private
	 * @param {Object} object The object to iterate over.
	 * @param {Function} iteratee The function invoked per iteration.
	 * @returns {Object} Returns `object`.
	 */
	function baseForIn(object, iteratee) {
	  return baseFor(object, iteratee, keysIn);
	}
	
	/**
	 * Checks if `value` is a plain object, that is, an object created by the
	 * `Object` constructor or one with a `[[Prototype]]` of `null`.
	 *
	 * **Note:** This method assumes objects created by the `Object` constructor
	 * have no inherited enumerable properties.
	 *
	 * @static
	 * @memberOf _
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is a plain object, else `false`.
	 * @example
	 *
	 * function Foo() {
	 *   this.a = 1;
	 * }
	 *
	 * _.isPlainObject(new Foo);
	 * // => false
	 *
	 * _.isPlainObject([1, 2, 3]);
	 * // => false
	 *
	 * _.isPlainObject({ 'x': 0, 'y': 0 });
	 * // => true
	 *
	 * _.isPlainObject(Object.create(null));
	 * // => true
	 */
	function isPlainObject(value) {
	  var Ctor;
	
	  // Exit early for non `Object` objects.
	  if (!(isObjectLike(value) && objToString.call(value) == objectTag && !isArguments(value)) || !hasOwnProperty.call(value, 'constructor') && (Ctor = value.constructor, typeof Ctor == 'function' && !(Ctor instanceof Ctor))) {
	    return false;
	  }
	  // IE < 9 iterates inherited properties before own properties. If the first
	  // iterated property is an object's own property then there are no inherited
	  // enumerable properties.
	  var result;
	  // In most environments an object's own properties are iterated before
	  // its inherited properties. If the last iterated property is an object's
	  // own property then there are no inherited enumerable properties.
	  baseForIn(value, function (subValue, key) {
	    result = key;
	  });
	  return result === undefined || hasOwnProperty.call(value, result);
	}
	
	module.exports = isPlainObject;

/***/ },
/* 6 */
/***/ function(module, exports) {

	/**
	 * lodash 3.0.2 (Custom Build) <https://lodash.com/>
	 * Build: `lodash modern modularize exports="npm" -o ./`
	 * Copyright 2012-2015 The Dojo Foundation <http://dojofoundation.org/>
	 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
	 * Copyright 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
	 * Available under MIT license <https://lodash.com/license>
	 */
	
	/**
	 * The base implementation of `baseForIn` and `baseForOwn` which iterates
	 * over `object` properties returned by `keysFunc` invoking `iteratee` for
	 * each property. Iteratee functions may exit iteration early by explicitly
	 * returning `false`.
	 *
	 * @private
	 * @param {Object} object The object to iterate over.
	 * @param {Function} iteratee The function invoked per iteration.
	 * @param {Function} keysFunc The function to get the keys of `object`.
	 * @returns {Object} Returns `object`.
	 */
	'use strict';
	
	var baseFor = createBaseFor();
	
	/**
	 * Creates a base function for `_.forIn` or `_.forInRight`.
	 *
	 * @private
	 * @param {boolean} [fromRight] Specify iterating from right to left.
	 * @returns {Function} Returns the new base function.
	 */
	function createBaseFor(fromRight) {
	  return function (object, iteratee, keysFunc) {
	    var iterable = toObject(object),
	        props = keysFunc(object),
	        length = props.length,
	        index = fromRight ? length : -1;
	
	    while (fromRight ? index-- : ++index < length) {
	      var key = props[index];
	      if (iteratee(iterable[key], key, iterable) === false) {
	        break;
	      }
	    }
	    return object;
	  };
	}
	
	/**
	 * Converts `value` to an object if it's not one.
	 *
	 * @private
	 * @param {*} value The value to process.
	 * @returns {Object} Returns the object.
	 */
	function toObject(value) {
	  return isObject(value) ? value : Object(value);
	}
	
	/**
	 * Checks if `value` is the [language type](https://es5.github.io/#x8) of `Object`.
	 * (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
	 *
	 * @static
	 * @memberOf _
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
	 * @example
	 *
	 * _.isObject({});
	 * // => true
	 *
	 * _.isObject([1, 2, 3]);
	 * // => true
	 *
	 * _.isObject(1);
	 * // => false
	 */
	function isObject(value) {
	  // Avoid a V8 JIT bug in Chrome 19-20.
	  // See https://code.google.com/p/v8/issues/detail?id=2291 for more details.
	  var type = typeof value;
	  return !!value && (type == 'object' || type == 'function');
	}
	
	module.exports = baseFor;

/***/ },
/* 7 */
/***/ function(module, exports) {

	/**
	 * lodash 3.0.4 (Custom Build) <https://lodash.com/>
	 * Build: `lodash modern modularize exports="npm" -o ./`
	 * Copyright 2012-2015 The Dojo Foundation <http://dojofoundation.org/>
	 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
	 * Copyright 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
	 * Available under MIT license <https://lodash.com/license>
	 */
	
	/**
	 * Checks if `value` is object-like.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
	 */
	'use strict';
	
	function isObjectLike(value) {
	  return !!value && typeof value == 'object';
	}
	
	/** Used for native method references. */
	var objectProto = Object.prototype;
	
	/** Used to check objects for own properties. */
	var hasOwnProperty = objectProto.hasOwnProperty;
	
	/** Native method references. */
	var propertyIsEnumerable = objectProto.propertyIsEnumerable;
	
	/**
	 * Used as the [maximum length](http://ecma-international.org/ecma-262/6.0/#sec-number.max_safe_integer)
	 * of an array-like value.
	 */
	var MAX_SAFE_INTEGER = 9007199254740991;
	
	/**
	 * The base implementation of `_.property` without support for deep paths.
	 *
	 * @private
	 * @param {string} key The key of the property to get.
	 * @returns {Function} Returns the new function.
	 */
	function baseProperty(key) {
	  return function (object) {
	    return object == null ? undefined : object[key];
	  };
	}
	
	/**
	 * Gets the "length" property value of `object`.
	 *
	 * **Note:** This function is used to avoid a [JIT bug](https://bugs.webkit.org/show_bug.cgi?id=142792)
	 * that affects Safari on at least iOS 8.1-8.3 ARM64.
	 *
	 * @private
	 * @param {Object} object The object to query.
	 * @returns {*} Returns the "length" value.
	 */
	var getLength = baseProperty('length');
	
	/**
	 * Checks if `value` is array-like.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is array-like, else `false`.
	 */
	function isArrayLike(value) {
	  return value != null && isLength(getLength(value));
	}
	
	/**
	 * Checks if `value` is a valid array-like length.
	 *
	 * **Note:** This function is based on [`ToLength`](http://ecma-international.org/ecma-262/6.0/#sec-tolength).
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is a valid length, else `false`.
	 */
	function isLength(value) {
	  return typeof value == 'number' && value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
	}
	
	/**
	 * Checks if `value` is classified as an `arguments` object.
	 *
	 * @static
	 * @memberOf _
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is correctly classified, else `false`.
	 * @example
	 *
	 * _.isArguments(function() { return arguments; }());
	 * // => true
	 *
	 * _.isArguments([1, 2, 3]);
	 * // => false
	 */
	function isArguments(value) {
	  return isObjectLike(value) && isArrayLike(value) && hasOwnProperty.call(value, 'callee') && !propertyIsEnumerable.call(value, 'callee');
	}
	
	module.exports = isArguments;

/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * lodash 3.0.8 (Custom Build) <https://lodash.com/>
	 * Build: `lodash modern modularize exports="npm" -o ./`
	 * Copyright 2012-2015 The Dojo Foundation <http://dojofoundation.org/>
	 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
	 * Copyright 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
	 * Available under MIT license <https://lodash.com/license>
	 */
	'use strict';
	
	var isArguments = __webpack_require__(7),
	    isArray = __webpack_require__(9);
	
	/** Used to detect unsigned integer values. */
	var reIsUint = /^\d+$/;
	
	/** Used for native method references. */
	var objectProto = Object.prototype;
	
	/** Used to check objects for own properties. */
	var hasOwnProperty = objectProto.hasOwnProperty;
	
	/**
	 * Used as the [maximum length](https://people.mozilla.org/~jorendorff/es6-draft.html#sec-number.max_safe_integer)
	 * of an array-like value.
	 */
	var MAX_SAFE_INTEGER = 9007199254740991;
	
	/**
	 * Checks if `value` is a valid array-like index.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @param {number} [length=MAX_SAFE_INTEGER] The upper bounds of a valid index.
	 * @returns {boolean} Returns `true` if `value` is a valid index, else `false`.
	 */
	function isIndex(value, length) {
	  value = typeof value == 'number' || reIsUint.test(value) ? +value : -1;
	  length = length == null ? MAX_SAFE_INTEGER : length;
	  return value > -1 && value % 1 == 0 && value < length;
	}
	
	/**
	 * Checks if `value` is a valid array-like length.
	 *
	 * **Note:** This function is based on [`ToLength`](https://people.mozilla.org/~jorendorff/es6-draft.html#sec-tolength).
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is a valid length, else `false`.
	 */
	function isLength(value) {
	  return typeof value == 'number' && value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
	}
	
	/**
	 * Checks if `value` is the [language type](https://es5.github.io/#x8) of `Object`.
	 * (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
	 *
	 * @static
	 * @memberOf _
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
	 * @example
	 *
	 * _.isObject({});
	 * // => true
	 *
	 * _.isObject([1, 2, 3]);
	 * // => true
	 *
	 * _.isObject(1);
	 * // => false
	 */
	function isObject(value) {
	  // Avoid a V8 JIT bug in Chrome 19-20.
	  // See https://code.google.com/p/v8/issues/detail?id=2291 for more details.
	  var type = typeof value;
	  return !!value && (type == 'object' || type == 'function');
	}
	
	/**
	 * Creates an array of the own and inherited enumerable property names of `object`.
	 *
	 * **Note:** Non-object values are coerced to objects.
	 *
	 * @static
	 * @memberOf _
	 * @category Object
	 * @param {Object} object The object to query.
	 * @returns {Array} Returns the array of property names.
	 * @example
	 *
	 * function Foo() {
	 *   this.a = 1;
	 *   this.b = 2;
	 * }
	 *
	 * Foo.prototype.c = 3;
	 *
	 * _.keysIn(new Foo);
	 * // => ['a', 'b', 'c'] (iteration order is not guaranteed)
	 */
	function keysIn(object) {
	  if (object == null) {
	    return [];
	  }
	  if (!isObject(object)) {
	    object = Object(object);
	  }
	  var length = object.length;
	  length = length && isLength(length) && (isArray(object) || isArguments(object)) && length || 0;
	
	  var Ctor = object.constructor,
	      index = -1,
	      isProto = typeof Ctor == 'function' && Ctor.prototype === object,
	      result = Array(length),
	      skipIndexes = length > 0;
	
	  while (++index < length) {
	    result[index] = index + '';
	  }
	  for (var key in object) {
	    if (!(skipIndexes && isIndex(key, length)) && !(key == 'constructor' && (isProto || !hasOwnProperty.call(object, key)))) {
	      result.push(key);
	    }
	  }
	  return result;
	}
	
	module.exports = keysIn;

/***/ },
/* 9 */
/***/ function(module, exports) {

	/**
	 * lodash 3.0.4 (Custom Build) <https://lodash.com/>
	 * Build: `lodash modern modularize exports="npm" -o ./`
	 * Copyright 2012-2015 The Dojo Foundation <http://dojofoundation.org/>
	 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
	 * Copyright 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
	 * Available under MIT license <https://lodash.com/license>
	 */
	
	/** `Object#toString` result references. */
	'use strict';
	
	var arrayTag = '[object Array]',
	    funcTag = '[object Function]';
	
	/** Used to detect host constructors (Safari > 5). */
	var reIsHostCtor = /^\[object .+?Constructor\]$/;
	
	/**
	 * Checks if `value` is object-like.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
	 */
	function isObjectLike(value) {
	  return !!value && typeof value == 'object';
	}
	
	/** Used for native method references. */
	var objectProto = Object.prototype;
	
	/** Used to resolve the decompiled source of functions. */
	var fnToString = Function.prototype.toString;
	
	/** Used to check objects for own properties. */
	var hasOwnProperty = objectProto.hasOwnProperty;
	
	/**
	 * Used to resolve the [`toStringTag`](http://ecma-international.org/ecma-262/6.0/#sec-object.prototype.tostring)
	 * of values.
	 */
	var objToString = objectProto.toString;
	
	/** Used to detect if a method is native. */
	var reIsNative = RegExp('^' + fnToString.call(hasOwnProperty).replace(/[\\^$.*+?()[\]{}|]/g, '\\$&').replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?') + '$');
	
	/* Native method references for those with the same name as other `lodash` methods. */
	var nativeIsArray = getNative(Array, 'isArray');
	
	/**
	 * Used as the [maximum length](http://ecma-international.org/ecma-262/6.0/#sec-number.max_safe_integer)
	 * of an array-like value.
	 */
	var MAX_SAFE_INTEGER = 9007199254740991;
	
	/**
	 * Gets the native function at `key` of `object`.
	 *
	 * @private
	 * @param {Object} object The object to query.
	 * @param {string} key The key of the method to get.
	 * @returns {*} Returns the function if it's native, else `undefined`.
	 */
	function getNative(object, key) {
	  var value = object == null ? undefined : object[key];
	  return isNative(value) ? value : undefined;
	}
	
	/**
	 * Checks if `value` is a valid array-like length.
	 *
	 * **Note:** This function is based on [`ToLength`](http://ecma-international.org/ecma-262/6.0/#sec-tolength).
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is a valid length, else `false`.
	 */
	function isLength(value) {
	  return typeof value == 'number' && value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
	}
	
	/**
	 * Checks if `value` is classified as an `Array` object.
	 *
	 * @static
	 * @memberOf _
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is correctly classified, else `false`.
	 * @example
	 *
	 * _.isArray([1, 2, 3]);
	 * // => true
	 *
	 * _.isArray(function() { return arguments; }());
	 * // => false
	 */
	var isArray = nativeIsArray || function (value) {
	  return isObjectLike(value) && isLength(value.length) && objToString.call(value) == arrayTag;
	};
	
	/**
	 * Checks if `value` is classified as a `Function` object.
	 *
	 * @static
	 * @memberOf _
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is correctly classified, else `false`.
	 * @example
	 *
	 * _.isFunction(_);
	 * // => true
	 *
	 * _.isFunction(/abc/);
	 * // => false
	 */
	function isFunction(value) {
	  // The use of `Object#toString` avoids issues with the `typeof` operator
	  // in older versions of Chrome and Safari which return 'function' for regexes
	  // and Safari 8 equivalents which return 'object' for typed array constructors.
	  return isObject(value) && objToString.call(value) == funcTag;
	}
	
	/**
	 * Checks if `value` is the [language type](https://es5.github.io/#x8) of `Object`.
	 * (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
	 *
	 * @static
	 * @memberOf _
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
	 * @example
	 *
	 * _.isObject({});
	 * // => true
	 *
	 * _.isObject([1, 2, 3]);
	 * // => true
	 *
	 * _.isObject(1);
	 * // => false
	 */
	function isObject(value) {
	  // Avoid a V8 JIT bug in Chrome 19-20.
	  // See https://code.google.com/p/v8/issues/detail?id=2291 for more details.
	  var type = typeof value;
	  return !!value && (type == 'object' || type == 'function');
	}
	
	/**
	 * Checks if `value` is a native function.
	 *
	 * @static
	 * @memberOf _
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is a native function, else `false`.
	 * @example
	 *
	 * _.isNative(Array.prototype.push);
	 * // => true
	 *
	 * _.isNative(_);
	 * // => false
	 */
	function isNative(value) {
	  if (value == null) {
	    return false;
	  }
	  if (isFunction(value)) {
	    return reIsNative.test(fnToString.call(value));
	  }
	  return isObjectLike(value) && reIsHostCtor.test(value);
	}
	
	module.exports = isArray;

/***/ },
/* 10 */
/***/ function(module, exports) {

	"use strict";
	
	exports.__esModule = true;
	exports["default"] = stepper;
	var errorMargin = 0.0001;
	
	function stepper(frameRate, x, v, destX, k, b) {
	  // Spring stiffness, in kg / s^2
	
	  // for animations, destX is really spring length (spring at rest). initial
	  // position is considered as the stretched/compressed position of a spring
	  var Fspring = -k * (x - destX);
	
	  // Damping constant, in kg / s
	  var Fdamper = -b * v;
	
	  // usually we put mass here, but for animation purposes, specifying mass is a
	  // bit redundant. you could simply adjust k and b accordingly
	  // let a = (Fspring + Fdamper) / mass;
	  var a = Fspring + Fdamper;
	
	  var newV = v + a * frameRate;
	  var newX = x + newV * frameRate;
	
	  if (Math.abs(newV - v) < errorMargin && Math.abs(newX - x) < errorMargin) {
	    return [destX, 0];
	  }
	
	  return [newX, newV];
	}
	
	module.exports = exports["default"];

/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	exports.__esModule = true;
	exports['default'] = noVelocity;
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }
	
	var _lodashIsplainobject = __webpack_require__(5);
	
	var _lodashIsplainobject2 = _interopRequireDefault(_lodashIsplainobject);
	
	function noVelocity(coll) {
	  if (Array.isArray(coll)) {
	    return coll.every(noVelocity);
	  }
	  if (_lodashIsplainobject2['default'](coll)) {
	    return Object.keys(coll).every(function (key) {
	      return key === 'config' ? true : noVelocity(coll[key]);
	    });
	  }
	  return typeof coll === 'number' ? coll === 0 : true;
	}
	
	module.exports = exports['default'];

/***/ },
/* 12 */
/***/ function(module, exports) {

	// this function is allocation-less thanks to babel, which transforms the tail
	// calls into loops
	"use strict";
	
	exports.__esModule = true;
	exports["default"] = mergeDiff;
	function mergeDiffArr2(_x, _x2, _x3, _x4, _x5, _x6, _x7) {
	  var _again = true;
	
	  _function: while (_again) {
	    var arrA = _x,
	        arrB = _x2,
	        collB = _x3,
	        indexA = _x4,
	        indexB = _x5,
	        onRemove = _x6,
	        accum = _x7;
	    endA = endB = keyA = keyB = fill = fill = undefined;
	    _again = false;
	
	    var endA = indexA === arrA.length;
	    var endB = indexB === arrB.length;
	    var keyA = arrA[indexA];
	    var keyB = arrB[indexB];
	    if (endA && endB) {
	      // returning null here, otherwise lint complains that we're not expecting
	      // a return value in subsequent calls. We know what we're doing.
	      return null;
	    }
	
	    if (endA) {
	      accum[keyB] = collB[keyB];
	      _x = arrA;
	      _x2 = arrB;
	      _x3 = collB;
	      _x4 = indexA;
	      _x5 = indexB + 1;
	      _x6 = onRemove;
	      _x7 = accum;
	      _again = true;
	      continue _function;
	    }
	
	    if (endB) {
	      var fill = onRemove(keyA);
	      if (fill != null) {
	        accum[keyA] = fill;
	      }
	      _x = arrA;
	      _x2 = arrB;
	      _x3 = collB;
	      _x4 = indexA + 1;
	      _x5 = indexB;
	      _x6 = onRemove;
	      _x7 = accum;
	      _again = true;
	      continue _function;
	    }
	
	    if (keyA === keyB) {
	      accum[keyA] = collB[keyA];
	      _x = arrA;
	      _x2 = arrB;
	      _x3 = collB;
	      _x4 = indexA + 1;
	      _x5 = indexB + 1;
	      _x6 = onRemove;
	      _x7 = accum;
	      _again = true;
	      continue _function;
	    }
	
	    if (!collB.hasOwnProperty(keyA)) {
	      var fill = onRemove(keyA);
	      if (fill != null) {
	        accum[keyA] = fill;
	      }
	      _x = arrA;
	      _x2 = arrB;
	      _x3 = collB;
	      _x4 = indexA + 1;
	      _x5 = indexB;
	      _x6 = onRemove;
	      _x7 = accum;
	      _again = true;
	      continue _function;
	    }
	
	    _x = arrA;
	    _x2 = arrB;
	    _x3 = collB;
	    _x4 = indexA + 1;
	    _x5 = indexB;
	    _x6 = onRemove;
	    _x7 = accum;
	    _again = true;
	    continue _function;
	  }
	}
	
	function mergeDiff(a, b, onRemove) {
	  var ret = {};
	  // if anyone can make this work without allocating the arrays here, we'll
	  // give you a medal
	  mergeDiffArr2(Object.keys(a), Object.keys(b), b, 0, 0, onRemove, ret);
	  return ret;
	}
	
	module.exports = exports["default"];

/***/ },
/* 13 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	exports.__esModule = true;
	exports['default'] = createAnimationLoop;
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }
	
	var _filter = __webpack_require__(14);
	
	var _filter2 = _interopRequireDefault(_filter);
	
	var _performanceNow = __webpack_require__(15);
	
	var _performanceNow2 = _interopRequireDefault(_performanceNow);
	
	var _raf = __webpack_require__(17);
	
	var _raf2 = _interopRequireDefault(_raf);
	
	function renderSubscriber(alpha, subscriber) {
	  // subscriber.render: this.animationRender
	  subscriber.render(alpha, subscriber.value, subscriber.prevValue);
	  return subscriber.active;
	}
	
	var prototype = {
	  running: false,
	  shouldStop: false,
	  lastTime: 0,
	  accumulatedTime: 0,
	
	  // step: this.animationStep
	  // render: this.animationRender
	  // value: state
	  subscribe: function subscribe(step, render, value) {
	    var subscriber = {
	      value: value,
	      prevValue: value,
	      step: step,
	      render: render,
	      active: true
	    };
	
	    this.subscribers.push(subscriber);
	
	    return function unsubscribe() {
	      subscriber.active = false;
	    };
	  },
	
	  loop: function loop() {
	    var currentTime = _performanceNow2['default']();
	
	    if (this.shouldStop) {
	      this.running = this.shouldStop = false;
	      return;
	    }
	
	    var timeStep = this.timeStep;
	    // delta
	    var frameTime = currentTime - this.lastTime;
	
	    this.lastTime = currentTime;
	    this.accumulatedTime += frameTime * this.timeScale;
	
	    if (this.accumulatedTime > timeStep * this.maxSteps) {
	      this.accumulatedTime = 0;
	    }
	
	    while (this.accumulatedTime > 0) {
	      this.subscribers.forEach(this.step); // animationLoop.step
	      this.accumulatedTime -= timeStep;
	    }
	
	    // Render and filter in one iteration.
	    this.subscribers = _filter2['default'](this.subscribers, renderSubscriber, 1 + this.accumulatedTime / timeStep);
	
	    if (this.subscribers.length === 0) {
	      this.shouldStop = true;
	    }
	
	    _raf2['default'](this.loop);
	  },
	
	  start: function start() {
	    if (this.subscribers.length) {
	      if (this.shouldStop) {
	        this.shouldStop = false;
	      } else if (!this.running) {
	        this.running = true;
	        this.lastTime = _performanceNow2['default']();
	        this.accumulatedTime = 0;
	        _raf2['default'](this.loop);
	      }
	    }
	  }
	
	};
	
	// stop() {
	//   this.shouldStop = true;
	
	//   return this;
	// },
	
	function createAnimationLoop(_ref) {
	  var timeStep = _ref.timeStep;
	  var timeScale = _ref.timeScale;
	  var maxSteps = _ref.maxSteps;
	
	  var animationLoop = Object.create(prototype);
	
	  animationLoop.loop = animationLoop.loop.bind(animationLoop);
	  animationLoop.subscribers = [];
	
	  // timeStep is in milliseconds
	  animationLoop.timeStep = timeStep * 1000; // seconds
	  animationLoop.timeScale = timeScale;
	  animationLoop.maxSteps = maxSteps;
	
	  animationLoop.step = function (subscriber) {
	    if (subscriber.active) {
	      var value = subscriber.value; // value = this.state
	
	      subscriber.prevValue = value;
	      subscriber.value = subscriber.step(timeStep, value); // animationStep
	    }
	  };
	
	  return animationLoop;
	}
	
	module.exports = exports['default'];

/***/ },
/* 14 */
/***/ function(module, exports) {

	// Just like Array.prototype.filter, but passes third argument as the first
	// argument to the callback. This is to allocating an inline callback (that
	// refers to something outside as a closure) in the filter call.
	"use strict";
	
	exports.__esModule = true;
	exports["default"] = filter;
	
	function filter(array, callback, argument) {
	  var ret = [];
	  var index = 0;
	
	  // Don’t cache array.length since we want to iterate
	  // over items that might be added during filtering.
	  while (index < array.length) {
	    if (callback(argument, array[index], index, array)) {
	      ret.push(array[index]);
	    }
	    index++;
	  }
	
	  return ret;
	}
	
	module.exports = exports["default"];

/***/ },
/* 15 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(process) {// Generated by CoffeeScript 1.7.1
	"use strict";
	
	(function () {
	  var getNanoSeconds, hrtime, loadTime;
	
	  if (typeof performance !== "undefined" && performance !== null && performance.now) {
	    module.exports = function () {
	      return performance.now();
	    };
	  } else if (typeof process !== "undefined" && process !== null && process.hrtime) {
	    module.exports = function () {
	      return (getNanoSeconds() - loadTime) / 1e6;
	    };
	    hrtime = process.hrtime;
	    getNanoSeconds = function () {
	      var hr;
	      hr = hrtime();
	      return hr[0] * 1e9 + hr[1];
	    };
	    loadTime = getNanoSeconds();
	  } else if (Date.now) {
	    module.exports = function () {
	      return Date.now() - loadTime;
	    };
	    loadTime = Date.now();
	  } else {
	    module.exports = function () {
	      return new Date().getTime() - loadTime;
	    };
	    loadTime = new Date().getTime();
	  }
	}).call(undefined);
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(16)))

/***/ },
/* 16 */
/***/ function(module, exports) {

	// shim for using process in browser
	
	'use strict';
	
	var process = module.exports = {};
	var queue = [];
	var draining = false;
	var currentQueue;
	var queueIndex = -1;
	
	function cleanUpNextTick() {
	    draining = false;
	    if (currentQueue.length) {
	        queue = currentQueue.concat(queue);
	    } else {
	        queueIndex = -1;
	    }
	    if (queue.length) {
	        drainQueue();
	    }
	}
	
	function drainQueue() {
	    if (draining) {
	        return;
	    }
	    var timeout = setTimeout(cleanUpNextTick);
	    draining = true;
	
	    var len = queue.length;
	    while (len) {
	        currentQueue = queue;
	        queue = [];
	        while (++queueIndex < len) {
	            currentQueue[queueIndex].run();
	        }
	        queueIndex = -1;
	        len = queue.length;
	    }
	    currentQueue = null;
	    draining = false;
	    clearTimeout(timeout);
	}
	
	process.nextTick = function (fun) {
	    var args = new Array(arguments.length - 1);
	    if (arguments.length > 1) {
	        for (var i = 1; i < arguments.length; i++) {
	            args[i - 1] = arguments[i];
	        }
	    }
	    queue.push(new Item(fun, args));
	    if (queue.length === 1 && !draining) {
	        setTimeout(drainQueue, 0);
	    }
	};
	
	// v8 likes predictible objects
	function Item(fun, array) {
	    this.fun = fun;
	    this.array = array;
	}
	Item.prototype.run = function () {
	    this.fun.apply(null, this.array);
	};
	process.title = 'browser';
	process.browser = true;
	process.env = {};
	process.argv = [];
	process.version = ''; // empty string to avoid regexp issues
	process.versions = {};
	
	function noop() {}
	
	process.on = noop;
	process.addListener = noop;
	process.once = noop;
	process.off = noop;
	process.removeListener = noop;
	process.removeAllListeners = noop;
	process.emit = noop;
	
	process.binding = function (name) {
	    throw new Error('process.binding is not supported');
	};
	
	// TODO(shtylman)
	process.cwd = function () {
	    return '/';
	};
	process.chdir = function (dir) {
	    throw new Error('process.chdir is not supported');
	};
	process.umask = function () {
	    return 0;
	};

/***/ },
/* 17 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var now = __webpack_require__(15),
	    global = typeof window === 'undefined' ? {} : window,
	    vendors = ['moz', 'webkit'],
	    suffix = 'AnimationFrame',
	    raf = global['request' + suffix],
	    caf = global['cancel' + suffix] || global['cancelRequest' + suffix];
	
	for (var i = 0; i < vendors.length && !raf; i++) {
	  raf = global[vendors[i] + 'Request' + suffix];
	  caf = global[vendors[i] + 'Cancel' + suffix] || global[vendors[i] + 'CancelRequest' + suffix];
	}
	
	// Some versions of FF have rAF but not cAF
	if (!raf || !caf) {
	  var last = 0,
	      id = 0,
	      queue = [],
	      frameDuration = 1000 / 60;
	
	  raf = function (callback) {
	    if (queue.length === 0) {
	      var _now = now(),
	          next = Math.max(0, frameDuration - (_now - last));
	      last = next + _now;
	      setTimeout(function () {
	        var cp = queue.slice(0);
	        // Clear queue here to prevent
	        // callbacks from appending listeners
	        // to the current frame's queue
	        queue.length = 0;
	        for (var i = 0; i < cp.length; i++) {
	          if (!cp[i].cancelled) {
	            try {
	              cp[i].callback(last);
	            } catch (e) {
	              setTimeout(function () {
	                throw e;
	              }, 0);
	            }
	          }
	        }
	      }, Math.round(next));
	    }
	    queue.push({
	      handle: ++id,
	      callback: callback,
	      cancelled: false
	    });
	    return id;
	  };
	
	  caf = function (handle) {
	    for (var i = 0; i < queue.length; i++) {
	      if (queue[i].handle === handle) {
	        queue[i].cancelled = true;
	      }
	    }
	  };
	}
	
	module.exports = function (fn) {
	  // Wrap in a new function to prevent
	  // `cancel` potentially being assigned
	  // to the native rAF function
	  return raf.call(global, fn);
	};
	module.exports.cancel = function () {
	  caf.apply(global, arguments);
	};

/***/ }
/******/ ])
});
;
//# sourceMappingURL=react-motion.map