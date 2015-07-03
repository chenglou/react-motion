React-animation
---
_Official documentation coming tonight!_

Declarative animation for React. 

##Install
```sh
git clone https://github.com/chenglou/react-animation.git
cd react-animation
npm i
```

##Build and Watch

```sh
npm start
```

##API
Example usage
```js
import React from 'react';
import Spring from 'react-aniamtion';
import {range} from '../utils';

let Demo = React.createClass({
  displayName: 'Demo',

  getInitialState: function() {
    return {mouse: [0, 0]};
  },

  handleMouseMove: function({pageX, pageY}) {
    this.setState({mouse: [pageX, pageY]});
  },

  getValues: function(tween, currentValues) {
    if (currentValues == null) {
      return range(6).map(() => [0, 0]);
    }
    
    // The function `tween` given to you is for you to describe what you  
    // want animated
    return tween(currentValues.reduce((acc, _, i) => {
      return i === 0 ? [this.state.mouse] : [...acc, currentValues[i - 1]];
    }, []), 120, 17);
  },

  render: function() {
    return (
      <Spring 
        className="demo1" 
        values={this.getValues} 
        onMouseMove={this.handleMouseMove}>
        {currentValues => currentValues.map(([x, y], i) => {
          return (
            <div
              key={i}
              style={{
                backgroundColor: 'red',
                WebkitTransform: `translate3d(${x - 25}px, ${y - 25}px, 0)`,
                transform: `translate3d(${x - 25}px, ${y - 25}px, 0)`,
                zIndex: currentValues.length - i,
              }} />
          );
        })}
      </Spring>
    );
  }
});
```

The API exports Spring by default, but also comes with TransitionSpring. 

#### Spring
Accepts a `values` prop that's a function `(tween, currVals) => finalVals`. It takes `tween` and `currVals` and returns a data structure representing the final values. The Spring will automatically tween between the current value and the final value.
`tween` is a function for you to indicate what you want/don't want animated. You can use it like this:
```js
let Demo = React.createClass({
  ...
  values: function(tween, currVals) {
    // The function `tween` given to you is for you to describe what you  
    // want animated
    return tween({
        stuff: tween(10) // you can nest tweens,
        importantData: tween({data: "won't animate", number: 1}, -1, -1) // Un-tween
    });
  },

  render: function() {
    return (
      <Spring values={this.values}>
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

__willEnter__: (key, finalVals, currVals) => defaultValForKey

`willEnter` should return the data structure to replace the missing `key` in currVals.

__willLeave__: (key, tween, finalVals, currVals, currV) => nextFinalVals

`willLeave` should return a data structure representing the next final values to aim for.