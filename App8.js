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

function partial(fn) {
  var args = Array.prototype.slice.call(arguments, 1);
  return function() {
    return fn.apply(this, args.concat(
      Array.prototype.slice.call(arguments)));
  };
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

var EpicMerger = React.createClass({
  getInitialState: function() {
    let {items} = this.props;
    return {
      currItems: items,
      prevCurrItems: items
    };
  },
  render: function() {
    let {items, isRemove} = this.props;
    let {currItems, prevCurrItems} = this.state;

    return this.props.children(currItems, (isRemove) => {
            let newCurrItems = epicMergeduce(currItems, items, isRemove);
            this.setState({
              currItems: newCurrItems,
              prevCurrItems: currItems
            });
            return newCurrItems;
          }, partial(isRemove, prevCurrItems, items));
  }
});

let Springs = React.createClass({
  getInitialState: function() {
    let {initVals, updateItems} = this.props;
    let currVals = initVals;
    let currV = map3TreeKeyVal(initVals, initVals, initVals, () => 0);

    return {
      currVals: currVals,
      currV: currV,
    };
  },

  raf: function() {
    requestAnimationFrame(() => {
      let {currVals, currV} = this.state;
      let {destValsF, defaultNewTreeVal, getDestVals, isRemove} = this.props;

      let destVals = destValsF(getDestVals(partial(isRemove, currVals, currV)));
      currVals = clone(currVals);
      currV = clone(currV);

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
        };
      });

      this.raf();

      // let {currVals, currV, currItems, prevCurrItems} = this.state;
      // let {destValsF, initVals, defaultNewTreeVal, epicMergeduce2} = this.props;

      // currVals = clone(currVals);
      // currV = clone(currV);

      // let newCurrItems = epicMergeduce2(currItems, currVals, prevCurrItems, currV);
      // let destVals = destValsF(newCurrItems);

      // // patch trees to mold shape
      // let newFinalValsShaped = meltGoldIntoMold(destVals, currVals, defaultNewTreeVal || ((_, val) => val));
      // let newVShaped = meltGoldIntoMold(destVals, currV, (path, val) => {
      //   return map3TreeKeyVal(val, val, val, () => 0);
      // });

      // let newCurrVals = map3TreeKeyVal(newFinalValsShaped, newVShaped, destVals, (_, x, vx, destX) => {
      //   return stepper(x, vx, destX, 120, 16)[0];
      // });
      // let newCurrV = map3TreeKeyVal(newFinalValsShaped, newVShaped, destVals, (_, x, vx, destX) => {
      //   return stepper(x, vx, destX, 120, 16)[1];
      // });

      // this.setState(() => {
      //   return {
      //     currVals: newCurrVals,
      //     currV: newCurrV,
      //     currItems: newCurrItems,
      //     prevCurrItems: currItems,
      //   };
      // });

      // this.raf();
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

function defaultNewTreeVal(path, val) {
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
}


let App = React.createClass({
  getInitialState: function() {
    return {
      items: ['1', '2', '3'],
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
    let {items} = this.state;
    let s = {
      outline: '1px solid black',
      position: 'absolute',
    };

    let isRemove = (prevCurrItems, items, [currVals], [currV], key) => {
      let prevDestVals = compDestAnim(prevCurrItems, items, layoutSkeleton);
      return currVals.children[key].opacity === prevDestVals.children[key].opacity
        && currV.children[key].opacity <= 0.1;
    };

    return (
      <EpicMerger items={items} isRemove={isRemove}>
        {(currItems, getDestVals, isRemove) =>
          <Springs
            isRemove={isRemove}
            getDestVals={getDestVals}
            destValsF={currItemsFromAboveMergeducer => [compDestAnim(currItemsFromAboveMergeducer, items, layoutSkeleton)]}
            initVals={[compDestAnim(items, items, layoutSkeleton)]}
            defaultNewTreeVal={defaultNewTreeVal}>
            {
              ([{children, ...container}]) =>
                <div style={{...container, outline: '1px solid black'}}>
                  {currItems.map(key =>
                    <div key={key} style={{...children[key], ...s}}>{key}</div>
                  )}
                </div>
            }
          </Springs>
        }
      </EpicMerger>
    );
  }
});

module.exports = App;
