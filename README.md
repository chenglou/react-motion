# React-Motion

[![Build Status](https://travis-ci.org/chenglou/react-motion.svg?branch=master)](https://travis-ci.org/chenglou/react-motion)
[![npm version](https://badge.fury.io/js/react-motion.svg)](https://www.npmjs.com/package/react-motion)
[![Bower version](https://badge.fury.io/bo/react-motion.svg)](http://badge.fury.io/bo/react-motion)
[![react-motion channel on discord](https://img.shields.io/badge/discord-react--motion%40reactiflux-738bd7.svg?style=flat)](https://discordapp.com/invite/0ZcbPKXt5bYzmcI0)

```js
import {Motion, spring} from 'react-motion';
// In your render...
<Motion defaultStyle={{x: 0}} style={{x: spring(10)}}>
  {value => <div>{value.x}</div>}
</Motion>
```

Animate a counter from `0` to `10`. For more advanced usage, see below.

### Install

- Npm: `npm install --save react-motion`

- Bower: **do not install with `bower install react-motion`, it won't work**. Use `bower install --save https://unpkg.com/react-motion/bower.zip`. Or in `bower.json`:
```json
{
  "dependencies": {
    "react-motion": "https://unpkg.com/react-motion/bower.zip"
  }
}
```
then include as
```html
<script src="bower_components/react-motion/build/react-motion.js"></script>
```

- 1998 Script Tag:
```html
<script src="https://unpkg.com/react-motion/build/react-motion.js"></script>
(Module exposed as `ReactMotion`)
```

**Works with React-Native v0.18+**.

### Demos
- [Simple Transition](http://chenglou.github.io/react-motion/demos/demo0-simple-transition)
- [Chat Heads](http://chenglou.github.io/react-motion/demos/demo1-chat-heads)
- [Draggable Balls](http://chenglou.github.io/react-motion/demos/demo2-draggable-balls)
- [TodoMVC List Transition](http://chenglou.github.io/react-motion/demos/demo3-todomvc-list-transition)
- [Photo Gallery](http://chenglou.github.io/react-motion/demos/demo4-photo-gallery)
- [Spring Parameters Chooser](http://chenglou.github.io/react-motion/demos/demo5-spring-parameters-chooser)
- [Water Ripples](http://chenglou.github.io/react-motion/demos/demo7-water-ripples)
- [Draggable List](http://chenglou.github.io/react-motion/demos/demo8-draggable-list)

[Check the wiki for more!](https://github.com/chenglou/react-motion/wiki/Gallery-of-third-party-React-Motion-demos)

### Try the Demos Locally
```sh
git clone https://github.com/chenglou/react-motion.git
cd react-motion
npm install
```

- With hot reloading (**slow, development version**): run `npm start`.
- Without hot reloading (**faster, production version**): run `npm run build-demos` and open the static `demos/demo_name/index.html` file directly. **Don't forget to use production mode when testing your animation's performance**!

To build the repo yourself: `npm run prepublish`.

## What does this library try to solve?

[My React-Europe talk](https://www.youtube.com/watch?v=1tavDv5hXpo)

For 95% of use-cases of animating components, we don't have to resort to using hard-coded easing curves and duration. Set up a stiffness and damping for your UI element, and let the magic of physics take care of the rest. This way, you don't have to worry about petty situations such as interrupted animation behavior. It also greatly simplifies the API.

This library also provides an alternative, more powerful API for React's `TransitionGroup`.

## API

Exports:
- `spring`
- `Motion`
- `StaggeredMotion`
- `TransitionMotion`
- `presets`

[Here](https://github.com/chenglou/react-motion/blob/9cb90eca20ecf56e77feb816d101a4a9110c7d70/src/Types.js)'s the well-annotated public [Flow type](http://flowtype.org) definition file (you don't have to use Flow with React-motion, but the types help document the API below).

P.S. using TypeScript? [Here](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/react-motion/react-motion.d.ts) are the React-motion TypeScript definitions!

---

### Helpers

##### - spring: (val: number, config?: SpringHelperConfig) => OpaqueConfig
Used in conjunction with the components below. Specifies the how to animate to the destination value, e.g. `spring(10, {stiffness: 120, damping: 17})` means "animate to value 10, with a spring of stiffness 120 and damping 17".

- `val`: the value.
- `config`: optional, for further adjustments. Possible fields:
  - `stiffness`: optional, defaults to `170`.
  - `damping`: optional, defaults to `26`.
  - `precision`: optional, defaults to `0.01`. Specifies both the rounding of the interpolated value and the speed (internal).

  It's normal not to feel how stiffness and damping affect your spring; use [Spring Parameters Chooser](http://chenglou.github.io/react-motion/demos/demo5-spring-parameters-chooser) to get a feeling. **Usually**, you'd just use the list of tasteful stiffness/damping presets below.

##### - Presets for `{stiffness, damping}`
Commonly used spring configurations used like so: `spring(10, presets.wobbly)` or `spring(20, {...presets.gentle, precision: 0.1})`. [See here](https://github.com/chenglou/react-motion/blob/9cb90eca20ecf56e77feb816d101a4a9110c7d70/src/presets.js).

---

### &lt;Motion />
#### Usage
```jsx
<Motion defaultStyle={{x: 0}} style={{x: spring(10)}}>
  {interpolatingStyle => <div style={interpolatingStyle} />}
</Motion>
```

#### Props

##### - style: Style

Required. The `Style` type is an object that maps to either a `number` or an `OpaqueConfig` returned by `spring()` above. Must keep the same keys throughout component's existence. The meaning of the values:

- an `OpaqueConfig` returned from `spring(x)`: interpolate to `x`.
- a `number` `x`: jump to `x`, do not interpolate.

##### - defaultStyle?: PlainStyle
Optional. The `PlainStyle` type maps to `number`s. Defaults to an object with the same keys as `style` above, whose values are the initial numbers you're interpolating on. **Note that during subsequent renders, this prop is ignored. The values will interpolate from the current ones to the destination ones (specified by `style`)**.

##### - children: (interpolatedStyle: PlainStyle) => ReactElement
Required **function**.

- `interpolatedStyle`: the interpolated style object passed back to you. E.g. if you gave `style={{x: spring(10), y: spring(20)}}`, you'll receive as `interpolatedStyle`, at a certain time, `{x: 5.2, y: 12.1}`, which you can then apply on your `div` or something else.

- Return: must return **one** React element to render.

##### - onRest?: () => void
Optional. The callback that fires when the animation comes to a rest.

---

### &lt;StaggeredMotion />
Animates a collection of (**fixed length**) items whose values depend on each other, creating a natural, springy, "staggering" effect [like so](http://chenglou.github.io/react-motion/demos/demo1-chat-heads). This is preferred over hard-coding a delay for an array of `Motions` to achieve a similar (but less natural-looking) effect.

#### Usage
```jsx
<StaggeredMotion
  defaultStyles={[{h: 0}, {h: 0}, {h: 0}]}
  styles={prevInterpolatedStyles => prevInterpolatedStyles.map((_, i) => {
    return i === 0
      ? {h: spring(100)}
      : {h: spring(prevInterpolatedStyles[i - 1].h)}
  })}>
  {interpolatingStyles =>
    <div>
      {interpolatingStyles.map((style, i) =>
        <div key={i} style={{border: '1px solid', height: style.h}} />)
      }
    </div>
  }
</StaggeredMotion>
```

Aka "the current spring's destination value is the interpolating value of the previous spring". Imagine a spring dragging another. Physics, it works!

#### Props

##### - styles: (previousInterpolatedStyles: ?Array&lt;PlainStyle>) => Array&lt;Style>
Required **function**. **Don't forget the "s"**!

- `previousInterpolatedStyles`: the previously interpolating (array of) styles (`undefined` at first render, unless `defaultStyles` is provided).

- Return: must return an array of `Style`s containing the destination values, e.g. `[{x: spring(10)}, {x: spring(20)}]`.

##### - defaultStyles?: Array&lt;PlainStyle>
Optional. Similar to `Motion`'s `defaultStyle`, but an array of them.

##### - children: (interpolatedStyles: Array&lt;PlainStyle>) => ReactElement
Required **function**. Similar to `Motion`'s `children`, but accepts the array of interpolated styles instead, e.g. `[{x: 5}, {x: 6.4}, {x: 8.1}]`

(No `onRest` for StaggeredMotion because we haven't found a good semantics for it yet. Voice your support in the issues section.)

---

### &lt;TransitionMotion />
**Helps you to do mounting and unmounting animation**.

#### Usage

You have items `a`, `b`, `c`, with their respective style configuration, given to `TransitionMotion`'s `styles`. In its `children` function, you're passed the three interpolated styles as params; you map over them and produce three components. All is good.

During next render, you give only `a` and `b`, indicating that you want `c` gone, but that you'd like to animate it reaching value `0`, before killing it for good.

Fortunately, `TransitionMotion` has kept `c` around and still passes it into the `children` function param. So when you're mapping over these three interpolated styles, you're still producing three components. It'll keep interpolating, while checking `c`'s current value at every frame. Once `c` reaches the specified `0`, `TransitionMotion` will remove it for good (from the interpolated styles passed to your `children` function).

This time, when mapping through the two remaining interpolated styles, you'll produce only two components. `c` is gone for real.

```jsx
const Demo = React.createClass({
  getInitialState() {
    return {
      items: [{key: 'a', size: 10}, {key: 'b', size: 20}, {key: 'c', size: 30}],
    };
  },
  componentDidMount() {
    this.setState({
      items: [{key: 'a', size: 10}, {key: 'b', size: 20}], // remove c.
    });
  },
  willLeave() {
    // triggered when c's gone. Keeping c until its width/height reach 0.
    return {width: spring(0), height: spring(0)};
  },
  render() {
    return (
      <TransitionMotion
        willLeave={this.willLeave}
        styles={this.state.items.map(item => ({
          key: item.key,
          style: {width: item.size, height: item.size},
        }))}>
        {interpolatedStyles =>
          // first render: a, b, c. Second: still a, b, c! Only last one's a, b.
          <div>
            {interpolatedStyles.map(config => {
              return <div key={config.key} style={{...config.style, border: '1px solid'}} />
            })}
          </div>
        }
      </TransitionMotion>
    );
  },
});
```

#### Props

First, two type definitions to ease the comprehension.

- `TransitionStyle`: an object of the format `{key: string, data?: any, style: Style}`.

  - `key`: required. The ID that `TransitionMotion` uses to track which configuration is which across renders, even when things are reordered. Typically reused as the component `key` when you map over the interpolated styles.

  - `data`: optional. Anything you'd like to carry along. This is so that when the previous section example's `c` disappears, you still get to access `c`'s related data, such as the text to display along with it.

  - `style`: required. The actual starting style configuration, similar to what you provide for `Motion`'s `style`. Maps keys to either a number or an `OpaqueConfig` returned by `spring()`.

- `TransitionPlainStyle`: similar to above, except the `style` field's value is of type `PlainStyle`, aka an object that maps to numbers.

##### - styles: Array&lt;TransitionStyle> | (previousInterpolatedStyles: ?Array&lt;TransitionPlainStyle>) => Array&lt;TransitionStyle>
Required. Accepts either:

  - an array of `TransitionStyle` configs, e.g. `[{key: 'a', style: {x: spring(0)}}, {key: 'b', style: {x: spring(10)}}]`.

  - a function similar to `StaggeredMotion`, taking the previously interpolating styles (`undefined` at first call, unless `defaultStyles` is provided), and returning the previously mentioned array of configs. __You can do staggered mounting animation with this__.

##### - defaultStyles?: Array&lt;TransitionPlainStyle>
Optional. Similar to the other components' `defaultStyle`/`defaultStyles`.

##### - children: (interpolatedStyles: Array&lt;TransitionPlainStyle>) => ReactElement
Required **function**. Similar to other two components' `children`. Receive back an array similar to what you provided for `defaultStyles`, only that each `style` object's number value represent the currently interpolating value.

##### - willLeave?: (styleThatLeft: TransitionStyle) => ?Style
Optional. Defaults to `() => null`. **The magic sauce property**.

- `styleThatLeft`: the e.g. `{key: ..., data: ..., style: ...}` object from the `styles` array, identified by `key`, that was present during a previous render, and that is now absent, thus triggering the call to `willLeave`. Note that the style property is exactly what you passed in `styles`, and is not interpolated. For example, if you passed a spring for `x` you will receive an object like `{x: {stiffness, damping, val, precision}}`.

- Return: `null` to indicate you want the `TransitionStyle` gone immediately. A `Style` object to indicate you want to reach transition to the specified value(s) before killing the `TransitionStyle`.

##### - didLeave?: (styleThatLeft: `{key: string, data?: any}`) => void
Optional. Defaults to `() => {}`.

- `styleThatLeft`: the `{key:..., data:...}` that was removed after the finished transition.

##### - willEnter?: (styleThatEntered: TransitionStyle) => PlainStyle
Optional. Defaults to `styleThatEntered => stripStyle(styleThatEntered.style)`. Where `stripStyle` turns `{x: spring(10), y: spring(20)}` into `{x: 10, y: 20}`.

- `styleThatEntered`: similar to `willLeave`'s, except the `TransitionStyle` represents the object whose `key` value was absent during the last `render`, and that is now present.

- Return: a `defaultStyle`-like `PlainStyle` configuration, e.g. `{x: 0, y: 0}`, that serves as the starting values of the animation. Under this light, the default provided means "a style config that has the same starting values as the destination values".

**Note** that `willEnter` and `defaultStyles` serve different purposes. `willEnter` only triggers when a previously inexistent `TransitionStyle` inside `styles` comes into the new render.

(No `onRest` for TransitionMotion because we haven't found a good semantics for it yet. Voice your support in the issues section.)

---

## FAQ

- How do I set the duration of my animation?

[Hard-coded duration goes against fluid interfaces](https://twitter.com/andy_matuschak/status/566736015188963328). If your animation is interrupted mid-way, you'd get a weird completion animation if you hard-coded the time. That being said, in the demo section there's a great [Spring Parameters Chooser](http://chenglou.github.io/react-motion/demos/demo5-spring-parameters-chooser) for you to have a feel of what spring is appropriate, rather than guessing a duration in the dark.

- How do I unmount the `TransitionMotion` container itself?

You don't. Unless you put it in another `TransitionMotion`...

- How do I do staggering/chained animation where items animate in one after another?

See [`StaggeredMotion`](#staggeredmotion-)

- My `ref` doesn't work in the children function.

React string refs won't work:

```jsx
<Motion style={...}>{currentValue => <div ref="stuff" />}</Motion>
```

This is how React works. Here's the [callback ref solution](https://facebook.github.io/react/docs/more-about-refs.html#the-ref-callback-attribute).
