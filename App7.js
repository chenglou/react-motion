let React = require('react');
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

function epicMergeduceObj(collA, collB, isRemove) {
  let ret = {...collA, ...collB};
  for (var key in collA) {
    if (!collB.hasOwnProperty(key) && isRemove(key)) {
      delete ret[key];
    }
  }

  return ret;
}

function clone(a) {
  return JSON.parse(JSON.stringify(a));
}

function clamp(val, min, max) {
  return val < min ? min :
    val > max ? max :
    val;
}

function _map3TreeKeyVal(key, t1, t2, t3, f) {
  if (Object.prototype.toString.call(t1) === '[object Array]') {
    return t1.map((val, i) => _map3TreeKeyVal(i, val, t2[i], t3[i], f));
  }
  if (Object.prototype.toString.call(t1) === '[object Object]') {
    let newTree = {};
    Object.keys(t1).forEach(key => newTree[key] = _map3TreeKeyVal(key, t1[key], t2[key], t3[key], f));
    return newTree;
  }
  return f(key, t1, t2, t3);
}

function map3TreeKeyVal(t1, t2, t3, f) {
  return _map3TreeKeyVal(null, t1, t2, t3, f);
}

let App = React.createClass({
  getInitialState: function() {
    let items = ['1', '2', '3'];
    let anims = {
      1: 0,
      2: 0,
      3: 0,
    };
    return {
      items,
      anims,
      v: map3TreeKeyVal(anims, anims, anims, () => 0),
      currItems: items
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
        let {items, anims, v, currItems} = this.state;

        anims = clone(anims);

        // remove dead anims
        Object.keys(anims).forEach(key => {
          if (items[key] == null && anims[key] === 0 && v[key] === 0) {
            delete anims[key];
            delete v[key];
          }
        });
        let newCurrItems = epicMergeduce(currItems, items, key => anims[key] == null);
        // add new anims
        items.forEach(key => {
          if (anims[key] == null) {
            anims[key] = 0;
            v[key] = 0;
          }
        });
        // progress animation
        let destAnims = map3TreeKeyVal(anims, anims, anims, key => {
          return items.indexOf(key) === -1 ? 0 : 1;
        });
        let newAnims = map3TreeKeyVal(anims, v, destAnims, (_, x, vx, destX) => {
          return stepper(x, vx, destX, 120, 16)[0];
        })
        let newV = map3TreeKeyVal(anims, v, destAnims, (_, x, vx, destX) => {
          return stepper(x, vx, destX, 120, 16)[1];
        })

        this.setState({
          currItems: newCurrItems,
          anims: newAnims,
          v: newV,
        })

        loop();
      });
    };

    loop();
  },

  render: function() {
    let {currItems, anims} = this.state;
    let s = {
      outline: '1px solid black',
      position: 'absolute',
      height: 100,
      width: 100,
    };

    return (
      <div style={{width: 100, height: 400, outline: '1px solid black', position: 'relative'}}>
        {currItems.map((num, i) => {
          return (
            <div key={num} style={{...s, top: i * 100, opacity: anims[num]}}>
              {num}
            </div>
          );
        })}
      </div>
    );
  }
});

module.exports = App
