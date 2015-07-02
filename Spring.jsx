import React, {PropTypes} from 'react';
import {mapTree, clone} from './utils';
import stepper from './stepper';

let hackOn = false;
window.interval = 1000 / 60;
window.addEventListener('keypress', e => {
  if (e.which === 100) {
    hackOn = !hackOn;
    window.interval = hackOn ? 3000 : 1000 / 60;
  }
});

function requestAnimationFrame(f) {
  setTimeout(f, window.interval);
}

// ---------
let FRAME_RATE = 1 / 60;

function zero() {
  return 0;
}

// see stepper for constant k, b usage
function tween(tree, k = 170, b = 26) {
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
      if(key === 'key') {
        newTree[key] = destVals[key];
        return;
      }
      newTree[key] = updateVals(frameRate, currVals[key], currV[key], destVals[key], k, b);
    });
    return newTree;
  }
  if(Object.prototype.toString.call(destVals) === '[object String]') {
    return destVals;
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
      if(key === 'key') {
        newTree[key] = destVals[key];
        return;
      }
      newTree[key] = updateV(frameRate, currVals[key], currV[key], destVals[key], k, b);
    });
    return newTree;
  }
  if(Object.prototype.toString.call(destVals) === '[object String]') {
    return destVals;
  }
  // haven't received any tween from parent yet
  if (k === -1 || b === -1) {
    return currV;
  }
  return stepper(frameRate, currVals, currV, destVals, k, b)[1];
}

function getIn(arr, val) {
  if(val.__springB || val.__springK) val = val.value;
  return arr.filter(v => v.key === val.key)[0];
}

function updateVals2(frameRate, currVals, currV, destVals, k = -1, b = -1) {
  if (destVals != null && destVals.__springK != null) {
    return updateVals2(frameRate, currVals, currV, destVals.value, destVals.__springK, destVals.__springB);
  }
  if (Object.prototype.toString.call(destVals) === '[object Array]') {
    return destVals.map(val => updateVals2(frameRate, getIn(currVals, val), getIn(currV, val), val, val.__springK ? val.__springK : k, val.__springB ? val.__springB : b));
  }
  if (Object.prototype.toString.call(destVals) === '[object Object]') {
    let newTree = {};
    Object.keys(destVals).forEach(key => {
      if(key === 'key') {
        newTree[key] = destVals[key];
        return;
      }
      newTree[key] = updateVals2(frameRate, currVals[key], currV[key], destVals[key], k, b);
    });
    return newTree;
  }
  if(Object.prototype.toString.call(destVals) === '[object String]') {
    return destVals;
  }
  // haven't received any tween from parent yet
  if (k === -1 || b === -1) {
    return destVals;
  }

  return stepper(frameRate, currVals, currV, destVals, k, b)[0];
}

function updateV2(frameRate, currVals, currV, destVals, k = -1, b = -1) {
  if (destVals != null && destVals.__springK != null) {
    return updateV2(frameRate, currVals, currV, destVals.value, destVals.__springK, destVals.__springB);
  }
  if (Object.prototype.toString.call(destVals) === '[object Array]') {
    return destVals.map(val => updateV2(frameRate, getIn(currVals, val), getIn(currV, val), val, val.__springK ? val.__springK : k, val.__springB ? val.__springB : b));
  }
  if (Object.prototype.toString.call(destVals) === '[object Object]') {
    let newTree = {};
    Object.keys(destVals).forEach(key => {
      if(key === 'key') {
        newTree[key] = destVals[key];
        return;
      }
      newTree[key] = updateV2(frameRate, currVals[key], currV[key], destVals[key], k, b);
    });
    return newTree;
  }
  if(Object.prototype.toString.call(destVals) === '[object String]') {
    return destVals;
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

function mergeDiff2(collA, collB, onRemove, accum = []) {
  let [a, ...aa] = collA;
  let [b, ...bb] = collB;

  if (collA.length === 0 && collB.length === 0) {
    return accum;
  }
  if (collA.length === 0) {
    return accum.concat(collB);
  }

  if (collB.length === 0) {
    let newA = onRemove(a);
    if (!newA) {
      return mergeDiff2(aa, collB, onRemove, accum);
    }
    return mergeDiff2(aa, collB, onRemove, accum.concat(newA));
  }

  if (a.key === b.key) { // fails for ([undefined], [], () => true). but don't do that
    return mergeDiff2(aa, bb, onRemove, accum.concat(b));
  }
  if (!collB.some(v => a.key === v.key)) {
    let newA = onRemove(a);
    if (!newA) {
      return mergeDiff2(aa, collB, onRemove, accum);
    }
    return mergeDiff2(aa, collB, onRemove, accum.concat(newA));
  }
  return mergeDiff2(aa, collB, onRemove, accum);
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

function checkValuesFunc(f) {
  if (f.length === 0) {
    console.warn(
      `You're passing a function to Spring prop \`values\` which doesn't \
receive \`tween\` as the first argument. In this case, nothing will be \
animated. You might as well directly pass the value.`
    );
  }
}

export default React.createClass({
  propTypes: {
    values: PropTypes.oneOfType([
      PropTypes.func,
      PropTypes.object,
      PropTypes.number,
    ]).isRequired,
  },

  getInitialState: function() {
    let {values} = this.props;
    let vals;
    if (typeof values === 'function') {
      checkValuesFunc(values);
      vals = values(tween);
    } else {
      vals = values;
    }
    let defaultVals = stripMarks(vals);
    return {
      currVals: defaultVals,
      currV: mapTree(zero, defaultVals),
      now: null,
    };
  },

  raf: function() {
    requestAnimationFrame(() => {
      let {currVals, currV, now} = this.state;
      let {values} = this.props;

      // TODO: lol, refactor
      let annotatedVals;
      if (typeof values === 'function') {
        checkValuesFunc(values);
        annotatedVals = values(tween, currVals);
      } else {
        annotatedVals = tween(values);
      }
      let frameRate = now ? (Date.now() - now) / 1000 : FRAME_RATE;
      let newCurrVals = updateVals(frameRate, currVals, currV, annotatedVals);
      let newCurrV = updateV(frameRate, currVals, currV, annotatedVals);

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

  componentDidMount: function() {
    this.raf();
  },

  render: function() {
    let {currVals} = this.state;
    return <div {...this.props}>{this.props.children(currVals)}</div>;
  }
});

export let TransitionSpring = React.createClass({
  propTypes: {
    values: PropTypes.oneOfType([
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

  getDefaultProps: function() {
    return {
      willEnter: (key, currVals) => currVals[key],
      willLeave: () => null,
    };
  },

  getInitialState: function() {
    let {values} = this.props;
    let vals;
    if (typeof values === 'function') {
      checkValuesFunc(values);
      vals = values(tween);
    } else {
      vals = values;
    }
    let defaultVals = stripMarks(vals);

    return {
      currVals: defaultVals,
      currV: mapTree((path, tree) => {
        if(Object.prototype.toString.call(tree) === '[object String]') return tree;
        if(path[path.length - 1] === 'key') return tree;
        return 0;
      }, defaultVals),
      now: null,
    };
  },

  raf: function() {
    requestAnimationFrame(() => {
      let {currVals, currV, now} = this.state;
      let {
        values,
        willEnter,
        willLeave,
      } = this.props;

      // TODO: lol, refactor
      let annotatedVals;
      if (typeof values === 'function') {
        checkValuesFunc(values);
        annotatedVals = values(tween, currVals);
      } else {
        annotatedVals = tween(values);
      }

      let strippedVals = stripMarks(annotatedVals);
      let shallowStrippedVals = annotatedVals.__springK == null ?
        annotatedVals :
        annotatedVals.value;

      currVals = clone(currVals);
      currV = clone(currV);

      let shallowStrippedMergedVals = null;
      let newCurrVals = null;
      let newCurrV = null;
      if (Object.prototype.toString.call(shallowStrippedVals) === '[object Array]') {
        shallowStrippedMergedVals = mergeDiff2(
          currVals,
          shallowStrippedVals,
          val => willLeave(val, tween, strippedVals, currVals, currV),
        );

        shallowStrippedMergedVals
          .map(stripMarks)
          .filter(val => {
            return !currVals.some(innerVal => val.key === innerVal.key);
          })
          .forEach(val => {
            currVals.push(willEnter(val, strippedVals, currVals));
            currV.push(mapTree((path, tree) => {
              if (Object.prototype.toString.call(tree) === '[object String]') return tree;
              if (path[path.length - 1] === 'key') return tree;
              return 0;
            }, currVals[currVals.length - 1]));
          });
          let mergedVals = annotatedVals.__springK == null ?
              shallowStrippedMergedVals :
              tween(shallowStrippedMergedVals, annotatedVals.__springK, annotatedVals.__springB);

          let frameRate = now ? (Date.now() - now) / 1000 : FRAME_RATE;
          newCurrVals = updateVals2(frameRate, currVals, currV, mergedVals);
          newCurrV = updateV2(frameRate, currVals, currV, mergedVals);
      } else if (Object.prototype.toString.call(shallowStrippedVals) === '[object Object]') {
        shallowStrippedMergedVals = mergeDiffObj(
          currVals,
          shallowStrippedVals,
          val => willLeave(val, tween, strippedVals, currVals, currV),
        );

        Object.keys(shallowStrippedMergedVals)
          .filter(key => !currVals.hasOwnProperty(key))
          .forEach(key => {
            currVals[key] = willEnter(key, strippedVals, currVals);
            currV[key] = mapTree(zero, currVals[key]);
          });
          let mergedVals = annotatedVals.__springK == null ?
              shallowStrippedMergedVals :
              tween(shallowStrippedMergedVals, annotatedVals.__springK, annotatedVals.__springB);

          let frameRate = now ? (Date.now() - now) / 1000 : FRAME_RATE;
          newCurrVals = updateVals(frameRate, currVals, currV, mergedVals);
          newCurrV = updateV(frameRate, currVals, currV, mergedVals);
      }

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

  componentDidMount: function() {
    this.raf();
  },

  render: function() {
    let {currVals} = this.state;
    return <div {...this.props}>{this.props.children(currVals)}</div>;
  },
});
