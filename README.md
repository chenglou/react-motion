# React-Animation

__Rushed to get the library out in time for the React-Europe talk. More polished codebase coming tonight!__

```js
<Spring endValue={{val: 10}}>
  {interpolated => <div>{interpolated.val}</div>}
</Spring>
```

Animate a counter to `10`, from whatever value it currently is. For more advanced usage, see below.

Will provide npm package soon. For now, please use:

```sh
git clone https://github.com/chenglou/react-animation.git
cd react-animation
npm install
npm run build
```

Then, check out the `index.html`s in the demo folders.

## What does this library try to solve?

I believe that for 95% of use-cases of animating components, we don't have to resort to using hard-coded easing curves and duration. Set up a stiffness and damping constant for your UI element, and let the magic of physics take care of the rest. This way, you don't have to worry about the more petty questions such as "what if the item's currently animating and is a position `x`? How do I adjust my time and curve?".

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

### &lt;Spring />
Exposes a single prop, `endValue`, which takes either an object, an array or a function that returns an object or an array.
Type: `endValue: object | array | object -> (object | array)`.

`endValue` can be of an arbitrary shape. There are however 2 reserved keys: `val` and `config`. Say your initial data structure looks so:

```js
{size: 10, top: 20}
```

You only want to animate `size`. Indicate what value/entire sub-collection you want to animate by wrapping it:

```js
{size: {val: 10}, top: 20}
```

When you pass this to `endValue`, `Spring` will traverse your data structure and animate `size` based on its previous value, which is the data structure from the previous render. `top` will be kept untouched. You receive the interpolated data structure as an argument to your children function:

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

If, instead of passing a number to `val` (`{val: 10}`), you pass an array or an object, by default Spring will interpolate every number in it.

But lots of times you don't want all the values to animate the same way. You can pass a `config` to specify the stiffness and the damping of the spring:

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

Here, `top` and `left` will be animated with [stiffness, damping] of [`100`, `10`], while `size` will use [`120`, `17`] instead.

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

--- **README work in progress** ---

#### Spring
Accepts a `endValue` prop that's a function `(update, currVals) => finalVals`. It takes `update` and `currVals` and returns a data structure representing the final endValue. `currVals` will always be the same shape as what `endValue` returns. The Spring will automatically update between the current value and the final value returned by `endValue`.
`update` is a function for you to indicate what you want/don't want animated. You can use it like this:
```js
let Demo = React.createClass({
  ...
  endValue(update, currVals) {
    // The function `update` given to you is for you to describe what you
    // want animated
    return update({
        stuff: update(10) // you can nest updates,
        importantData: update({data: "won't animate", number: 1}, -1, -1) // Un-update
    });
  },

  render() {
    return (
      <Spring endValue={this.endValue}>
        {currVals => ...}
      </Spring>
    );
  }
});
```
`currVals` is the current state of the Spring. In this case `currVals` would look like this:

```js
let currVals = {
    stuff: 10, // somewhere between where it started and the destination which
               // is 10
    importantData: {
        data: "won't animate",
        number: 1
    }
}
```

#### TransitionSpring
Same as the Spring but will transition things in and out when you need to unmount components. Takes two other props: `willEnter` and `willLeave`.

__willEnter__: `(key, finalVals, currVals) => defaultValForKey`

`willEnter` should return the data structure to replace the missing `key` in `currVals`.

__willLeave__: `(key, update, finalVals, currVals, currV) => nextFinalVals`

`willLeave` should return a data structure representing the next final `endValue` to aim for.
