(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("react"));
	else if(typeof define === 'function' && define.amd)
		define(["react"], factory);
	else if(typeof exports === 'object')
		exports["Spring"] = factory(require("react"));
	else
		root["Spring"] = factory(root["React"]);
})(this, function(__WEBPACK_EXTERNAL_MODULE_1__) {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "lib/";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, '__esModule', {
	  value: true
	});

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	function _slicedToArray(arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }

	function _toArray(arr) { return Array.isArray(arr) ? arr : Array.from(arr); }

	var _react = __webpack_require__(1);

	var _react2 = _interopRequireDefault(_react);

	var _utils = __webpack_require__(2);

	var _stepper = __webpack_require__(3);

	var _stepper2 = _interopRequireDefault(_stepper);

	// ---------
	var FRAME_RATE = 1 / 60;

	function zero() {
	  return 0;
	}

	// TODO: test
	function mergeDiff(_x5, _x6, _x7, _x8) {
	  var _again = true;

	  _function: while (_again) {
	    var collA = _x5,
	        collB = _x6,
	        onRemove = _x7,
	        accum = _x8;
	    _collA = a = aa = _collB = b = bb = undefined;
	    _again = false;

	    var _collA = _toArray(collA);

	    var a = _collA[0];

	    var aa = _collA.slice(1);

	    var _collB = _toArray(collB);

	    var b = _collB[0];

	    var bb = _collB.slice(1);

	    if (collA.length === 0 && collB.length === 0) {
	      return accum;
	    }
	    if (collA.length === 0) {
	      return accum.concat(collB);
	    }
	    if (collB.length === 0) {
	      if (onRemove(a)) {
	        _x5 = aa;
	        _x6 = collB;
	        _x7 = onRemove;
	        _x8 = accum;
	        _again = true;
	        continue _function;
	      }
	      _x5 = aa;
	      _x6 = collB;
	      _x7 = onRemove;
	      _x8 = accum.concat(a);
	      _again = true;
	      continue _function;
	    }
	    if (a === b) {
	      // fails for ([undefined], [], () => true). but don't do that
	      _x5 = aa;
	      _x6 = bb;
	      _x7 = onRemove;
	      _x8 = accum.concat(a);
	      _again = true;
	      continue _function;
	    }
	    if (collB.indexOf(a) === -1) {
	      if (onRemove(a)) {
	        _x5 = aa;
	        _x6 = collB;
	        _x7 = onRemove;
	        _x8 = accum;
	        _again = true;
	        continue _function;
	      }
	      _x5 = aa;
	      _x6 = collB;
	      _x7 = onRemove;
	      _x8 = accum.concat(a);
	      _again = true;
	      continue _function;
	    }
	    _x5 = aa;
	    _x6 = collB;
	    _x7 = onRemove;
	    _x8 = accum;
	    _again = true;
	    continue _function;
	  }
	}

	function mergeDiffObj(a, b, onRemove) {
	  var keys = mergeDiff(Object.keys(a), Object.keys(b), function (a) {
	    return !onRemove(a);
	  }, []);
	  var ret = {};
	  keys.forEach(function (key) {
	    if (b.hasOwnProperty(key)) {
	      ret[key] = b[key];
	    } else {
	      ret[key] = onRemove(key);
	    }
	  });

	  return ret;
	}

	// TODO: refactor common logic with updateCurrV
	// TODO: tests
	function updateCurrVals(frameRate, currVals, currV, endValue) {
	  var k = arguments[4] === undefined ? 170 : arguments[4];
	  var b = arguments[5] === undefined ? 26 : arguments[5];

	  if (endValue === null) {
	    return null;
	  }
	  if (typeof endValue === 'number') {
	    // TODO: do something to stepper to make this not allocate (2 steppers?)
	    return (0, _stepper2['default'])(frameRate, currVals, currV, endValue, k, b)[0];
	  }
	  if (endValue.val != null && endValue.config && endValue.config.length === 0) {
	    return endValue;
	  }
	  if (endValue.val != null) {
	    var _ref = endValue.config || [170, 26];

	    var _ref2 = _slicedToArray(_ref, 2);

	    var _k = _ref2[0];
	    var _b = _ref2[1];

	    return {
	      val: updateCurrVals(frameRate, currVals.val, currV.val, endValue.val, _k, _b),
	      config: endValue.config
	    };
	  }
	  if (Object.prototype.toString.call(endValue) === '[object Array]') {
	    return endValue.map(function (_, i) {
	      return updateCurrVals(frameRate, currVals[i], currV[i], endValue[i], k, b);
	    });
	  }
	  if (Object.prototype.toString.call(endValue) === '[object Object]') {
	    var _ret = (function () {
	      var ret = {};
	      Object.keys(endValue).forEach(function (key) {
	        ret[key] = updateCurrVals(frameRate, currVals[key], currV[key], endValue[key], k, b);
	      });
	      return {
	        v: ret
	      };
	    })();

	    if (typeof _ret === 'object') return _ret.v;
	  }
	  return endValue;
	}

	function updateCurrV(frameRate, currVals, currV, endValue) {
	  var k = arguments[4] === undefined ? 170 : arguments[4];
	  var b = arguments[5] === undefined ? 26 : arguments[5];

	  if (endValue === null) {
	    return null;
	  }
	  if (typeof endValue === 'number') {
	    return (0, _stepper2['default'])(frameRate, currVals, currV, endValue, k, b)[1];
	  }
	  if (endValue.val != null && endValue.config && endValue.config.length === 0) {
	    return (0, _utils.mapTree)(zero, currV);
	  }
	  if (endValue.val != null) {
	    var _ref3 = endValue.config || [170, 26];

	    var _ref32 = _slicedToArray(_ref3, 2);

	    var _k = _ref32[0];
	    var _b = _ref32[1];

	    return {
	      val: updateCurrV(frameRate, currVals.val, currV.val, endValue.val, _k, _b),
	      config: endValue.config
	    };
	  }
	  if (Object.prototype.toString.call(endValue) === '[object Array]') {
	    return endValue.map(function (_, i) {
	      return updateCurrV(frameRate, currVals[i], currV[i], endValue[i], k, b);
	    });
	  }
	  if (Object.prototype.toString.call(endValue) === '[object Object]') {
	    var _ret2 = (function () {
	      var ret = {};
	      Object.keys(endValue).forEach(function (key) {
	        ret[key] = updateCurrV(frameRate, currVals[key], currV[key], endValue[key], k, b);
	      });
	      return {
	        v: ret
	      };
	    })();

	    if (typeof _ret2 === 'object') return _ret2.v;
	  }
	  return (0, _utils.mapTree)(zero, currV);
	}

	function noSpeed(coll) {
	  if (Object.prototype.toString.call(coll) === '[object Array]') {
	    return coll.every(noSpeed);
	  }
	  if (Object.prototype.toString.call(coll) === '[object Object]') {
	    return Object.keys(coll).every(function (key) {
	      return key === 'config' ? true : noSpeed(coll[key]);
	    });
	  }
	  return coll === 0;
	}

	exports['default'] = _react2['default'].createClass({
	  displayName: 'Spring',

	  propTypes: {
	    endValue: _react.PropTypes.oneOfType([_react.PropTypes.func, _react.PropTypes.object, _react.PropTypes.array]).isRequired
	  },

	  getInitialState: function getInitialState() {
	    var endValue = this.props.endValue;

	    if (typeof endValue === 'function') {
	      endValue = endValue();
	    }
	    return {
	      currVals: endValue,
	      currV: (0, _utils.mapTree)(zero, endValue),
	      now: null
	    };
	  },

	  componentDidMount: function componentDidMount() {
	    this.raf(true, false);
	  },

	  componentWillReceiveProps: function componentWillReceiveProps() {
	    this.raf(true, false);
	  },

	  componentWillUnmount: function componentWillUnmount() {
	    cancelAnimationFrame(this._rafID);
	  },

	  _rafID: null,

	  raf: function raf(justStarted, isLastRaf) {
	    var _this = this;

	    if (justStarted && this._rafID != null) {
	      // already rafing
	      return;
	    }
	    this._rafID = requestAnimationFrame(function () {
	      var _state = _this.state;
	      var currVals = _state.currVals;
	      var currV = _state.currV;
	      var now = _state.now;
	      var endValue = _this.props.endValue;

	      if (typeof endValue === 'function') {
	        endValue = endValue(currVals);
	      }
	      var frameRate = now && !justStarted ? (Date.now() - now) / 1000 : FRAME_RATE;

	      var newCurrVals = updateCurrVals(frameRate, currVals, currV, endValue);
	      var newCurrV = updateCurrV(frameRate, currVals, currV, endValue);

	      _this.setState(function () {
	        return {
	          currVals: newCurrVals,
	          currV: newCurrV,
	          now: Date.now()
	        };
	      });

	      var stop = noSpeed(newCurrV);
	      if (stop && !justStarted) {
	        // this flag is necessary, because in `endValue` callback, the user
	        // might check that the current value has reached the destination, and
	        // decide to return a new destination value. However, since s/he's
	        // accessing the last tick's current value, and if we stop rafing after
	        // speed is 0, the next `endValue` is never called and we never detect
	        // the new chained animation. isLastRaf ensures that we raf a single
	        // more time in case the user wants to chain another animation at the
	        // end of this one
	        if (isLastRaf) {
	          _this._rafID = null;
	        } else {
	          _this.raf(false, true);
	        }
	      } else {
	        _this.raf(false, false);
	      }
	    });
	  },

	  render: function render() {
	    var currVals = this.state.currVals;

	    return _react2['default'].createElement(
	      'div',
	      this.props,
	      this.props.children(currVals)
	    );
	  }
	});
	var TransitionSpring = _react2['default'].createClass({
	  displayName: 'TransitionSpring',

	  propTypes: {
	    endValue: _react.PropTypes.oneOfType([_react.PropTypes.func, _react.PropTypes.object]).isRequired,
	    willLeave: _react.PropTypes.oneOfType([_react.PropTypes.func, _react.PropTypes.object, _react.PropTypes.array]),
	    willEnter: _react.PropTypes.oneOfType([_react.PropTypes.func, _react.PropTypes.object, _react.PropTypes.array])
	  },

	  getDefaultProps: function getDefaultProps() {
	    return {
	      willEnter: function willEnter(key, endValue) {
	        return endValue[key];
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
	      currVals: endValue,
	      currV: (0, _utils.mapTree)(zero, endValue),
	      now: null
	    };
	  },

	  componentDidMount: function componentDidMount() {
	    this.raf(true, false);
	  },

	  componentWillReceiveProps: function componentWillReceiveProps() {
	    this.raf(true, false);
	  },

	  componentWillUnmount: function componentWillUnmount() {
	    cancelAnimationFrame(this._rafID);
	  },

	  _rafID: null,

	  raf: function raf(justStarted, isLastRaf) {
	    var _this2 = this;

	    if (justStarted && this._rafID != null) {
	      // already rafing
	      return;
	    }
	    this._rafID = requestAnimationFrame(function () {
	      var _state2 = _this2.state;
	      var currVals = _state2.currVals;
	      var currV = _state2.currV;
	      var now = _state2.now;
	      var _props = _this2.props;
	      var endValue = _props.endValue;
	      var willEnter = _props.willEnter;
	      var willLeave = _props.willLeave;

	      if (typeof endValue === 'function') {
	        endValue = endValue(currVals);
	      }

	      var mergedVals = mergeDiffObj(currVals, endValue, function (key) {
	        return willLeave(key, endValue, currVals, currV);
	      });

	      currVals = (0, _utils.clone)(currVals);
	      currV = (0, _utils.clone)(currV);
	      Object.keys(mergedVals).filter(function (key) {
	        return !currVals.hasOwnProperty(key);
	      }).forEach(function (key) {
	        currVals[key] = willEnter(key, endValue, currVals, currV);
	        currV[key] = (0, _utils.mapTree)(zero, currVals[key]);
	      });

	      var frameRate = now && !justStarted ? (Date.now() - now) / 1000 : FRAME_RATE;

	      var newCurrVals = updateCurrVals(frameRate, currVals, currV, mergedVals);
	      var newCurrV = updateCurrV(frameRate, currVals, currV, mergedVals);

	      _this2.setState(function () {
	        return {
	          currVals: newCurrVals,
	          currV: newCurrV,
	          now: Date.now()
	        };
	      });

	      var stop = noSpeed(newCurrV);
	      if (stop && !justStarted) {
	        if (isLastRaf) {
	          _this2._rafID = null;
	        } else {
	          _this2.raf(false, true);
	        }
	      } else {
	        _this2.raf(false, false);
	      }
	    });
	  },

	  render: function render() {
	    var currVals = this.state.currVals;

	    return _react2['default'].createElement(
	      'div',
	      this.props,
	      this.props.children(currVals)
	    );
	  }
	});

	exports.TransitionSpring = TransitionSpring;
	function reorderKeys(obj, f) {
	  var ret = {};
	  f(Object.keys(obj)).forEach(function (key) {
	    ret[key] = obj[key];
	  });
	  return ret;
	}

	var utils = {
	  reorderKeys: reorderKeys
	};
	exports.utils = utils;

	// coming soon
	// PropTypes.arrayOf(PropTypes.shape({
	//   key: PropTypes.any.isRequired,
	// })),
	// PropTypes.arrayOf(PropTypes.element),

	// TODO: numbers? strings?

/***/ },
/* 1 */
/***/ function(module, exports) {

	module.exports = __WEBPACK_EXTERNAL_MODULE_1__;

/***/ },
/* 2 */
/***/ function(module, exports) {

	'use strict';

	Object.defineProperty(exports, '__esModule', {
	  value: true
	});
	exports.clone = clone;
	exports.eq = eq;
	exports.range = range;
	exports.mapTree = mapTree;
	exports.reshapeTree = reshapeTree;
	exports.toOj = toOj;
	exports.toArr = toArr;
	exports.reinsert = reinsert;
	exports.clamp = clamp;

	function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

	// damn it JS

	function clone(coll) {
	  return JSON.parse(JSON.stringify(coll));
	}

	function eq(a, b) {
	  return JSON.stringify(a) === JSON.stringify(b);
	}

	function range(start, afterStop) {
	  if (afterStop == null) {
	    afterStop = start;
	    start = 0;
	  }
	  var ret = [];
	  for (var i = start; i < afterStop; i++) {
	    ret.push(i);
	  }
	  return ret;
	}

	// assume trees same are same
	function _mapTree(path, f, trees) {
	  var t1 = trees[0];
	  if (Object.prototype.toString.call(t1) === '[object Array]') {
	    return t1.map(function (_, i) {
	      return _mapTree([].concat(_toConsumableArray(path), [i]), f, trees.map(function (val) {
	        return val[i];
	      }));
	    });
	  }
	  if (Object.prototype.toString.call(t1) === '[object Object]') {
	    var _ret = (function () {
	      var newTree = {};
	      Object.keys(t1).forEach(function (key) {
	        newTree[key] = _mapTree([].concat(_toConsumableArray(path), [key]), f, trees.map(function (val) {
	          return val[key];
	        }));
	      });
	      return {
	        v: newTree
	      };
	    })();

	    if (typeof _ret === 'object') return _ret.v;
	  }
	  return f.apply(undefined, [path].concat(_toConsumableArray(trees)));
	}

	function mapTree(f) {
	  for (var _len = arguments.length, rest = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
	    rest[_key - 1] = arguments[_key];
	  }

	  return _mapTree([], f, rest);
	}

	function _reshapeTree(path, a, b, f) {
	  if (a == null) {
	    throw 'wtf2';
	  }

	  if (b == null) {
	    return f(path, a);
	  }

	  if (Object.prototype.toString.call(a) === '[object Array]') {
	    return a.map(function (val, i) {
	      return _reshapeTree([].concat(_toConsumableArray(path), [i]), val, b[i], f);
	    });
	  }
	  if (Object.prototype.toString.call(a) === '[object Object]') {
	    var _ret2 = (function () {
	      var newTree = {};
	      Object.keys(a).forEach(function (key) {
	        newTree[key] = _reshapeTree([].concat(_toConsumableArray(path), [key]), a[key], b[key], f);
	      });
	      return {
	        v: newTree
	      };
	    })();

	    if (typeof _ret2 === 'object') return _ret2.v;
	  }

	  return b;
	}

	function reshapeTree(a, b, f) {
	  return _reshapeTree([], a, b, f);
	}

	function toOj(vals, keys) {
	  var ret = {};
	  vals.forEach(function (val, i) {
	    return ret[keys[i]] = val;
	  });
	  return ret;
	}

	function toArr(obj) {
	  var keys = Object.keys(obj);
	  var vals = keys.map(function (k) {
	    return obj[k];
	  });
	  return [keys, vals];
	}

	function reinsert(arr, from, to) {
	  arr = clone(arr);
	  var val = arr[from];
	  arr.splice(from, 1);
	  arr.splice(to, 0, val);
	  return arr;
	}

	function clamp(n, min, max) {
	  return n < min ? min : n > max ? max : n;
	}

/***/ },
/* 3 */
/***/ function(module, exports) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
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

	  var newX = x + v * frameRate;
	  var newV = v + a * frameRate;

	  if (Math.abs(newV - v) < errorMargin && Math.abs(newX - x) < errorMargin) {
	    return [destX, 0];
	  }

	  return [newX, newV];
	}

	module.exports = exports["default"];

/***/ }
/******/ ])
});
;