# React-Animation

__Rushed to get the library out in time for the React-Europe talk. More polished codebase coming tonight!__

```js
<Spring endValue={10}>
  {currentValues => <div>{currentValues}</div>}
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

## API Usage

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
        <Spring className="demo0" endValue={this.state.open ? 400 : 0}>
          {x =>
            <div className="demo0-block" style={{
              WebkitTransform: `translate3d(${x}px, 0, 0)`,
              transform: `translate3d(${x}px, 0, 0)`,
            }} />
          }
        </Spring>
      </div>
    );
  }
});
```

--- **README work in progress** ---

#### Spring
Accepts a `endValue` prop that's a function `(tween, currVals) => finalVals`. It takes `tween` and `currVals` and returns a data structure representing the final endValue. `currVals` will always be the same shape as what `endValue` returns. The Spring will automatically tween between the current value and the final value returned by `endValue`.
`tween` is a function for you to indicate what you want/don't want animated. You can use it like this:
```js
let Demo = React.createClass({
  ...
  endValue(tween, currVals) {
    // The function `tween` given to you is for you to describe what you
    // want animated
    return tween({
        stuff: tween(10) // you can nest tweens,
        importantData: tween({data: "won't animate", number: 1}, -1, -1) // Un-tween
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

__willLeave__: `(key, tween, finalVals, currVals, currV) => nextFinalVals`

`willLeave` should return a data structure representing the next final `endValue` to aim for.
