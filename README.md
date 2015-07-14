# React-Motion

[![npm version](https://badge.fury.io/js/react-motion.svg)](https://www.npmjs.com/package/react-motion)
[![Bower version](https://badge.fury.io/bo/react-motion.svg)](http://badge.fury.io/bo/react-motion)
[![react-motion channel on slack](https://img.shields.io/badge/slack-react--motion%40reactiflux-61DAAA.svg?style=flat)](https://reactiflux.slack.com/messages/react-motion/)

```js
<Spring endValue={{val: 10}}>
  {interpolated => <div>{interpolated.val}</div>}
</Spring>
```

Animate a counter to `10`, from whatever value it currently is. For more advanced usage, see below.

Npm:
`npm install react-motion`

Bower:
`bower install react-motion`

1998 Script Tag:
`<script src="path/to/react-motion/build/react-motion.js"></script>`
(Module exposed as `ReactMotion`)

[Check](https://cdn.rawgit.com/chenglou/react-motion/cffb3894f42e4825178d9c7c0313b2f4e9e65ab2/demo0/index.html) [Out](https://cdn.rawgit.com/chenglou/react-motion/cffb3894f42e4825178d9c7c0313b2f4e9e65ab2/demo1/index.html) [The](https://cdn.rawgit.com/chenglou/react-motion/cffb3894f42e4825178d9c7c0313b2f4e9e65ab2/demo2/index.html) [Cool](https://cdn.rawgit.com/chenglou/react-motion/cffb3894f42e4825178d9c7c0313b2f4e9e65ab2/demo3/index.html) [Demos](https://cdn.rawgit.com/chenglou/react-motion/072fef7b84b2d57187643baa4156ee2a7374655f/demo4/index.html).

## What does this library try to solve?

[My React-Europe talk](https://www.youtube.com/watch?v=1tavDv5hXpo)

For 95% of use-cases of animating components, we don't have to resort to using hard-coded easing curves and duration. Set up a stiffness and damping constant for your UI element, and let the magic of physics take care of the rest. This way, you don't have to worry about the more petty questions such as "what if the item's currently animating and is a position `x`? How do I adjust my time and curve?". It also greatly simplifies an animation API since there's really not that much to set up.

This library also provides an alternative, more powerful API for React's `TransitionGroup`.

## API

### Sample Usage

```js
let Demo = React.createClass({
  getInitialState() {
    return {open: false};
  },

  handleMouseDown() {
    this.setState({open: !this.state.open});
  },

  render() {
    return (
      <div>
        <button onMouseDown={this.handleMouseDown}>Toggle</button>
        <Spring endValue={{val: this.state.open ? 400 : 0}}>
          {interpolated =>
            <div className="demo0-block" style={{
              transform: `translate3d(${interpolated.val}px, 0, 0)`,
            }} />
          }
        </Spring>
      </div>
    );
  }
});
```

The library exports a default `Spring`, a `TransitionSpring` and `utils`.

### &lt;Spring />
Exposes a single prop, `endValue`, which takes either an object, an array or a function that returns an object or an array.
Type: `endValue: object | array | object -> (object | array)`.

`endValue` can be of an arbitrary shape (**but must stay the same shape from one render to the next**). There are however 2 reserved keys: `val` and `config`. Say your initial data structure looks so:

```js
{size: 10, top: 20}
```

You only want to animate `size`. Indicate what value/entire sub-collection you want to animate by wrapping it:

```js
{size: {val: 10}, top: 20}
```

When you pass this to `endValue`, `Spring` will traverse your data structure and animate `size` based on the end value you provided and the speed/position. `top` will be kept untouched. You receive the interpolated data structure as an argument to your children function:

```jsx
<Spring endValue={{size: {val: 10}, top: 20}}>
  {tweeningCollection => {
    let style = {
      width: tweeningCollection.size.val,
      height: tweeningCollection.size.val,
      top: tweeningCollection.top,
    };
    return <div style={style} />;
  }}
</Spring>
```

Where the value of `tweeningCollection` might be e.g. `{size: {val: 3.578}, top: 20}`.

If, instead of passing a number to `val` (`{val: 10}`), you pass an array or an object, by default `Spring` will interpolate every number in it.

But lots of times you don't want all the values to animate the same way. You can pass a `config` to specify the stiffness and the damping of the `spring`:

```js
{size: {val: 10, config: [120, 17]}, top: 20}
```

A stiffness of `120` and damping of `17` gives the spring a slight bounce effect. The default configuration, if you don't pass `config` alongside `val`, is `[170, 26]`.

You can nest `val` wrappers; the innermost takes priority:

```js
{
  val: {
    size: {val: 10, config: [120, 17]},
    top: 20,
    left: 50
  },
  config: [100, 10]
}
```

Here, `top` and `left` will be animated with [stiffness, damping] of `[100, 10]`, while `size` will use `[120, 17]` instead.

Sometimes you might have a data structure where you want to animate everything but one thing:

```js
{
  val: {
    top: 20,
    left: 50,
    opacity: 1,
    itemID: 19230,
  }
}
```

This is wrong, since `itemID` would accidentally animate too. You can of course do this:

```js
{
  top: {val: 20},
  left: {val: 50},
  opacity: {val: 1},
  itemID: 19230,
}
```

But this is still slightly tedious. Here's an alternative:

```js
{
  val: {
    top: 20,
    left: 50,
    opacity: 1,
    itemID: {val: 19230, config: []},
  }
}
```

Explicitly setting a `config` of `[]` signals `Spring` not to drill down that collection and animate.

Sometime, you want to rely on the currently interpolated value to calculate `endValue`. E.g. (demo 1) a chat head's final position is the current position of the leading chat head. `endValue` can also accept a function `(currentPositions) => yourEndValue`, where `currentPositions` is the same data structure you'd receive from the children callback.

```jsx
// ...Somewhere in your React class
getEndValues: function(currentPositions) {
  // currentPositions of `null` means it's the first render for Spring.
  if (currentPositions == null) {
    return {val: utils.range(6).map(() => [0, 0])};
  }
  // This is really the previous tick of currentPositions. In practice, it
  // doesn't make much difference.
  let endValue = currentPositions.val.map((_, i) => {
    // First one follows the mouse
    return i === 0 ? this.state.mousePosition : currentPositions.val[i - 1];
  });
  // Have fun adjusting config to make the chat heads bounce a little more!
  return {val: endValue, config: [120, 17]};
},

```

### &lt;TransitionSpring />
Like `Spring`, but can takes two other props: `willEnter` and `willLeave`. Throughout this section, please remember that ""

`endValue`: now constrained to an object of the shape `{key => yourStuff}` (the data is constrained to this shape, but that doesn't mean the way you use your interpolated value has to be). When your the `endValue` provide differs from the current interpolated value by an added/removed key:

`willEnter`: a callback that's called **once** and is passed `(keyThatEnters, endValueYouJustSpecified, currentInterpolatedValue, currentSpeed)`. Return an object/array configuration that'll serve as the starting value of that new key. That configuration will be merged into `endValue`. The default value of `willEnter` is `(key, endValue) => endValue[key]`. It returns the same configuration as the one you just specified in `endValue`. In other words, the start and end are the same: no animation.

`willLeave`: a callback that's called **many** times and is passed `(keyThatLeaves, endValueYouJustSpecified, currentInterpolatedValue, currentSpeed)`. Return an object/array configuration (which will serve as the new `endValue[keyThatLeaves]` and merged into `endValue`) to indicate you still want to keep the item around. Otherwise, return `null`.

#### Sample Usage
_(See the demo files for fuller ones.)_

```jsx
let Demo = React.createClass({
  getInitialState() {
    return {
      blocks: {
        a: 'I am a',
        b: 'I am b',
        c: 'I am c',
      },
    };
  },

  getEndValue() {
    let blocks = this.state.blocks;
    let configs = {};
    Object.keys(blocks).forEach(key => {
      configs[key] = {
        height: {val: 50},
        opacity: {val: 1},
        text: blocks[key], // interpolate the above 2 fields only
      };
    });
    return configs;
  },

  willEnter(key) {
    return {
      height: {val: 50},
      opacity: {val: 1},
      text: this.state.blocks[key],
    };
  },

  willLeave(key, endValue, currentValue, currentSpeed) {
    if (currentValue[key].opacity.val === 0 && currentSpeed[key].opacity.val === 0) {
      return null; // kill component when opacity reaches 0
    }
    return {
      height: {val: 0},
      opacity: {val: 0},
      text: currentValue[key].text,
    };
  },

  handleClick(key) {
    let {...newBlocks} = this.state.blocks;
    delete newBlocks[key];
    this.setState({blocks: newBlocks});
  },

  render() {
    return (
      <TransitionSpring
        endValue={this.getEndValue}
        willEnter={this.willEnter}
        willLeave={this.willLeave}>
        {currentValue =>
          <div>
            {Object.keys(currentValue).map(key => {
              let style = {
                height: currentValue[key].height.val,
                opacity: currentValue[key].opacity.val,
              };
              return (
                <div onClick={this.handleClick.bind(null, key)} style={style}>
                  {currentValue[key].text}
                </div>
              );
            })}}
          </div>
      </TransitionSpring>
    );
  }
});
```

### Little Extras
_(You might not need this until later on.)_
Since `TransitionSpring` dictates `endValue` to be an object, manipulating keys could be a little more tedious than manipulating arrays. Here are the common scenarios' solutions:

- Insert at the beginning: `{newKey: myConfigForThisKey, ...oldConfigs}`.
- Insert at the end: `{...oldConfigs, newKey: myConfigForThisKey}`.
- Slice/splice/reverse/sort: this library exposes a `utils.reorderKeys` function.

#### `utils.reorderKeys(object, newKeysFunction)`
`newKeysFunction` will receive, as arguments, the array of keys in `object` and should return a new array of keys (with e.g. order changed and/or keys missing). `reorderKeys` will then return a new object similar to `object`, but with the keys in the order `newKeysFunction` dictated.
