'use strict';
import React from 'react';
import {mapTree, reshapeTree} from './utils';
import stepper from './stepper';

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
function update(tree, k = 120, b = 16) {
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

function stripNothingButMarks(tree) {
  if (tree != null && tree.__spring) {
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
function updateVals(currVals, currV, destVals, k, b) {
  if (destVals != null && destVals.__springK != null) {
    return updateVals(currVals, currV, destVals.value, destVals.__springK, destVals.__springB);
  }
  if (Object.prototype.toString.call(destVals) === '[object Array]') {
    return destVals.map((val, i) => updateVals(currVals[i], currV[i], val, k, b));
  }
  if (Object.prototype.toString.call(destVals) === '[object Object]') {
    let newTree = {};
    Object.keys(destVals).forEach(key => {
      newTree[key] = updateVals(currVals[key], currV[key], destVals[key], k, b);
    });
    return newTree;
  }
  // scalar
  return stepper(currVals, currV, destVals, k, b)[0];
}

function updateV(currVals, currV, destVals, k, b) {
  if (destVals != null && destVals.__springK != null) {
    return updateV(currVals, currV, destVals.value, destVals.__springK, destVals.__springB);
  }
  if (Object.prototype.toString.call(destVals) === '[object Array]') {
    return destVals.map((val, i) => updateV(currVals[i], currV[i], val, k, b));
  }
  if (Object.prototype.toString.call(destVals) === '[object Object]') {
    let newTree = {};
    Object.keys(destVals).forEach(key => {
      newTree[key] = updateV(currVals[key], currV[key], destVals[key], k, b);
    });
    return newTree;
  }
  // scalar
  return stepper(currVals, currV, destVals, k, b)[1];
}

export default React.createClass({
  getInitialState: function() {
    let {startVal, finalVals} = this.props;
    let defaultVals = stripMarks(
      (startVal && startVal(null, update)) || finalVals(null, update)
    );
    return {
      currVals: defaultVals,
      currV: mapTree(zero, defaultVals),
    };
  },

  raf: function() {
    requestAnimationFrame(() => {
      let {currVals, currV} = this.state;
      let {finalVals, defaultNewTreeVal} = this.props;

      // marked up update()s
      // use this exact tree with its annotation
      // interpolate
      // return mark-less current values tree
      let markedDestVals = finalVals(currVals, update);

      let newCurrVals = updateVals(currVals, currV, markedDestVals, 120, 16);
      let newCurrV = updateV(currVals, currV, markedDestVals, 120, 16);



      // let patchedCurrV = reshapeTree(
      //   destVals,
      //   currV,
      //   // TODO: expose
      //   (_, val) => mapTree(zero, val),
      // );
      // let patchedCurrVals = reshapeTree(
      //   destVals,
      //   currVals,
      //   // TODO: le expose
      //   defaultNewTreeVal || ((_, val) => mapTree(zero, val)),
      // );

      // patchedCurrVals = currVals;
      // patchedCurrV = currV;

      // let newCurrVals = mapTree(
      //   // TODO: expose spring params
      //   (_, x, vx, destX) => stepper(x, vx, destX, 120, 16)[0],
      //   patchedCurrVals,
      //   patchedCurrV,
      //   destVals,
      // );
      // let newCurrV = mapTree(
      //   // TODO: expose spring params
      //   (_, x, vx, destX) => stepper(x, vx, destX, 120, 16)[1],
      //   patchedCurrVals,
      //   patchedCurrV,
      //   destVals,
      // );

      this.setState(() => {
        return {
          currVals: newCurrVals,
          currV: newCurrV,
        };
      });

      this.raf();
    });
  },

  componentDidMount: function() {
    this.raf();
  },

  render: function() {
    let {currVals} = this.state;
    return (
      <div>
        {this.props.children(currVals)}
      </div>
    );
  }
});
