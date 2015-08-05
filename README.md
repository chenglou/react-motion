# React-Motion

[![npm version](https://badge.fury.io/js/react-motion.svg)](https://www.npmjs.com/package/react-motion)
[![Bower version](https://badge.fury.io/bo/react-motion.svg)](http://badge.fury.io/bo/react-motion)
[![react-motion channel on slack](https://img.shields.io/badge/slack-react--motion%40reactiflux-61DAAA.svg?style=flat)](https://reactiflux.slack.com/messages/react-motion/)

```js
<Spring defaultValue={{val: 0}} endValue={{val: 10}}>
  {interpolated => <div>{interpolated.val}</div>}
</Spring>
```

Animate a counter from `0` `10`. For more advanced usage, see [below](#presets).

Npm:
`npm install react-motion`

Bower:
`bower install react-motion`

1998 Script Tag:
`<script src="path/to/react-motion/build/react-motion.js"></script>`
(Module exposed as `ReactMotion`)

Or build it yourself from the repo: `git clone https://github.com/chenglou/react-motion.git && npm i && npm run prerelease`

**For React-native**, instead of `require('react-motion')`, do `require('react-motion/native')`.

[Check](https://cdn.rawgit.com/chenglou/react-motion/c3c5403b6821b7a8954e3c379057ae7d9bbc39d5/demos/demo0/index.html) [Out](https://cdn.rawgit.com/chenglou/react-motion/6d4379f7d3a4677f298c64f85794b422a53c916c/demos/demo1/index.html) [The](https://cdn.rawgit.com/chenglou/react-motion/c3c5403b6821b7a8954e3c379057ae7d9bbc39d5/demos/demo2/index.html) [Cool](https://cdn.rawgit.com/chenglou/react-motion/c3c5403b6821b7a8954e3c379057ae7d9bbc39d5/demos/demo3/index.html) [Demos](https://cdn.rawgit.com/chenglou/react-motion/c3c5403b6821b7a8954e3c379057ae7d9bbc39d5/demos/demo4/index.html) [Here](https://cdn.rawgit.com/chenglou/react-motion/c3c5403b6821b7a8954e3c379057ae7d9bbc39d5/demos/demo5/index.html).

## What does this library try to solve?

[My React-Europe talk](https://www.youtube.com/watch?v=1tavDv5hXpo)

For 95% of use-cases of animating components, we don't have to resort to using hard-coded easing curves and duration. Set up a stiffness and damping for your UI element, and let the magic of physics take care of the rest. This way, you don't have to worry about the more petty questions such as "what if the item's currently animating and is a position `x`? How do I adjust my time and curve?". It also greatly simplifies an animation API since there's really not that much to set up.

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
        <Spring defaultValue={{val: 0}} endValue={{val: this.state.open ? 400 : 0}}>
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

The library exports `Spring`, `TransitionSpring`, `presets` and `utils`.

### &lt;Spring />
Exposes the props `defaultValue` (object or array) and `endValue` (object, array or a function that returns an object or an array).

Types:
- `defaultValue: object | array`.
- `endValue: object | array | object -> (object | array)`.

Both values can be of an arbitrary shape (**but must have the same shape. `endValue` must stay the same shape from one render to the next**).

`defaultValue` is used as the first value upon mounting. Usually your `endValue` would differ from it, as to give the mounting animation effect.

`endValue` is the value you want to reach. There are 2 reserved keys for it: `val` and `config`. Say your initial data structure looks so:

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

A stiffness of `120` and damping of `17` gives the spring a slight bounce effect. The library exports a `presets` object that contains the commonly used stiffness and damping. See the `presets` section below.

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

Sometime, you want to rely on the currently interpolated value to calculate `endValue`. E.g. (demo 1) a chat head's final position is the current position of the leading chat head. `endValue` can also accept a function `(prevValue) => yourEndValue`, where `prevValue` is the data you returned from the previous tick of `getEndValue`.

```jsx
// ...Somewhere in your React class
getEndValue: function(prevValue) {
  let endValue = prevValue.val.map((_, i) => {
    // First one follows the mouse
    return i === 0 ? this.state.mousePosition : prevValue.val[i - 1];
  });
  // Have fun adjusting config to make the chat heads bounce a little more!
  return {val: endValue, config: [120, 17]};
},

// in render: <Spring endValue={this.getEndValue}></Spring>
```

### &lt;TransitionSpring />
Like `Spring`, but can take two other props: `willEnter` and `willLeave`. Throughout this section, please remember that

`defaultValue`: see `endValue` just below.

`endValue`: now constrained to an object (or a callback `currentValue -> object`) of the shape `{key => yourStuff}` (the data is constrained to this shape, but that doesn't mean the way you use your interpolated value has to be). When `endValue` differs from the current interpolated value by an added/removed key:

`willEnter`: a callback that's called **once** and is passed `(keyThatEnters, correspondingValueOfKey, endValueYouJustSpecified, currentInterpolatedValue, currentSpeed)`. Return an object/array configuration that'll serve as the starting value of that new key. That configuration will be merged into `endValue`. The default value of `willEnter` is `(key, endValue) => endValue[key]`. It returns the same configuration as the one you just specified in `endValue`. In other words, the start and end are the same: no animation.

`willLeave`: a callback that's called **many** times and is passed `(keyThatLeaves, correspondingValueOfKeyThatJustLeft, endValueYouJustSpecified, currentInterpolatedValue, currentSpeed)`. Return an object/array configuration (which will serve as the new `endValue[keyThatLeaves]` and merged into `endValue`). When that value is reached through the spring interpolation, the key will be actually unmounted.

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

  willLeave(key, value, endValue, currentValue, currentSpeed) {
    // the key with this value is truly killed when the values reaches destination
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
        endValue={this.getEndValue()}
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
            })}
          </div>
        }
      </TransitionSpring>
    );
  }
});
```

### `presets`
Some tasteful, commonly used spring presets you can plug into your `endValue` like so: `{val: 10, config: presets.wobbly}`. [See here](https://github.com/chenglou/react-motion/blob/bae579994bb9090847776f449ba38494a730ebc9/src/presets.js).

### Little Extras
_(You might not need this until later on.)_
Since `TransitionSpring` dictates `endValue` to be an object, manipulating keys could be a little more tedious than manipulating arrays. Here are the common scenarios' solutions:

- Insert at the beginning: `{newKey: myConfigForThisKey, ...oldConfigs}`.
- Insert at the end: `{...oldConfigs, newKey: myConfigForThisKey}`.
- Slice/splice/reverse/sort: this library exposes a `utils.reorderKeys` function.

**Note**: object keys creation order is now guaranteed by the specs, except for integer keys, which follow ascending order and should not be used with `TransitionSpring` (unless that behavior's what you want). Fortunately, you can just add a letter to your key to solve the integer order problem.

#### `utils.reorderKeys(object, newKeysFunction)`
`newKeysFunction` will receive, as arguments, the array of keys in `object` and should return a new array of keys (with e.g. order changed and/or keys missing). `reorderKeys` will then return a new object similar to `object`, but with the keys in the order `newKeysFunction` dictated.

## FAQ

- How do I do staggering/chained animation where items animate in one after another?
In most cases, what you want to express here is a relationship between animations, e.g. item 2 appears after item 1. Staggering/chained animation have hard-coded values and go against the spirit of a physics system. Check out [demo 1](https://cdn.rawgit.com/chenglou/react-motion/6d4379f7d3a4677f298c64f85794b422a53c916c/demos/demo1/index.html); each ball follows the one in front of it, creating a natural staggering animation. The code in `endValue` looks roughly so:

```jsx
<Spring endValue={prevValue => {
  const endValue = prevValue.val.map(
    (_, i) => i === 0 ? someMousePosition : prevValue.val[i - 1]
  );
  return {val: endValue};
}}>
  ...
```
First ball's destination is the mouse position. The subsequent ones' destination is the current position of the ball in front of them (technically, the previous tick's position; Doesn't matter much). The values depend on each other. No hard-coded duration/timeout here!

- My `ref` doesn't work in the children function.
React string refs won't work:

```jsx
<Spring endValue={...}>
  {currentValue => <div ref="stuff" />}
</Spring>
```

This is how React works. Here's the [callback ref solution](https://facebook.github.io/react/docs/more-about-refs.html#the-ref-callback-attribute).
