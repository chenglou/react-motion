import React, {PropTypes} from 'react';
import mapTree from './mapTree';
import isPlainObject from 'lodash.isPlainObject';
import stepper from './stepper';
import noVelocity from './noVelocity';
import mergeDiff from './mergeDiff';

const FRAME_RATE = 1 / 60;

function zero() {
  return 0;
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
      currVals: endValue,
      currV: mapTree(zero, endValue),
      now: null,
    };
  },

  componentDidMount() {
    this.raf(true, false);
  },

  componentWillReceiveProps() {
    this.raf(true, false);
  },

  componentWillUnmount() {
    cancelAnimationFrame(this._rafID);
  },

  _rafID: null,

  raf(justStarted, isLastRaf) {
    if (justStarted && this._rafID != null) {
      // already rafing
      return;
    }
    this._rafID = requestAnimationFrame(() => {
      const {currVals, currV, now} = this.state;
      let {endValue} = this.props;

      if (typeof endValue === 'function') {
        endValue = endValue(currVals);
      }
      const frameRate = now && !justStarted ? (Date.now() - now) / 1000 : FRAME_RATE;

      const newCurrVals = updateCurrVals(frameRate, currVals, currV, endValue);
      const newCurrV = updateCurrV(frameRate, currVals, currV, endValue);

      this.setState(() => {
        return {
          currVals: newCurrVals,
          currV: newCurrV,
          now: Date.now(),
        };
      });

      const stop = noVelocity(newCurrV);
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
          this._rafID = null;
        } else {
          this.raf(false, true);
        }
      } else {
        this.raf(false, false);
      }
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
      currVals: endValue,
      currV: mapTree(zero, endValue),
      now: null,
    };
  },

  componentDidMount() {
    this.raf(true, false);
  },

  componentWillReceiveProps() {
    this.raf(true, false);
  },

  componentWillUnmount() {
    cancelAnimationFrame(this._rafID);
  },

  _rafID: null,

  raf(justStarted, isLastRaf) {
    if (justStarted && this._rafID != null) {
      // already rafing
      return;
    }
    this._rafID = requestAnimationFrame(() => {
      let {currVals, currV} = this.state;
      const {now} = this.state;
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

        const mergedValsObj = mergeDiff(
          currValsObj,
          endValueObj,
          key => willLeave(key, endValue, currVals, currV)
        );

        let mergedValsKeys = Object.keys(mergedValsObj);
        mergedValsKeys
          .filter(key => !currValsObj.hasOwnProperty(key))
          .forEach(key => {
            const enterVal = willEnter(key, mergedValsObj[key], endValue, currVals, currV);
            currValsObj[key] = enterVal;
            // We want the willEnter value to be stored as the endValue (in this
            // case, since it's entering, doesn't matter) once. This is very
            // different than providing a mere data structure to make the
            // currVals, currV and endValue trees look the same for the purpose
            // of interpolating on trees of same shape, and then use endValue's
            // values to compute currentInterpolationValues anyway. Previously,
            // after providing willEnter value, we still use the non-numerical
            // values of endValue. But now that we use the non-numerical value
            // of willEnter once, we've effectively replace CSSTG since you can
            // let the react reconciler handle reconciling between 2 components
            // that differ by only a className
            mergedValsObj[key] = enterVal;
            currVObj[key] = mapTree(zero, currValsObj[key]);
          });

        mergedVals = mergedValsKeys.map(key => mergedValsObj[key]);
        currVals = Object.keys(currValsObj).map(key => currValsObj[key]);
        currV = Object.keys(currVObj).map(key => currVObj[key]);
      } else {
        // only other option is obj
        mergedVals = mergeDiff(
          currVals,
          endValue,
          // TODO: stop allocating like crazy in this whole code path
          key => willLeave(key, endValue, currVals, currV)
        );

        Object.keys(mergedVals)
          .filter(key => !currVals.hasOwnProperty(key))
          .forEach(key => {
            const enterVal = willEnter(key, mergedVals[key], endValue, currVals, currV);
            currVals[key] = enterVal;
            mergedVals[key] = enterVal;
            currV[key] = mapTree(zero, currVals[key]);
          });
      }

      const frameRate = now && !justStarted ? (Date.now() - now) / 1000 : FRAME_RATE;

      const newCurrVals = updateCurrVals(frameRate, currVals, currV, mergedVals);
      const newCurrV = updateCurrV(frameRate, currVals, currV, mergedVals);

      this.setState(() => {
        return {
          currVals: newCurrVals,
          currV: newCurrV,
          now: Date.now(),
        };
      });

      const stop = noVelocity(newCurrV);
      if (stop && !justStarted) {
        if (isLastRaf) {
          this._rafID = null;
        } else {
          this.raf(false, true);
        }
      } else {
        this.raf(false, false);
      }
    });
  },

  render() {
    const {currVals} = this.state;
    return React.Children.only(this.props.children(currVals));
  },
});
