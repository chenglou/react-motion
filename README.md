# React-Motion

[![Build Status](https://travis-ci.org/chenglou/react-motion.svg?branch=master)](https://travis-ci.org/chenglou/react-motion)
[![npm version](https://badge.fury.io/js/react-motion.svg)](https://www.npmjs.com/package/react-motion)
[![Bower version](https://badge.fury.io/bo/react-motion.svg)](http://badge.fury.io/bo/react-motion)
[![react-motion channel on slack](https://img.shields.io/badge/slack-react--motion%40reactiflux-61DAAA.svg?style=flat)](http://reactiflux.herokuapp.com)

```jsx
import {Motion, spring} from 'react-motion';
// In your render...
<Motion defaultStyle={{x: 0}} style={{x: spring(10)}}>
  {value => <div>{value.x}</div>}
</Motion>
```

Animate a counter from `0` `10`. For more advanced usage, see below.

## Install

Npm:
`npm install react-motion`

Bower:
`bower install react-motion`

1998 Script Tag:
`<script src="path/to/react-motion/build/react-motion.js"></script>`
(Module exposed as `ReactMotion`)

Or build it yourself from the repo: `git clone https://github.com/chenglou/react-motion.git && cd react-motion && npm install && npm run prerelease`

**For React-native**, instead of `require('react-motion')`, do `require('react-motion/native')`.

_(P.S. Don't forget to compile for production when you test your animation's performance!)_

## Demos
- [Simple Transition](http://chenglou.me/react-motion/demos/demo0-simple-transition)
- [Chat Heads](http://chenglou.me/react-motion/demos/demo1-chat-heads)
- [Draggable Balls](http://chenglou.me/react-motion/demos/demo2-draggable-balls)
- [TodoMVC List Transition](http://chenglou.me/react-motion/demos/demo3-todomvc-list-transition)
- [Photo Gallery](http://chenglou.me/react-motion/demos/demo4-photo-gallery)
- [Spring Parameters Chooser](http://chenglou.me/react-motion/demos/demo5-spring-parameters-chooser)
- [Water Ripples](http://chenglou.me/react-motion/demos/demo7-water-ripples)
- [Draggable List](http://chenglou.me/react-motion/demos/demo8-draggable-list)

## What does this library try to solve?

[My React-Europe talk](https://www.youtube.com/watch?v=1tavDv5hXpo)

For 95% of use-cases of animating components, we don't have to resort to using hard-coded easing curves and duration. Set up a stiffness and damping for your UI element, and let the magic of physics take care of the rest. This way, you don't have to worry about petty situations such as interrupted animation behavior. It also greatly simplifies the API.

This library also provides an alternative, more powerful API for React's `TransitionGroup`.

## API

### `type PhysicsConfig = [number, number]`
A spring's stiffness and damping. For example, `[120, 17]` would define a stiffness of `120`, and a damping of `17`.

### `type SpringConfig = {val: number, config: PhysicsConfig}`
A configuration object that specifies how to animate to the destination `val`, and the physics `config` to apply during that interpolation. This is usually constructed using the `spring` function.

### `type Style = {[key: string]: (SpringConfig | any)}`
A map of style configs to animate. If the supplied value is not a `SpringConfig` object, the animation will jump straight to that value instead of interpolating.

#### Example

```jsx
let style = {x: 5.2, y: spring(12.1), text: "hi"};
```

### `type StylesMap = {[id: string]: Style}`
A series of of styles to interpolate between.

The keys must be unique _non-number_ IDs because the enumeration order of numeric keys is not defined, which is important when you map over it in the corresponding component's `children` prop.

#### Example

```jsx
let styles = {k1: {x: spring(30)}, k2: {x: spring(20)}};
```

### `function spring(val: number, config?: PhysicsConfig): SpringConfig`

The pervasive helper used to construct a `SpringConfig` object. `config` defaults to `presets.noWobble`. See below for more usage and see [here](#presets) for a list of convenient configurations the library exports.

#### Examples

An animation to the value `10`, using the default `presets.noWobble` physics:

```jsx
let config = spring(10);
```

An animation to the value `10`, with a stiffness of `120` and damping of `17`:

```jsx
let config = spring(10, [120, 17]);
```

#### Note

This is not the `SpringConfig` component in version <0.3.0 - this has been renamed to `Motion` (see below).

### `<Motion />`

#### `props`

##### `defaultStyle?: Style`
Optional. The value when the component first renders (ignored in subsequent renders). Accepts an object of arbitrary keys, mapping to initial values you want to animate, e.g. `{x: 0, y: 10}`.

##### `style: Style`
Required. Must have the same keys throughout component's existence. Must have the same keys as `defaultStyle` (if provided). Similar to `defaultStyle`, but asks for a `spring` configuration as the destination value: `{x: spring(10), y: spring(20, [120, 17])}`.

##### `children: (interpolated: Style) => ?React.Component`
Required, which is passed an interpolated style object, e.g. `{x: 5.2, y: 12.1}`. Must returns a React element to render.

```jsx
<Motion defaultStyle={{x: 0}} style={{x: spring(10, [120, 17])}}>
  {interpolatedStyle => <div>{interpolatedStyle.x}</div>}
</Motion>
```

### `<StaggeredMotion />`
When you want to animate a list of items, you can certainly create an array of `Motion`s and animate each. However, you often want to "stagger" them, i.e. animate items in one after another with a delay. Hard-coding this duration goes against the very purpose of spring physics. Instead, here's a natural, physics-based alternative, where "the destination position of an item depends on the current position of another".

#### `props`

##### `defaultStyles?: Array<Style>`
Optional. Similar to `Motion`'s `defaultStyle`, except an array of styles.

##### `styles: (previous?: Array<Style>) => Array<Style>`
Required. Takes as argument the previous array of styles (which is `undefined` at first render, unless `defaultStyles` is provided!). Return the array of styles containing the destination values.

##### `children: (interpolated: Array<Style>) => ?React.Component`
Required. Similar to `Motion`'s `children`, but accepts the array of interpolated styles instead, e.g. `[{x: 5}, {x: 6.4}, {x: 8.1}]`

#### Example

```jsx
<StaggeredMotion
  defaultStyles={[{x: 0}, {x: 10}, {x: 20}]}
  styles={prevStyles => prevStyles.map((_, i) => {
    return i === 0
      ? {x: spring(this.state.mouseX)} // first item follows mouse's x position
      : prevStyles[i - 1]; // item i follow the position of the item before it, creating a natural staggering spring
  })}>
  {interpolatedStyles =>
    <div>
      {interpolatedStyles.map((style, i) =>
        <div key={i} style={{left: style.x}} />
      )}
    </div>
  }
</StaggeredMotion>
```

### `<TransitionMotion />`
**The magic component that helps you to do mounting and unmounting animation.** Unlike React's `TransitionGroup`, instead of retaining a few items in a list when they disappear, `TransitionMotion` diffs on the shape of its `styles` object prop.

**The general idea**

Let `TransitionMotion`'s `styles` be `{myKey1: {x: spring(30)}, myKey2: {x: spring(20)}}`. The interpolated styles passed to the `children` function, after a moment, would be `{myKey1: {x: 15.1}, myKey2: {x: 8.2}}`.

A few renders later, you kill `myKey1` and its style config, i.e. pass the new `styles` as `{myKey2: {x: spring(20)}}`. `TransitionMotion` detects a missing key, but **retains** the key in the interpolated values as `{myKey1: ..., myKey2: ...}`.

This is when `TransitionMotion` calls the prop `willLeave` that you provide, passing `myKey2` as argument. You're asked to return a final style config (for example, `{x: spring(50)}`) for `myKey1`, representing the style values that, when `interpolatedStyles.myKey1` reaches them, allows `TransitionMotion` to truly kill `myKey1` and its style config from the interpolated styles.

In summary: `styles` is `{k1: {x: spring(30)}, k2: {x: spring(20)}}`. Next render, `styles` is `{k2: {x: spring(20)}}`. The interpolated styles passed to children aren't affected, but remember that the `k2: configReturnedFromWillLeave` (say, `{x: spring(50)}`) part doesn't exist in the actual `styles` anymore. Moments later, interpolated styles reach `{k1: {x: 50}, k2: {x: 19.2}}`; it then re-renders, kills `k1` and become `{k2: {x: 19.2}}`. All this time, you're mapping over the interpolate styles and rendering two items, until the last render.

Similar but simpler logic for `willEnter`.

#### `props`

##### `defaultStyles?: StylesMap`
Optional. Accepts an object of the format `{myKey1: styleObject, myKey2: styleObject}` where each `styleObject` is similar to `Motion`'s `defaultStyle`.

##### `styles: StylesMap | (previous?: StylesMap) => StylesMap`
Required. Accepts an object similar to `defaultStyles`, but where `styleObject` has `spring` configurations: `{myKey1: {x: spring(10)}, myKey2: {y: spring(20)}}`. Alternatively, also accepts a function which takes a `prevStyles` parameter (just like `StaggeredMotion`; you can do staggered unmounting animation!), and returns the destination styles.

##### `willEnter?: (enteredKey: string, enteredStyle: Style, styles: StylesMap, currentInterpolatedStyle: Style, currentSpeed: number) => Style`
Optional. Pass a function that takes the arguments `(keyFromStylesThatJustEntered, correspondingStyleOfKey, styles, currentInterpolatedStyle, currentSpeed)`, and that returns a style object similar to a `defaultStyle`.

Defaults to a function that returns `correspondingStyleOfKey`, in this case `{x: spring(20)}`.

##### `willLeave?: (leftKey: string, leftStyle: Style, styles: StylesMap, currentInterpolatedStyle: Style, currentSpeed: number) => Style`
Optional. Pass a function that takes the arguments `keyThatJustLeft, correspondingStyleOfKey, styles, currentInterpolatedStyle, currentSpeed)` and that return a style object containing some `SpringConfig` as the destination configuration.

Optional, defaults to `correspondingStyleOfKey`, i.e. immediately killing the key from the interpolated values.

##### `children: (interpolated: StylesMap) => ?React.Component`
Required. Similar to `Motion`'s `children`, but accepts the object of interpolated styles instead.

#### Example

```jsx
const Demo = React.createClass({
  getInitialState() {
    return {
      blocks: {
        a: 'I am a',
        b: 'I am b',
        c: 'I am c',
      },
    };
  },

  getStyles() {
    let configs = {};
    Object.keys(this.state.blocks).forEach(key => {
      configs[key] = {
        opacity: spring(1),
        text: this.state.blocks[key], // not interpolated
      };
    });
    return configs;
  },

  // not used here! We don't add any new item
  willEnter(key) {
    return {
      opacity: spring(0), // start at 0, gradually expand
      text: this.state.blocks[key], // this is really just carried around so
      // that interpolated values can still access the text when the key is gone
      // from actual `styles`
    };
  },

  willLeave(key, style) {
    return {
      opacity: spring(0), // make opacity reach 0, after which we can kill the key
      text: style.text,
    };
  },

  handleClick(key) {
    const {...newBlocks} = this.state.blocks;
    delete newBlocks[key];
    this.setState({blocks: newBlocks});
  },

  render() {
    return (
      <TransitionMotion
        styles={this.getStyles()}
        willEnter={this.willEnter}
        willLeave={this.willLeave}>
        {interpolatedStyles =>
          <div>
            {Object.keys(interpolatedStyles).map(key => {
              const {text, ...style} = interpolatedStyles[key];
              return (
                <div onClick={this.handleClick.bind(null, key)} style={style}>
                  {text}
                </div>
              );
            })}
          </div>
        }
      </TransitionMotion>
    );
  },
});
```

### Modules

#### `presets`
Some tasteful, commonly used spring presets you can plug into your `style` like so: `spring(10, presets.wobbly)`. [See here](https://github.com/chenglou/react-motion/blob/043231a84e420ba1cc7f5b0ceb1753a6406d38f1/src/presets.js).

##### `const noWobble: PhysicsConfig`

The default value when calling `spring` without a `stringConfig`.

##### `const gentle: PhysicsConfig`

##### `const wobbly: PhysicsConfig`

##### `const stiff: PhysicsConfig`

#### `utils`
Since `TransitionMotion` dictates `styles` to be an object, manipulating keys could be a little more tedious than manipulating arrays. Here are the common scenarios' solutions:

- Insert item at the beginning: `{newKey: myConfigForThisKey, ...oldConfigs}`.
- Insert item at the end: `{...oldConfigs, newKey: myConfigForThisKey}`.
- Slice/splice/reverse/sort: this library exposes a `utils.reorderKeys` function.

**Note**: object keys creation order is now guaranteed by the specs, except for integer keys, which follow ascending order and should not be used with `TransitionMotion`. Fortunately, you can just add a letter to your key to turn them into "true" strings.

##### `function reorderKeys(styles: StylesMap, reorder: (keys: Array<string>) => Array<string>): StylesMap`
Returns a new `StylesMap` of the same shape as `styles`, but with the keys in the order that the `reorder` function dictated. For example:

```jsx
utils.reorderKeys({a: 1, b: 2}, (keysArray) => ['b', 'a']) // returns {b: 2, a: 1}
```

## FAQ

- How do I set the duration of my animation?

[Hard-coded duration goes against fluid interfaces](https://twitter.com/andy_matuschak/status/566736015188963328). If your animation is interrupted mid-way, you'd get a weird completion animation if you hard-coded the time. That being said, in the demo section there's a great [Spring Parameters Chooser](http://chenglou.me/react-motion/demos/demo5-spring-parameters-chooserl) for you to have a feel of what spring is appropriate, rather than guessing a duration in the dark.

- How do I unmount the `TransitionMotion` container itself?

You don't. Unless you put it in another `TransitionMotion`...

- How do I do staggering/chained animation where items animate in one after another?

See [`StaggeredMotion`](#StaggeredMotion)

- My `ref` doesn't work in the children function.

React string refs won't work:

```jsx
<Motion style={...}>{currentValue => <div ref="stuff" />}</Motion>
```

This is how React works. Here's the [callback ref solution](https://facebook.github.io/react/docs/more-about-refs.html#the-ref-callback-attribute).
