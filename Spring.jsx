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

// see stepper for constant k, b usage
function update(tree, k = 170, b = 26) {
  return {
    __springK: k,
    __springB: b,
    value: tree,
  };
}

function stripMarks(tree) {
  if (tree != null && tree.__springK != null) {
    return stripMarks(tree.value);
  }
  if (Object.prototype.toString.call(tree) === '[object Array]') {
    return tree.map(stripMarks);
  }
  if (Object.prototype.toString.call(tree) === '[object Object]') {
    let newTree = {};
    Object.keys(tree).forEach(key => newTree[key] = stripMarks(tree[key]));
    return newTree;
  }
  // scalar
  return tree;
}

function updateValsAndV(frameRate, currVals, currV, destVals, k = -1, b = -1) {
  if (destVals != null && destVals.__springK != null) {
    return updateValsAndV(frameRate, currVals, currV, destVals.value, destVals.__springK, destVals.__springB);
  }
  if (Object.prototype.toString.call(destVals) === '[object Array]') {
    let newCurrVals = new Array(destVals.length);
    let newCurrV = new Array(destVals.length);
    destVals.forEach((val, i) => {
      let [nextCurVals, nextCurV] = updateValsAndV(frameRate, currVals[i], currV[i], val, k, b);
      newCurrVals[i] = nextCurVals;
      newCurrV[i] = nextCurV;
    });

    return [newCurrVals, newCurrV];
  }
  if (Object.prototype.toString.call(destVals) === '[object Object]') {
    let newCurrVals = {};
    let newCurrV = {};
    Object.keys(destVals).forEach(key => {
      let [nextCurVals, nextCurV] = updateValsAndV(frameRate, currVals[key], currV[key], destVals[key], k, b);
      newCurrVals[key] = nextCurVals;
      newCurrV[key] = nextCurV;
    });
    return [newCurrVals, newCurrV];
  }

  // haven't received any update from parent yet
  if (k === -1 || b === -1) {
    return [destVals, currV];
  }
  return stepper(frameRate, currVals, currV, destVals, k, b);
}

// assume a, b same shape
// mutation, bc perf
function prewalkAndMutatePosAndVTree(frameRate, pos, v, dest, k = -1, b = -1) {
  if (dest == null) {
    return;
  }
  if (dest.__springK != null) {
    // mutation here!
    k = dest.__springK;
    b = dest.__springB;
    dest = dest.value;
  }
  if (Object.prototype.toString.call(pos) === '[object Array]') {
    for (let i = 0; i < pos.length; i++) {
      // console.log(pos[i]);
      if (typeof pos[i] === 'number') {
        if (k === -1 || b === -1) {
         pos[i] = dest[i];
         v[i] = 0;
        } else {
          let [newPos, newV] = stepper(frameRate, pos[i], v[i], dest[i], k, b);
          pos[i] = newPos;
          v[i] = newV;
        }
      } else {
        prewalkAndMutatePosAndVTree(frameRate, pos[i], v[i], dest[i], k, b, i === 0);
      }
    }
  } else if (Object.prototype.toString.call(pos) === '[object Object]') {
    for (let key in pos) {
      if (typeof pos[key] === 'number') {
        if (k === -1 || b === -1) {
         pos[key] = dest[key];
         v[key] = 0;
        } else {
          let [newPos, newV] = stepper(frameRate, pos[key], v[key], dest[key], k, b);
          pos[key] = newPos;
          v[key] = newV;
        }
      } else {
        prewalkAndMutatePosAndVTree(frameRate, pos[key], v[key], dest[key], k, b);
      }
    }
  }
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

let warnedOwners = {};

function checkEndValues(endValue, component) {
  if (typeof endValue !== 'function') {
    return;
  }
  if (endValue.length > 0) {
    return;
  }
  let owner = component._reactInternalInstance._currentElement._owner;
  let ownerName = owner && owner.getName();
  if (!warnedOwners[ownerName]) {
    warnedOwners[ownerName] = true;
    console.warn(
      `You're passing a function to Spring prop \`endValue\` which doesn't \
receive \`update\` as the first argument. In this case, nothing will be \
animated. Were you trying to use the shorthand of directly passing a value \
(which calls \`update\` for you on the whole value under the hood)?. Check \
the render of \`${ownerName}\`.`
    );
  }
}

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
    let vals;
    if (typeof endValue === 'function') {
      vals = endValue(update);
    } else {
      vals = endValue;
    }
    let defaultVals = stripMarks(vals);
    return {
      currVals: defaultVals,
      currV: mapTree(zero, defaultVals),
      now: null,
    };
  },

  componentDidMount() {
    if (__DEV__) {
      checkEndValues(this.props.endValue, this);
    }
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

      if (__DEV__) {
        checkEndValues(endValue, this);
      }
      // TODO: lol, refactor
      let annotatedVals;
      if (typeof endValue === 'function') {
        annotatedVals = endValue(update, currVals);
      } else {
        annotatedVals = update(endValue);
      }
      currVals = clone(currVals);
      currV = clone(currV);
      // TODO: change frame rate
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

      this.setState(() => {
        return {
          currVals,
          currV,
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
    let vals;
    if (typeof endValue === 'function') {
      vals = endValue(update);
    } else {
      vals = endValue;
    }
    let defaultVals = stripMarks(vals);
    return {
      currVals: defaultVals,
      currV: mapTree(zero, defaultVals),
      now: null,
    };
  },

  componentDidMount() {
    if (__DEV__) {
      checkEndValues(this.props.endValue, this);
    }
    this.raf();
  },

  componentWillUnmount() {
    cancelAnimationFrame(this._rafID);
  },

  _rafID: null,

  raf() {
    this._rafID = requestAnimationFrame(() => {
      let {currVals, currV, now} = this.state;
      let {
        endValue,
        willEnter,
        willLeave,
      } = this.props;

      if (__DEV__) {
        checkEndValues(endValue, this);
      }
      let annotatedVals;
      if (typeof endValue === 'function') {
        annotatedVals = endValue(update, currVals);
      } else {
        annotatedVals = update(endValue);
      }

      let strippedVals = stripMarks(annotatedVals);
      let shallowStrippedVals = annotatedVals.__springK == null ?
        annotatedVals :
        annotatedVals.value;

      let shallowStrippedMergedVals = mergeDiffObj(
        currVals,
        shallowStrippedVals,
        key => willLeave(key, update, strippedVals, currVals, currV),
      );

      let mergedVals = annotatedVals.__springK == null ?
        shallowStrippedMergedVals :
        update(shallowStrippedMergedVals, annotatedVals.__springK, annotatedVals.__springB);

      currVals = clone(currVals);
      currV = clone(currV);
      Object.keys(shallowStrippedMergedVals)
        .filter(key => !currVals.hasOwnProperty(key))
        .forEach(key => {
          currVals[key] = willEnter(key, strippedVals, currVals);
          currV[key] = mapTree(zero, currVals[key]);
        });

      let frameRate = now ? (Date.now() - now) / 1000 : FRAME_RATE;

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
        prewalkAndMutatePosAndVTree(FRAME_RATE, currVals, currV, mergedVals);
      }

      this.setState(() => {
        return {
          currVals,
          currV,
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
