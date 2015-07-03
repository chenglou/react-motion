'use strict';

import React, {PropTypes} from 'react';
import {mapTree, clone} from './utils';
import stepper from './stepper';

let hackOn = false;
window.interval = 1000 / 60;
window.addEventListener('keypress', e => {
  if (e.which === 100) {
    hackOn = !hackOn;
    window.interval = hackOn ? 10000 : 1000 / 60;
  }
});

function requestAnimationFrame(f) {
  setTimeout(f, window.interval);
}

function zero() {
  return 0;
}

// dv = defaultValue
// iv = initialValue, used each frame, power user modification to curr vals
// fv = finalValue

// dv={obj}
// iv={cur => obj}
// fv={cur => obj}
// 1. no anim
// 2. has anim
// a. dv, iv, fv
// b. iv, fv

// 1a.
// 1b.

// iv={cur? => obj}
// fv={cur? => obj}

// see stepper for constant k, b usage
function tween(tree, k = 120, b = 16) {
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

// see stepper for constant k, b usage
function updateVals(frameRate, currVals, currV, destVals, k = -1, b = -1) {
  if (destVals != null && destVals.__springK != null) {
    return updateVals(frameRate, currVals, currV, destVals.value, destVals.__springK, destVals.__springB);
  }
  if (Object.prototype.toString.call(destVals) === '[object Array]') {
    return destVals.map((val, i) => updateVals(frameRate, currVals[i], currV[i], val, k, b));
  }
  if (Object.prototype.toString.call(destVals) === '[object Object]') {
    let newTree = {};
    Object.keys(destVals).forEach(key => {
      newTree[key] = updateVals(frameRate, currVals[key], currV[key], destVals[key], k, b);
    });
    return newTree;
  }
  // haven't received any tween from parent yet
  if (k === -1 || b === -1) {
    return destVals;
  }
  return stepper(frameRate, currVals, currV, destVals, k, b)[0];
}

function updateV(frameRate, currVals, currV, destVals, k = -1, b = -1) {
  if (destVals != null && destVals.__springK != null) {
    return updateV(frameRate, currVals, currV, destVals.value, destVals.__springK, destVals.__springB);
  }
  if (Object.prototype.toString.call(destVals) === '[object Array]') {
    return destVals.map((val, i) => updateV(frameRate, currVals[i], currV[i], val, k, b));
  }
  if (Object.prototype.toString.call(destVals) === '[object Object]') {
    let newTree = {};
    Object.keys(destVals).forEach(key => {
      newTree[key] = updateV(frameRate, currVals[key], currV[key], destVals[key], k, b);
    });
    return newTree;
  }
  // haven't received any tween from parent yet
  if (k === -1 || b === -1) {
    return currV;
  }
  return stepper(frameRate, currVals, currV, destVals, k, b)[1];
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

export let Diff = Springs => React.createClass({
  propTypes: {
    onAdd: PropTypes.func.isRequired,
    onRemove: PropTypes.func.isRequired,
  },

  mergeDestVals(strippedDestVals, currVals, currV) {
    let {onAdd, onRemove} = this.props;

    let unwrappedMergedDestVals = mergeDiffObj(
      currVals,
      strippedDestVals,
      key => onRemove(key, tween, strippedDestVals, currVals, currV),
    );

    return unwrappedMergedDestVals;
  },

  render() {
    return <Springs
              // differ={mergeDiffObj}
              // onAdd={defaultOnAdd}
              // onRemove={defaultOnRemove}
              {...this.props}
              mergeDestVals={this.mergeDestVals}/>;
  }
});

// tween({
//   a: {
//     x: 50,
//     y: 100
//   },
//   b: {
//     x: 0,
//     y: 0
//   },
// });

// let a = {
//   __springB: 16,
//   __springK: 100,
//   value: {
//     a: {
//       x: 50,
//       y: 100
//     },
//     b: {
//       x: 0,
//       y: 0
//     },
//   }
// };

// let b = {
//   a: {
//     x: 50,
//     y: 100
//   },
//   b: {
//     __springK: 0,
//     __springB: 0,
//     value: {
//       x: 0,
//       y: 0
//     }
//   },
// };

// let [s, wrapAgain] = stripAndSave(a);
// let asd = wrapAgain(b);
// console.log(s, asd);

function wrapAgain(prevTree, newTree) {
  if (prevTree != null && prevTree.__springK != null) {
    return tween(wrapAgain(prevTree.value, newTree), prevTree.__springK, prevTree.__springB);
  }

  if (newTree != null && newTree.__springK != null) {
    return tween(wrapAgain(prevTree, newTree.value), newTree.__springK, newTree.__springB);
  }

  if (Object.prototype.toString.call(prevTree) === '[object Array]') {
    // TODO: what if the two arrays aren't of the same length....?
    return prevTree.map((v, i) => wrapAgain(v, newTree[i]));
  }
  if (Object.prototype.toString.call(prevTree) === '[object Object]') {
    let cur = {};
    Object.keys(prevTree).forEach(key => cur[key] = wrapAgain(prevTree[key], newTree[key]));
    Object.keys(newTree).forEach(key => cur[key] = cur.hasOwnProperty(key) ? cur[key] : wrapAgain(prevTree[key], newTree[key]));
    return cur;
  }

  return newTree;
}

export default React.createClass({
  propTypes: {
    startVals: PropTypes.func,
    finalVals: PropTypes.func.isRequired,
    onAdd: PropTypes.func,
    // onRemove: PropTypes.func,
  },

  getInitialState() {
    let {startVals, finalVals} = this.props;
    let defaultVals = stripMarks(
      (startVals && startVals(null, tween)) || finalVals(null, tween)
    );
    return {
      currVals: defaultVals,
      currV: mapTree(zero, defaultVals),
      now: null,
    };
  },

  raf() {
    requestAnimationFrame(() => {
      let {currVals, currV, now} = this.state;
      let {finalVals, mergeDestVals, changeCurr, onAdd} = this.props;
      // let {finalVals, onAdd, onRemove, changeCurr, differ} = this.props;
      // if(!differ) differ = mergeDiffObj;

      let markedDestVals = finalVals(currVals, tween);
      let strippedDestVals = stripMarks(markedDestVals);
      // let mary = markedDestVals.__springK == null ? markedDestVals : markedDestVals.value;

      // let strippedDestVals = stripMarks(markedDestVals);

      // let unwrappedMergedDestVals = differ(
      //   currVals,
      //   mary,
      //   key => onRemove(key, tween, strippedDestVals, currVals, currV),
      // );
      let unwrappedMergedDestVals = mergeDestVals(strippedDestVals, currVals, currV);

      let rewrappedMergedDestVals = wrapAgain(markedDestVals, unwrappedMergedDestVals);

      // let rewrappedMergedDestVals = markedDestVals.__springK == null ?
      //     unwrappedMergedDestVals :
      //     tween(unwrappedMergedDestVals, markedDestVals.__springK, markedDestVals.__springB);

      currVals = clone(currVals);
      currV = clone(currV);
      Object.keys(unwrappedMergedDestVals)
        .filter(key => !currVals.hasOwnProperty(key))
        .forEach(key => {
          currVals[key] = onAdd(key, strippedDestVals, currVals);
          currV[key] = mapTree(zero, currVals[key]);
        });

      let frameRate = (now ? Date.now() - now : 16) / 1000;
      let newCurrVals = updateVals(frameRate, currVals, currV, rewrappedMergedDestVals);
      let newCurrV = updateV(frameRate, currVals, currV, rewrappedMergedDestVals);

      if(changeCurr) {
        [newCurrVals, newCurrV] = changeCurr(newCurrVals, newCurrV);
      }

      // if(reduceCurrVals) {
      //   let prev = null;
      //   for(var key in newCurrVals) {
      //     newCurrVals[key] = reduceCurrVals(prev, newCurrVals[key], key);
      //     prev = newCurrVals[key];
      //   }
      // }
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

  componentDidMount() {
    this.raf();
  },

  render() {
    let {currVals} = this.state;
    return (
      <div {...this.props}>
        {this.props.children(currVals)}
      </div>
    );
  }
});
