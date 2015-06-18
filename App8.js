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
    let {initVals} = this.props;
    return {
      currVals: initVals,
      currV: map3TreeKeyVal(initVals, initVals, initVals, () => 0),
    };
  },

  raf: function() {
    requestAnimationFrame(() => {
      let {currVals, currV} = this.state;
      let {reduce, initVals, defaultNewTreeVal} = this.props;

      currVals = clone(currVals);
      currV = clone(currV);

      let newFinalVals = currVals.reduce((finalVals, val, i) => {
        return reduce(currVals, finalVals, i);
      }, []);

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
    return (
      <div>
        {this.props.children(this.state.currVals)}
      </div>
    );
  }
});

let layoutSkeleton = {
  style: {width: 300, padding: 20, flexDirection: 'column'},
};

let App = React.createClass({
  getInitialState: function() {
    let items = ['1', '2', '3'];

    let layout = computeLayout({
      ...layoutSkeleton,
      children: items.map((_, i) => {
        return {
          style: {height: 20 * (i + 1)}
        };
      })
    });

    let childrenAnims = {};
    layout.children.forEach((config, i) => {
      childrenAnims[items[i]] = {
        ...config,
        opacity: 1,
      };
    });
    let anims = {...layout, children: childrenAnims};

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

    let loop = () => {
      requestAnimationFrame(() => {
        let {items, anims, v, currItems, prevItems} = this.state;
        anims = clone(anims);
        v = clone(v);

        // remove dead anims
        let oldDestAnims = computeLayout({
          ...layoutSkeleton,
          children: currItems.map(key => {
            if (prevItems.indexOf(key) === -1) {
              // doesnt exist anymore, i.e. unmounting
              return {
                style: {height: 0, left: 300}
              };
            }
            return {style: {height: 20 * (prevItems.indexOf(key) + 1)}};
          })
        });

        let mary = {};
        oldDestAnims.children.forEach((config, i) => {
          let key = currItems[i];
          mary[key] = {
            ...config,
            opacity: prevItems.indexOf(key) === -1 ? 0 : 1,
          };
        });
        oldDestAnims = {...oldDestAnims, children: mary};

        Object.keys(anims.children).forEach(key => {
          if (prevItems.indexOf(key) >= 0) {
            return;
          }

          // usually we'd wait for every animation to finish, but since it might
          // never finish (e.g. top value still changing bc other items are
          // constantly moving around), we should call it done when a certain
          // property of the node that's not influenced by the siblings is done.
          // In this case, opacity will do

          // let removeNow = Object.keys(anims.children[key]).every(prop => {
          //   return anims.children[key][prop] === oldDestAnims.children[key][prop] && v.children[key][prop] === 0;
          // });

          let removeNow =
            anims.children[key].opacity === oldDestAnims.children[key].opacity
            && v.children[key].opacity === 0;

          if (removeNow) {
            delete anims.children[key];
            delete v.children[key];
          }
        });

        let newCurrItems = epicMergeduce(currItems, items, key => anims.children[key] == null);

        // add new anims
        let destAnims = computeLayout({
          ...layoutSkeleton,
          children: newCurrItems.map(key => {
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
          let key = newCurrItems[i];
          childrenAnims[key] = {
            ...config,
            opacity: items.indexOf(key) === -1 ? 0 : 1,
          };
        });
        destAnims = {...destAnims, children: childrenAnims};

        // patch trees to mold shape
        let newAnimsShaped = meltGoldIntoMold(destAnims, anims, (path, val) => {
          if (path.length === 2 && path[0] === 'children') {
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
        });
        let newVShaped = meltGoldIntoMold(destAnims, v, (path, val) => {
          return map3TreeKeyVal(val, val, val, () => 0);
        });

        let newAnims = map3TreeKeyVal(newAnimsShaped, newVShaped, destAnims, (_, x, vx, destX) => {
          return stepper(x, vx, destX, 120, 16)[0];
        });
        let newV = map3TreeKeyVal(newAnimsShaped, newVShaped, destAnims, (_, x, vx, destX) => {
          return stepper(x, vx, destX, 120, 16)[1];
        });

        this.setState({
          currItems: newCurrItems,
          anims: newAnims,
          v: newV,
          prevItems: items,
        });

        loop();
      });
    };

    loop();
  },

  render: function() {
    let {currItems, items, anims, v, prevItems} = this.state;
    let {children, ...container} = anims;
    let s = {
      outline: '1px solid black',
      position: 'absolute',
    };





    anims = clone(anims);
    v = clone(v);

    // remove dead anims
    let oldDestAnims = computeLayout({
      ...layoutSkeleton,
      children: currItems.map(key => {
        if (prevItems.indexOf(key) === -1) {
          // doesnt exist anymore, i.e. unmounting
          return {
            style: {height: 0, left: 300}
          };
        }
        return {style: {height: 20 * (prevItems.indexOf(key) + 1)}};
      })
    });

    let mary = {};
    oldDestAnims.children.forEach((config, i) => {
      let key = currItems[i];
      mary[key] = {
        ...config,
        opacity: prevItems.indexOf(key) === -1 ? 0 : 1,
      };
    });
    oldDestAnims = {...oldDestAnims, children: mary};

    Object.keys(anims.children).forEach(key => {
      if (prevItems.indexOf(key) >= 0) {
        return;
      }

      let removeNow =
        anims.children[key].opacity === oldDestAnims.children[key].opacity
        && v.children[key].opacity === 0;

      if (removeNow) {
        delete anims.children[key];
        delete v.children[key];
      }
    });

    let newCurrItems = epicMergeduce(currItems, items, key => anims.children[key] == null);

    // add new anims
    let destAnims = computeLayout({
      ...layoutSkeleton,
      children: newCurrItems.map(key => {
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
      let key = newCurrItems[i];
      childrenAnims[key] = {
        ...config,
        opacity: items.indexOf(key) === -1 ? 0 : 1,
      };
    });
    destAnims = {...destAnims, children: childrenAnims};

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

    return (
      <Springs initVals={[destAnims]} reduce={() => [destAnims]} gold={defaultNewTreeVal}>
        {([{children, ...container}]) => {
          return (
            <div style={{...container, outline: '1px solid black', position: 'relative'}}>
              {currItems.map(key => {
                return (
                  <div key={key} style={{...children[key], ...s}}>
                    {key}
                  </div>
                );
              })}
            </div>
          );
        }}
      </Springs>
    );
  }
});

module.exports = App;
