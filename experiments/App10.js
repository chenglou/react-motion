// layout + spring + diffing, modularized
'use strict';

let React = require('react');
let computeLayout = require('css-layout');
let stepper = require('./stepper');

// TODO: isRemove used by epicMergeduce2, not bool, verify null
function _epicMergeduce(collA, collB, isRemove, accum) {
  let [a, ...aa] = collA;
  let [b, ...bb] = collB;

  if (collA.length === 0 && collB.length === 0) {
    return accum;
  }
  if (collA.length === 0) {
    return accum.concat(collB);
  }
  if (collB.length === 0) {
    if (isRemove(a)) {
      return _epicMergeduce(aa, collB, isRemove, accum);
    }
    return _epicMergeduce(aa, collB, isRemove, accum.concat(a));
  }
  if (a === b) { // fails for ([undefined], [], () => true). but don't do that
    return _epicMergeduce(aa, bb, isRemove, accum.concat(a));
  }
  if (collB.indexOf(a) === -1) {
    if (isRemove(a)) {
      return _epicMergeduce(aa, collB, isRemove, accum);
    }
    return _epicMergeduce(aa, collB, isRemove, accum.concat(a));
  }
  return _epicMergeduce(aa, collB, isRemove, accum);
}

function epicMergeduce(a, b, isRemove) {
  return _epicMergeduce(a, b, isRemove, []);
}
// ----------
function epicMergeduce2(a, b, isRemove) {
  let keys = _epicMergeduce(Object.keys(a), Object.keys(b), a => !isRemove(a), []);
  let ret = {};
  keys.forEach(key => {
    if (b.hasOwnProperty(key)) {
      ret[key] = b[key];
    } else {
      ret[key] = isRemove(key);
    }
  });

  return ret;
}

function clone(a) {
  return JSON.parse(JSON.stringify(a));
}

function eq(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}

function _map3TreeKeyVal(path, t1, t2, t3, f) {
  if (Object.prototype.toString.call(t1) === '[object Array]') {
    return t1.map((val, i) => _map3TreeKeyVal([...path, i], val, t2[i], t3[i], f));
  }
  if (Object.prototype.toString.call(t1) === '[object Object]') {
    let newTree = {};
    Object.keys(t1).forEach(key => {
      newTree[key] = _map3TreeKeyVal([...path, key], t1[key], t2[key], t3[key], f);
    });
    return newTree;
  }
  return f(path, t1, t2, t3);
}

function map3TreeKeyVal(t1, t2, t3, f) {
  return _map3TreeKeyVal([], t1, t2, t3, f);
}

// caution with null. Don't have a tree with existing field pointing to null for
// now
function _meltGoldIntoMold(path, a, b, f) {
  if (a == null) {
    throw 'wtf2';
  }

  if (b == null) {
    return f(path, a);
  }

  if (Object.prototype.toString.call(a) === '[object Array]') {
    return a.map((val, i) => _meltGoldIntoMold([...path, i], val, b[i], f));
  }
  if (Object.prototype.toString.call(a) === '[object Object]') {
    let newTree = {};
    Object.keys(a).forEach(key => {
      newTree[key] = _meltGoldIntoMold([...path, key], a[key], b[key], f);
    });
    return newTree;
  }

  return b;
}

function meltGoldIntoMold(a, b, f) {
  return _meltGoldIntoMold([], a, b, f);
}

let Springs = React.createClass({
  getInitialState: function() {
    let {defaultVals} = this.props;
    return {
      currVals: defaultVals,
      currV: map3TreeKeyVal(defaultVals, defaultVals, defaultVals, () => 0),
    };
  },

  raf: function() {
    requestAnimationFrame(() => {
      let {currVals, currV} = this.state;
      let {nextDestVals, defaultNewTreeVal} = this.props;

      let destVals = nextDestVals(currVals, currV);
      let patchedCurrV = meltGoldIntoMold(
        destVals,
        currV,
        // TODO: expose
        (_, val) => map3TreeKeyVal(val, val, val, () => 0),
      );
      let patchedCurrVals = meltGoldIntoMold(
        destVals,
        currVals,
        // TODO: le expose
        defaultNewTreeVal || ((_, val) => map3TreeKeyVal(val, val, val, () => 0)),
      );

      let newCurrVals = map3TreeKeyVal(
        patchedCurrVals,
        patchedCurrV,
        destVals,
        // TODO: expose spring params
        (_, x, vx, destX) => stepper(x, vx, destX, 120, 16)[0]
      );
      let newCurrV = map3TreeKeyVal(
        patchedCurrVals,
        patchedCurrV,
        destVals,
        // TODO: expose spring params
        (_, x, vx, destX) => stepper(x, vx, destX, 120, 16)[1]
      );

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

function compDestAnim(currKeys, keys) {
  let destAnims = computeLayout({
    style: {width: 300, padding: 20, flexDirection: 'column'},
    children: currKeys.map(key => {
      if (keys.indexOf(key) === -1) {
        // doesnt exist anymore, i.e. unmounting
        return {
          style: {height: 0, left: 300}
        };
      }
      return {style: {height: 20 * (keys.indexOf(key) + 1)}};
    })
  });

  let childrenAnims = {};
  destAnims.children.forEach((config, i) => {
    let key = currKeys[i];
    childrenAnims[key] = {
      ...config,
      opacity: keys.indexOf(key) === -1 ? 0 : 1,
    };
  });
  destAnims = {...destAnims, children: childrenAnims};

  return destAnims;
}

let computeLayoutObjChildren = layout => {
  // TODO: recurse
  let keys = Object.keys(layout.children);
  let childrenArr = keys.map(key => layout.children[key]);
  let a = {
    style: {...layout.style},
    children: childrenArr,
  };
  let intermediate = computeLayout(a);
  let resultChildrenObj = {};
  intermediate.children.forEach((child, i) => {
    resultChildrenObj[keys[i]] = child;
  });
  return {
    ...intermediate,
    children: {...resultChildrenObj},
  };
};

let App = React.createClass({
  getInitialState: function() {
    return {
      keys: ['1', '2', '3'],
    };
  },

  componentDidMount: function() {
    window.addEventListener('keydown', e => {
      // j = 74, k = 75
      if (e.which === 74) {
        this.setState({
          keys: ['1', '2', '3'],
        });
      } else if (e.which === 75) {
        this.setState({
          keys: ['2'],
        });
      } else if (e.which === 76) {
        this.setState({
          keys: ['1', '2', '4'],
        });
      }
    });
  },

  render: function() {
    let {keys} = this.state;
    let s = {
      outline: '1px solid black',
      position: 'absolute',
    };

    return (
      <Springs
        defaultVals={compDestAnim(keys, keys)}
        nextDestVals={(currVals, currV) => {
          let destValsChildren = {};
          keys.forEach((key, i) => {
            destValsChildren[key] = {
              style: {height: 20 * (i + 1)}
            };
          });
          let destValsChildrenObj = epicMergeduce2(
            currVals.children,
            destValsChildren,
            key => {
              if (currVals.children[key].opacity === 0 && currV.children[key].opacity === 0) {
                return null;
              }
              return {style: {height: 0, left: 300}};
            }
          );

          let destVals = computeLayoutObjChildren({
            style: {width: 300, padding: 20, flexDirection: 'column'},
            children: destValsChildrenObj,
          });

          Object.keys(destVals.children).forEach(key => {
            if (keys.indexOf(key) >= 0) {
              destVals.children[key].opacity = 1;
            } else {
              destVals.children[key].opacity = 0;
            }
          });

          return destVals;
        }}
        defaultNewTreeVal={(_, val) => {
          return {...val, left: -300, height: 0};
        }}>
        {
          ({children, ...container}) =>
            <div style={{...container, outline: '1px solid black'}}>
              {Object.keys(children).map(key =>
                <div key={key} style={{...children[key], ...s}}>{key}</div>
              )}
            </div>
        }
      </Springs>
    );
  }
});

module.exports = App;
