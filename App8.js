// layout + spring + diffing, modularized
'use strict';

let React = require('react');
let computeLayout = require('css-layout');
let stepper = require('./stepper');

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

function clone(a) {
  return JSON.parse(JSON.stringify(a));
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
    let {initVals, items} = this.props;
    return {
      currVals: initVals,
      prevCurrVals: initVals,
      currV: map3TreeKeyVal(initVals, initVals, initVals, () => 0),
      prevCurrV: map3TreeKeyVal(initVals, initVals, initVals, () => 0),
      currItems: items,
      prevCurrItems: items,

      prevItems: items,
    };
  },

  raf: function() {
    requestAnimationFrame(() => {
      let {currVals, currV, prevCurrVals, prevCurrV, currItems, prevCurrItems, prevItems} = this.state;
      let {newDestAnimsF, initVals, defaultNewTreeVal, items, mergeducer} = this.props;

      currVals = clone(currVals);
      currV = clone(currV);

      let newCurrItems = epicMergeduce(currItems, items, key => mergeducer(key, prevCurrVals, currVals, prevCurrItems, prevItems, currV));

      let newFinalVals = newDestAnimsF(newCurrItems);

      // patch trees to mold shape
      let newFinalValsShaped = meltGoldIntoMold(newFinalVals, currVals, defaultNewTreeVal || ((_, val) => val));
      let newVShaped = meltGoldIntoMold(newFinalVals, currV, (path, val) => {
        return map3TreeKeyVal(val, val, val, () => 0);
      });

      let newCurrVals = map3TreeKeyVal(newFinalValsShaped, newVShaped, newFinalVals, (_, x, vx, destX) => {
        return stepper(x, vx, destX, 120, 16)[0];
      });
      let newCurrV = map3TreeKeyVal(newFinalValsShaped, newVShaped, newFinalVals, (_, x, vx, destX) => {
        return stepper(x, vx, destX, 120, 16)[1];
      });

      this.setState(() => {
        return {
          currVals: newCurrVals,
          prevCurrVals: currVals,
          currV: newCurrV,
          prevCurrV: currV,
          currItems: newCurrItems,
          prevCurrItems: currItems,
          prevItems: items,
        };
      });

      this.raf();
    });
  },

  componentDidMount: function() {
    this.raf();
  },

  render: function() {
    let {currItems, currVals} = this.state;
    return (
      <div>
        {this.props.children(currItems, currVals)}
      </div>
    );
  }
});

let layoutSkeleton = {
  style: {width: 300, padding: 20, flexDirection: 'column'},
};

function compDestAnim(currItems, items, layoutSkeleton) {
  let destAnims = computeLayout({
    ...layoutSkeleton,
    children: currItems.map(key => {
      if (items.indexOf(key) === -1) {
        // doesnt exist anymore, i.e. unmounting
        return {
          style: {height: 0, left: 300}
        };
      }
      return {style: {height: 20 * (items.indexOf(key) + 1)}};
    })
  });

  let childrenAnims = {};
  destAnims.children.forEach((config, i) => {
    let key = currItems[i];
    childrenAnims[key] = {
      ...config,
      opacity: items.indexOf(key) === -1 ? 0 : 1,
    };
  });
  destAnims = {...destAnims, children: childrenAnims};

  return destAnims;
}

let App = React.createClass({
  getInitialState: function() {
    let items = ['1', '2', '3'];
    let anims = compDestAnim(items, items, layoutSkeleton);

    return {
      items: items,
      anims: anims,
      v: map3TreeKeyVal(anims, anims, anims, () => 0),
      currItems: items,
      prevItems: items,
    };
  },

  componentDidMount: function() {
    window.addEventListener('keydown', e => {
      // j = 74, k = 75
      if (e.which === 74) {
        this.setState({
          items: ['1', '2', '3'],
        });
      } else if (e.which === 75) {
        this.setState({
          items: ['2'],
        });
      } else if (e.which === 76) {
        this.setState({
          items: ['1', '2', '4'],
        });
      }
    });
  },

  render: function() {
    let {currItems, items, anims, v, prevItems} = this.state;
    let {children, ...container} = anims;
    let s = {
      outline: '1px solid black',
      position: 'absolute',
    };

    let defaultNewTreeVal = (path, val) => {
      if (path.length === 3 && path[1] === 'children') {
        return map3TreeKeyVal(val, val, val, (path, val) => {
          if (path[path.length - 1] === 'left') {
            return -300;
          }

          if (path[path.length - 1] === 'height') {
            return 0;
          }

          return val;
        });
      }
      throw 'wtf3';
    };

    let mergeducer = (key, [prevCurrVals], [currVals], prevCurrItems, prevItems, [currV]) => {
      clone(currVals);
      clone(currV);
      let oldDestAnims = compDestAnim(prevCurrItems, items);
      Object.keys(currVals.children).forEach(key => {
        if (prevItems.indexOf(key) >= 0) {
          return;
        }

        let removeNow =
          currVals.children[key].opacity === oldDestAnims.children[key].opacity
          && currV.children[key].opacity === 0;

        if (removeNow) {
          delete currVals.children[key];
          delete currV.children[key];
        }
      });

      return currVals.children[key] == null;
    };

    return (
      <Springs
        items={items}
        mergeducer={mergeducer}
        newDestAnimsF={currItemsFromAboveMergeducer => [compDestAnim(currItemsFromAboveMergeducer, items, layoutSkeleton)]}
        initVals={[compDestAnim(items, items, layoutSkeleton)]}
        defaultNewTreeVal={defaultNewTreeVal}>
        {
          (currItems, [{children, ...container}]) =>
            <div style={{...container, outline: '1px solid black', position: 'relative'}}>
              {currItems.map(key =>
                <div key={key} style={{...children[key], ...s}}>{key}</div>
              )}
            </div>
        }
      </Springs>
    );
  }
});

module.exports = App;
