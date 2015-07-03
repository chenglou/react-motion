// layout + spring + diffing, modularized
'use strict';

let React = require('react');
let computeLayout = require('css-layout');
let stepper = require('../stepper');

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
  getInitialState() {
    let {initVals, items} = this.props;
    return {
      currVals: initVals,
      currV: map3TreeKeyVal(initVals, initVals, initVals, () => 0),
      currItems: items,
      prevCurrItems: items,
    };
  },

  raf() {
    requestAnimationFrame(() => {
      let {currVals, currV, currItems, prevCurrItems} = this.state;
      let {destValsF, initVals, defaultNewTreeVal, items, mergeducer} = this.props;

      let newCurrItems = epicMergeduce(currItems, items, key => mergeducer(key, currVals, prevCurrItems, currV));

      let destVals = destValsF(newCurrItems);

      // patch trees to mold shape
      let newFinalValsShaped = meltGoldIntoMold(destVals, currVals, defaultNewTreeVal || ((_, val) => val));
      let newVShaped = meltGoldIntoMold(destVals, currV, (path, val) => {
        return map3TreeKeyVal(val, val, val, () => 0);
      });

      let newCurrVals = map3TreeKeyVal(newFinalValsShaped, newVShaped, destVals, (_, x, vx, destX) => {
        return stepper(x, vx, destX, 120, 16)[0];
      });
      let newCurrV = map3TreeKeyVal(newFinalValsShaped, newVShaped, destVals, (_, x, vx, destX) => {
        return stepper(x, vx, destX, 120, 16)[1];
      });

      this.setState(() => {
        return {
          currVals: newCurrVals,
          currV: newCurrV,
          currItems: newCurrItems,
          prevCurrItems: currItems,
        };
      });

      this.raf();
    });
  },

  componentDidMount() {
    this.raf();
  },

  render() {
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

let App = React.createClass({
  getInitialState() {
    return {
      items: ['1', '2', '3'],
    };
  },

  componentDidMount() {
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

  render() {
    let {items} = this.state;
    let s = {
      outline: '1px solid black',
      position: 'absolute',
    };

    let compDestAnim = (currItems, items, layoutSkeleton) => {
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
    };

    return (
      <Springs
        items={items}
        mergeducer={(key, [currVals], prevCurrItems, [currV]) => {
          let prevDestVals = compDestAnim(prevCurrItems, items);
          return currVals.children[key].opacity === prevDestVals.children[key].opacity
            && currV.children[key].opacity === 0;
        }}
        destValsF={currItemsFromAboveMergeducer => [compDestAnim(currItemsFromAboveMergeducer, items, layoutSkeleton)]}
        initVals={[compDestAnim(items, items, layoutSkeleton)]}
        defaultNewTreeVal={(path, val) => {
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
        }}>
        {
          (currItems, [{children, ...container}]) =>
            <div style={{...container, outline: '1px solid black'}}>
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
