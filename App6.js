let React = require('react');

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
      // console.log("6");
      return _epicMergeduce(aa, collB, isRemove, accum);
    }
    return _epicMergeduce(aa, collB, isRemove, accum.concat(a));
  }
  if (a === b) { // fails for ([undefined], [], () => true). but don't do that
    // console.log('2', a, b, accum.length);
    return _epicMergeduce(aa, bb, isRemove, accum.concat(a));
  }
  if (collB.indexOf(a) === -1) {
    if (isRemove(a)) {
    // console.log('3', aa, collB, collA.length);
      return _epicMergeduce(aa, collB, isRemove, accum);
    }
    // console.log('4');
    return _epicMergeduce(aa, collB, isRemove, accum.concat(a));
  }
  // console.log('5');
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

let assert = require('assert');

assert.deepEqual(epicMergeduce([3], [], () => false), [3]);
assert.deepEqual(epicMergeduce([3], [], () => true), []);
assert.deepEqual(epicMergeduce([1, 3], [1, 2], () => true), [1, 2]);
assert.deepEqual(epicMergeduce([1, 3], [1, 2], () => false), [1, 3, 2]);
assert.deepEqual(epicMergeduce([1, 2, 3], [2], (val) => val === 1), [2, 3]);
assert.deepEqual(epicMergeduce([1, 2, 3], [2], (val) => val === 3), [1, 2]);

function clone(a) {
  return JSON.parse(JSON.stringify(a));
}

function clamp(val, min, max) {
  return val < min ? min :
    val > max ? max :
    val;
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
      let {items: oldItems, anims: oldAnims} = this.state;

      requestAnimationFrame(() => {
        let {items, anims, currItems} = this.state;

        anims = clone(anims);

        // remove dead anims
        Object.keys(anims).forEach(key => {
          if (anims[key] <= 0) {
            delete anims[key];
          }
        });
        let newCurrItems = epicMergeduce(currItems, items, key => anims[key] == null);
        // add new anims
        items.forEach(key => {
          if (anims[key] == null) {
            anims[key] = 0;
          }
        });
        // progress animation
        Object.keys(anims).forEach(key => {
          if (items.indexOf(key) === -1) {
            anims[key] = clamp(anims[key] - 0.02, 0, 1);
          } else {
            anims[key] = clamp(anims[key] + 0.02, 0, 1);
          }
        });

        this.setState({
          currItems: newCurrItems,
          anims: anims,
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
