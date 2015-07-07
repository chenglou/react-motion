import React, {PropTypes} from 'react';
import {range, mapTree, clone} from './utils';
import stepper from './stepper';

let hackOn = null;
let hackOn2 = null;
window.addEventListener('keypress', ({which}) => {
  if (which === 50) {
    hackOn = hackOn == null ? 10 : null;
  }
  if(which === 51) {
    hackOn2 = hackOn2 == null ? {data: [], curr: -1} : null;
  }
});

// ---------
let FRAME_RATE = 1 / 60;

function zero() {
  return 0;
}

function mergeDiff(collA, collB, onRemove, accum) {
  let [a, ...aa] = collA;
  let [b, ...bb] = collB;

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
  let keys = mergeDiff(Object.keys(a), Object.keys(b), a => !onRemove(a), []);
  let ret = {};
  keys.forEach(key => {
    if (b.hasOwnProperty(key)) {
      ret[key] = b[key];
    } else {
      ret[key] = onRemove(key);
    }
  });

  return ret;
}

function updateCurrVals(frameRate, currVals, currV, endValue, k = 170, b = 26) {
  if (typeof endValue === 'number') {
    return stepper(frameRate, currVals, currV, endValue, k, b)[0];
  }
  if (endValue.val != null && endValue.config && endValue.config.length === 0) {
    return endValue;
  }
  if (endValue.val != null) {
    let [k, b] = endValue.config || [170, 26];
    return {
      val: updateCurrVals(frameRate, currVals.val, currV.val, endValue.val, k, b),
      config: endValue.config,
    };
  }
  if (Object.prototype.toString.call(endValue) === '[object Array]') {
    return endValue.map((_, i) => updateCurrVals(frameRate, currVals[i], currV[i], endValue[i], k, b));
  }
  if (Object.prototype.toString.call(endValue) === '[object Object]') {
    let ret = {};
    Object.keys(endValue).forEach(key => {
      ret[key] = updateCurrVals(frameRate, currVals[key], currV[key], endValue[key], k, b);
    });
    return ret;
  }
  return endValue;
}

function updateCurrV(frameRate, currVals, currV, endValue, k = 170, b = 26) {
  if (typeof endValue === 'number') {
    return stepper(frameRate, currVals, currV, endValue, k, b)[1];
  }
  if (endValue.val != null && endValue.config && endValue.config.length === 0) {
    return mapTree(zero, currV);
  }
  if (endValue.val != null) {
    let [k, b] = endValue.config || [170, 26];
    return {
      val: updateCurrV(frameRate, currVals.val, currV.val, endValue.val, k, b),
      config: endValue.config,
    };
  }
  if (Object.prototype.toString.call(endValue) === '[object Array]') {
    return endValue.map((_, i) => updateCurrV(frameRate, currVals[i], currV[i], endValue[i], k, b));
  }
  if (Object.prototype.toString.call(endValue) === '[object Object]') {
    let ret = {};
    Object.keys(endValue).forEach(key => {
      ret[key] = updateCurrV(frameRate, currVals[key], currV[key], endValue[key], k, b);
    });
    return ret;
  }
  return mapTree(zero, currV);
}

// let a = {order: {val: [10]}};
// let b = {order: {val: [0]}};
// let c = {order: {val: [100]}};
// // debugger;
// let d = updateCurrVals(1/60, a, b, c);
// console.log(d);

export default React.createClass({
  propTypes: {
    endValue: PropTypes.oneOfType([
      PropTypes.func,
      PropTypes.object,
      PropTypes.number,
    ]).isRequired,
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
    this.raf();
  },

  componentWillUnmount() {
    cancelAnimationFrame(this._rafID);
  },

  _rafID: null,

  raf() {
    this._rafID = requestAnimationFrame(() => {
      let {currVals, currV, now} = this.state;
      let {endValue} = this.props;

      if (typeof endValue === 'function') {
        endValue = endValue(currVals);
      }
      // TODO: change frame rate
      let newCurrVals = updateCurrVals(FRAME_RATE, currVals, currV, endValue);
      let newCurrV = updateCurrV(FRAME_RATE, currVals, currV, endValue);

      this.setState(() => {
        return {
          currVals: newCurrVals,
          currV: newCurrV,
        };
      });

      this.raf();
    });
  },

  render() {
    let {currVals, currV} = this.state;
    if(hackOn2 != null) {
      if(hackOn2.curr === hackOn2.data.length - 1) {
        hackOn2.data.push([currVals, currV]);
        hackOn2.curr = hackOn2.data.length - 1;
      }
      currVals = hackOn2.data[hackOn2.curr][0];
      currV = hackOn2.data[hackOn2.curr][1];

      // Dirty mutations for the sake of time travel
      this.state.currVals = currVals;
      this.state.currV = currV;
    }

    if(hackOn != null) {
      let {endValue} = this.props;
      return <div {...this.props}>{
        range(hackOn)
        .reduce((acc) => {
          let [currVals, currV] = acc[acc.length - 1];

          let annotatedVals;
          if (typeof endValue === 'function') {
            annotatedVals = endValue(update, currVals);
          } else {
            annotatedVals = update(endValue);
          }

          currVals = clone(currVals);
          currV = clone(currV);
          if (typeof currVals === 'number') {
            [currVals, currV] = stepper(
              FRAME_RATE,
              currVals,
              currV,
              annotatedVals.value,
              annotatedVals.__springK,
              annotatedVals.__springB
            );
          } else {
            prewalkAndMutatePosAndVTree(FRAME_RATE, currVals, currV, annotatedVals);
          }

          return [...acc, [currVals, currV]];
        }, [[currVals, currV]])
        .map(([currVals]) => {
          return (
            <span style={{opacity: 0.2}}>
              {hackOn2 != null &&
                <div style={{position: 'absolute', left: 300, zIndex: 100, top: 0}}><input
                    type="range"
                    min={0}
                    max={hackOn2.data.length - 1}
                    value={hackOn2.curr}
                    onChange={({target: {value}}) => {
                      hackOn2.curr = parseInt(value);
                    }} />
                    {hackOn2.curr}
                </div>}
              {this.props.children(currVals)}
            </span>
          );
        })}</div>;
    }

    return (<div {...this.props}>
      {hackOn2 != null &&
        <div style={{position: 'absolute', left: 300, zIndex: 100, top: 0}}><input
            type="range"
            min={0}
            max={hackOn2.data.length - 1}
            value={hackOn2.curr}
            onChange={({target: {value}}) => {
              hackOn2.curr = parseInt(value);
            }} />
            {hackOn2.curr}
        </div>}
      {this.props.children(currVals)}
    </div>);
  }
});


export let TransitionSpring = React.createClass({
  propTypes: {
    endValue: PropTypes.oneOfType([
      PropTypes.func,
      // TODO: better warning
      PropTypes.object,
      PropTypes.arrayOf(PropTypes.shape({
        key: PropTypes.any.isRequired,
      })),
      PropTypes.arrayOf(PropTypes.element),
    ]).isRequired,
    willLeave: PropTypes.oneOfType([
      PropTypes.func,
      // TODO: better warning
      PropTypes.object,
    ]),
    willEnter: PropTypes.oneOfType([
      PropTypes.func,
      // TODO: better warning
      PropTypes.object,
    ]),
  },

  getDefaultProps() {
    return {
      willEnter: (key, currVals) => currVals[key],
      willLeave: () => null
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
    this.raf();
  },

  componentWillUnmount() {
    cancelAnimationFrame(this._rafID);
  },

  _rafID: null,

  raf() {
    this._rafID = requestAnimationFrame(() => {
      let {currVals, currV, now} = this.state;
      let {endValue, willEnter, willLeave} = this.props;

      if (typeof endValue === 'function') {
        endValue = endValue(currVals);
      }

      let mergedVals = mergeDiffObj(
        currVals,
        endValue,
        key => willLeave(key, endValue, currVals, currV),
      );

      currVals = clone(currVals);
      currV = clone(currV);
      Object.keys(mergedVals)
        .filter(key => !currVals.hasOwnProperty(key))
        .forEach(key => {
          currVals[key] = willEnter(key, endValue, currVals);
          currV[key] = mapTree(zero, currVals[key]);
        });

      let frameRate = now ? (Date.now() - now) / 1000 : FRAME_RATE;

      // TODO: change frame rate
      let newCurrVals = updateCurrVals(FRAME_RATE, currVals, currV, mergedVals);
      let newCurrV = updateCurrV(FRAME_RATE, currVals, currV, mergedVals);

      this.setState(() => {
        return {
          currVals: newCurrVals,
          currV: newCurrV,
          now: Date.now(),
        };
      });

      this.raf();
    });
  },

  render() {
    let {currVals} = this.state;
    return (<div {...this.props}>
      {this.props.children(currVals)}
    </div>);
  },
});
