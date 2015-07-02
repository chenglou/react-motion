'use strict';

import React from 'react';
import Spring, {TransitionSpring} from '../Spring';

let Demo = React.createClass({
  getInitialState: function() {
    return {
      photos: {
        './download1.jpeg': [800, 600],
        './download2.jpeg': [800, 400],
        './download3.jpeg': [700, 500],
      },
      currPhoto: 0,
    };
  },

  next: function(curr) {
    let keys = Object.keys(this.state.photos);
    let idx = keys.indexOf(curr);
    return keys[(idx + 1) % keys.length];
  },

  prev: function(curr) {
    let keys = Object.keys(this.state.photos);
    let idx = keys.indexOf(curr);
    return keys[(idx - 1 + keys.length) % keys.length];
  },

  handleChange: function({target: {value}}) {
    this.setState({currPhoto: value});
  },

  getValues: function(tween) {
    let {photos, currPhoto} = this.state;
    let keys = Object.keys(photos);
    let currKey = keys[currPhoto];
    let [width, height] = photos[currKey];
    let widths = keys.map(key => {
      let [origW, origH] = photos[key];
      return height / origH * origW;
    });
    let offset = 0;
    for (var i = 0; i < widths.length; i++) {
      if (keys[i] === currKey) {
        break;
      }
      offset -= widths[i];
    }
    let configs = {};
    keys.reduce((prevLeft, key, i) => {
      let [origW, origH] = photos[key];
      configs[key] = {
        left: prevLeft,
        height: height,
        width: height / origH * origW,
      };
      return prevLeft + widths[i];
    }, offset);
    configs.container = {
      height: height,
      width: width,
    };
    return tween(configs, 150, 23);
  },

  render: function() {
    let {photos, currPhoto} = this.state;
    return (
      <div>
        <input
          type="range"
          min={0}
          max={Object.keys(photos).length - 1}
          value={currPhoto}
          onChange={this.handleChange} />
        {currPhoto}
        <Spring className="demo4" values={this.getValues}>
          {({container, ...rest}) =>
            <div className="demo4-inner" style={container}>
              {Object.keys(rest).map(key =>
                <img
                  className="demo4-photo"
                  key={key}
                  src={key}
                  style={rest[key]} />
              )}
            </div>
          }
        </Spring>
      </div>
    );
  }
});

React.render(<Demo />, document.querySelector('#content'));
