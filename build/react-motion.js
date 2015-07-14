(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("react"));
	else if(typeof define === 'function' && define.amd)
		define(["react"], factory);
	else if(typeof exports === 'object')
		exports["ReactMotion"] = factory(require("react"));
	else
		root["ReactMotion"] = factory(root["React"]);
})(this, function(__WEBPACK_EXTERNAL_MODULE_2__) {
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
/******/ 	__webpack_require__.p = "build/";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	exports.__esModule = true;

	var _Spring = __webpack_require__(1);

	exports.Spring = _Spring.Spring;
	exports.TransitionSpring = _Spring.TransitionSpring;
	exports.utils = _Spring.utils;

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	exports.__esModule = true;
	exports.updateCurrVals = updateCurrVals;
	exports.updateCurrV = updateCurrV;
	exports.noSpeed = noSpeed;

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	var _react = __webpack_require__(2);

	var _react2 = _interopRequireDefault(_react);

	var _utils = __webpack_require__(3);

	var _stepper = __webpack_require__(4);

	var _stepper2 = _interopRequireDefault(_stepper);

	var FRAME_RATE = 1 / 60;

	function zero() {
	  return 0;
	}

	// TODO: test
	function mergeDiff(_x, _x2, _x3, _x4) {
	  var _again = true;

	  _function: while (_again) {
	    var collA = _x,
	        collB = _x2,
	        onRemove = _x3,
	        accum = _x4;
	    a = aa = b = bb = undefined;
	    _again = false;
	    var a = collA[0];
	    var aa = collA.slice(1);
	    var b = collB[0];
	    var bb = collB.slice(1);

	    if (collA.length === 0 && collB.length === 0) {
	      return accum;
	    }
	    if (collA.length === 0) {
	      return accum.concat(collB);
	    }
	    if (collB.length === 0) {
	      if (onRemove(a)) {
	        _x = aa;
	        _x2 = collB;
	        _x3 = onRemove;
	        _x4 = accum;
	        _again = true;
	        continue _function;
	      }
	      _x = aa;
	      _x2 = collB;
	      _x3 = onRemove;
	      _x4 = accum.concat(a);
	      _again = true;
	      continue _function;
	    }
	    if (a === b) {
	      // fails for ([undefined], [], () => true). but don't do that
	      _x = aa;
	      _x2 = bb;
	      _x3 = onRemove;
	      _x4 = accum.concat(a);
	      _again = true;
	      continue _function;
	    }
	    if (collB.indexOf(a) === -1) {
	      if (onRemove(a)) {
	        _x = aa;
	        _x2 = collB;
	        _x3 = onRemove;
	        _x4 = accum;
	        _again = true;
	        continue _function;
	      }
	      _x = aa;
	      _x2 = collB;
	      _x3 = onRemove;
	      _x4 = accum.concat(a);
	      _again = true;
	      continue _function;
	    }
	    _x = aa;
	    _x2 = collB;
	    _x3 = onRemove;
	    _x4 = accum;
	    _again = true;
	    continue _function;
	  }
	}

	function mergeDiffObj(a, b, onRemove) {
	  var keys = mergeDiff(Object.keys(a), Object.keys(b), function (_a) {
	    return !onRemove(_a);
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

	function updateCurrVals(frameRate, currVals, currV, endValue, k, b) {
	  if (endValue === null) {
	    return null;
	  }
	  if (typeof endValue === 'number') {
	    if (k == null || b == null) {
	      return endValue;
	    }
	    // TODO: do something to stepper to make this not allocate (2 steppers?)
	    return _stepper2['default'](frameRate, currVals, currV, endValue, k, b)[0];
	  }
	  if (endValue.val != null && endValue.config && endValue.config.length === 0) {
	    return endValue;
	  }
	  if (endValue.val != null) {
	    var _ref = endValue.config || [170, 26];

	    var _k = _ref[0];
	    var _b = _ref[1];

	    var ret = {
	      val: updateCurrVals(frameRate, currVals.val, currV.val, endValue.val, _k, _b)
	    };
	    if (endValue.config) {
	      ret.config = endValue.config;
	    }
	    return ret;
	  }
	  if (Array.isArray(endValue)) {
	    return endValue.map(function (_, i) {
	      return updateCurrVals(frameRate, currVals[i], currV[i], endValue[i], k, b);
	    });
	  }
	  if (_utils.isPlainObject(endValue)) {
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

	function updateCurrV(frameRate, currVals, currV, endValue, k, b) {
	  if (endValue === null) {
	    return null;
	  }
	  if (typeof endValue === 'number') {
	    if (k == null || b == null) {
	      return _utils.mapTree(zero, currV);
	    }
	    // TODO: do something to stepper to make this not allocate (2 steppers?)
	    return _stepper2['default'](frameRate, currVals, currV, endValue, k, b)[1];
	  }
	  if (endValue.val != null && endValue.config && endValue.config.length === 0) {
	    return _utils.mapTree(zero, currV);
	  }
	  if (endValue.val != null) {
	    var _ref2 = endValue.config || [170, 26];

	    var _k = _ref2[0];
	    var _b = _ref2[1];

	    var ret = {
	      val: updateCurrV(frameRate, currVals.val, currV.val, endValue.val, _k, _b)
	    };
	    if (endValue.config) {
	      ret.config = endValue.config;
	    }
	    return ret;
	  }
	  if (Array.isArray(endValue)) {
	    return endValue.map(function (_, i) {
	      return updateCurrV(frameRate, currVals[i], currV[i], endValue[i], k, b);
	    });
	  }
	  if (_utils.isPlainObject(endValue)) {
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
	  return _utils.mapTree(zero, currV);
	}

	function noSpeed(coll) {
	  if (Array.isArray(coll)) {
	    return coll.every(noSpeed);
	  }
	  if (_utils.isPlainObject(coll)) {
	    return Object.keys(coll).every(function (key) {
	      return key === 'config' ? true : noSpeed(coll[key]);
	    });
	  }
	  return typeof coll === 'number' ? coll === 0 : true;
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
	      endValue = endValue();
	    }
	    return {
	      currVals: endValue,
	      currV: _utils.mapTree(zero, endValue),
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

	    return _react2['default'].Children.only(this.props.children(currVals));
	  }
	});

	exports.Spring = Spring;
	var TransitionSpring = _react2['default'].createClass({
	  displayName: 'TransitionSpring',

	  propTypes: {
	    endValue: _react.PropTypes.oneOfType([_react.PropTypes.func, _react.PropTypes.object]).isRequired,
	    willLeave: _react.PropTypes.oneOfType([_react.PropTypes.func, _react.PropTypes.object, _react.PropTypes.array]),
	    willEnter: _react.PropTypes.oneOfType([_react.PropTypes.func, _react.PropTypes.object, _react.PropTypes.array]),
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
	      currVals: endValue,
	      currV: _utils.mapTree(zero, endValue),
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
	      var now = _this2.state.now;
	      var endValue = _this2.props.endValue;
	      var _props = _this2.props;
	      var willEnter = _props.willEnter;
	      var willLeave = _props.willLeave;

	      if (typeof endValue === 'function') {
	        endValue = endValue(currVals);
	      }

	      var mergedVals = undefined;
	      if (Array.isArray(endValue)) {
	        (function () {
	          var currValsObj = {};
	          currVals.forEach(function (objWithKey) {
	            currValsObj[objWithKey.key] = objWithKey;
	          });

	          var endValueObj = {};
	          endValue.forEach(function (objWithKey) {
	            endValueObj[objWithKey.key] = objWithKey;
	          });
	          var currVObj = {};
	          endValue.forEach(function (objWithKey) {
	            currVObj[objWithKey.key] = objWithKey;
	          });

	          var mergedValsObj = mergeDiffObj(currValsObj, endValueObj, function (key) {
	            return willLeave(key, endValue, currVals, currV);
	          });

	          var mergedValsKeys = Object.keys(mergedValsObj);
	          mergedVals = mergedValsKeys.map(function (key) {
	            return mergedValsObj[key];
	          });
	          mergedValsKeys.filter(function (key) {
	            return !currValsObj.hasOwnProperty(key);
	          }).forEach(function (key) {
	            currValsObj[key] = willEnter(key, mergedValsObj[key], endValue, currVals, currV);
	            currVObj[key] = _utils.mapTree(zero, currValsObj[key]);
	          });

	          currVals = Object.keys(currValsObj).map(function (key) {
	            return currValsObj[key];
	          });
	          currV = Object.keys(currVObj).map(function (key) {
	            return currVObj[key];
	          });
	        })();
	      } else {
	        // only other option is obj
	        mergedVals = mergeDiffObj(currVals, endValue,
	        // TODO: stop allocating like crazy in this whole code path
	        function (key) {
	          return willLeave(key, endValue, currVals, currV);
	        });

	        // TODO: check if this is necessary
	        currVals = _utils.clone(currVals);
	        currV = _utils.clone(currV);
	        Object.keys(mergedVals).filter(function (key) {
	          return !currVals.hasOwnProperty(key);
	        }).forEach(function (key) {
	          // TODO: param format changed, check other demos
	          currVals[key] = willEnter(key, mergedVals[key], endValue, currVals, currV);
	          currV[key] = _utils.mapTree(zero, currVals[key]);
	        });
	      }

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

	    return _react2['default'].Children.only(this.props.children(currVals));
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
/* 2 */
/***/ function(module, exports) {

	module.exports = __WEBPACK_EXTERNAL_MODULE_2__;

/***/ },
/* 3 */
/***/ function(module, exports) {

	'use strict';

	exports.__esModule = true;
	exports.isPlainObject = isPlainObject;
	exports.clone = clone;
	exports.mapTree = mapTree;
	exports.reinsert = reinsert;
	exports.clamp = clamp;
	exports.range = range;

	function isPlainObject(obj) {
	  return obj ? typeof obj === 'object' && Object.getPrototypeOf(obj) === Object.prototype : false;
	}

	// damn it JS

	function clone(coll) {
	  return JSON.parse(JSON.stringify(coll));
	}

	// export function eq(a, b) {
	//   return JSON.stringify(a) === JSON.stringify(b);
	// }

	// currenly a helper used for producing a tree of the same shape as the
	// input(s),  but with different values. It's technically not a real `map`
	// equivalent for trees, since it skips calling f on non-numbers.

	// TODO: probably doesn't need path, stop allocating uselessly
	// TODO: don't need to map over many trees anymore
	// TODO: skipping non-numbers is weird and non-generic. Use pre-order traversal
	// assume trees are of the same shape
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
	  if (isPlainObject(t1)) {
	    var _ret = (function () {
	      var newTree = {};
	      Object.keys(t1).forEach(function (key) {
	        newTree[key] = _mapTree([].concat(path, [key]), f, trees.map(function (val) {
	          return val[key];
	        }));
	      });
	      return {
	        v: newTree
	      };
	    })();

	    if (typeof _ret === 'object') return _ret.v;
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

	// function _reshapeTree(path, a, b, f) {
	//   if (a == null) {
	//     throw new Error('wtf2');
	//   }

	//   if (b == null) {
	//     return f(path, a);
	//   }

	//   if (Array.isArray(a)) {
	//     return a.map((val, i) => _reshapeTree([...path, i], val, b[i], f));
	//   }
	//   if (Object.prototype.toString.call(a) === '[object Object]') {
	//     const newTree = {};
	//     Object.keys(a).forEach(key => {
	//       newTree[key] = _reshapeTree([...path, key], a[key], b[key], f);
	//     });
	//     return newTree;
	//   }

	//   return b;
	// }

	// export function reshapeTree(a, b, f) {
	//   return _reshapeTree([], a, b, f);
	// }

	// export function toOj(vals, keys) {
	//   const ret = {};
	//   vals.forEach((val, i) => ret[keys[i]] = val);
	//   return ret;
	// }

	// export function toArr(obj) {
	//   const keys = Object.keys(obj);
	//   const vals = keys.map(k => obj[k]);
	//   return [keys, vals];
	// }

	// TODO: these are for a demos, not for the library. Move

	function reinsert(arr, from, to) {
	  var _arr = arr.slice(0);
	  var val = _arr[from];
	  _arr.splice(from, 1);
	  _arr.splice(to, 0, val);
	  return _arr;
	}

	function clamp(n, min, max) {
	  return Math.max(Math.min(n, max), min);
	}

	function range(start, afterStop) {
	  var _afterStop = afterStop;
	  var _start = start;
	  if (afterStop == null) {
	    _afterStop = start;
	    _start = 0;
	  }
	  var ret = [];
	  for (var i = _start; i < _afterStop; i++) {
	    ret.push(i);
	  }
	  return ret;
	}

/***/ },
/* 4 */
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

/***/ }
/******/ ])
});
;