let React = require('react');
let computeLayout = require('css-layout');
let stepper = require('./stepper');

let fuck = 0;

function _epicMergeduce(collA, collB, isRemove, accum) {
  // if (fuck++ > 999) {
  //   throw 'fuck1'
  // }
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


let layout1 = computeLayout({
  style: {width: 300, height: 500, padding: 20, flexDirection: 'column'},
  children: [
    {
      style: {flex: 1},
    },
    {
      style: {flex: 1},
    },
    {
      style: {flex: 1},
    },
  ],
});

let layout2 = computeLayout({
  style: {width: 300, height: 500, padding: 20, flexDirection: 'column'},
  children: [
    {
      style: {flex: 1},
    },
    {
      style: {flex: 1},
    },
  ],
});

let layouts = [layout1, layout2];

function clone(a) {
  return JSON.parse(JSON.stringify(a));
}

function deepEqual(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}

let App = React.createClass({
  getInitialState: function() {
    let items = [1, 2, 3];
    let anims = {
      1: 1,
      2: 1,
      3: 1,
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
          items: [1, 2, 3],
        });
      } else if (e.which === 75) {
        this.setState({
          items: [2],
        });
      } else if (e.which === 76) {
        this.setState({
          items: [1, 2, 4],
        });
      }
    });

    let loop = () => {
      let {items: oldItems, anims: oldAnims} = this.state;

      requestAnimationFrame(() => {
        let {items, anims, currItems} = this.state;
        anims = clone(anims);
        // if (!deepEqual(items, currItems)) {
          let shouldDelete = currItems.map(() => false);
          let beingDeleted = currItems.filter(key => items.indexOf(key) === -1);
          beingDeleted.forEach(key => {
            if(anims[key] > 0.01) anims[key] -= 0.01;
            else delete anims[key]
            shouldDelete[key] = anims[key] <= 0.01;
          });

          items.forEach(key => {
            if(!anims.hasOwnProperty(key)) anims[key] = 0;
            if(anims[key] < 1) anims[key] += 0.01;
          });

          let newCurrItems = epicMergeduce(currItems, items, (key) => shouldDelete[key]);
          let newAnims = epicMergeduceObj(oldAnims, anims, (key) => shouldDelete[key]);
          this.setState({
            currItems: newCurrItems,
            anims: newAnims,
          })
        // }

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
            <div style={{...s, top: i * 100, opacity: anims[num]}}>
              {num}
            </div>
          );
        })}
      </div>
    );
  }
});

module.exports = App
