'use strict';

import React from 'react';
import Spring, {TransitionSpring} from '../Spring';

let Demo = React.createClass({
  getInitialState: function() {
    return {
      photos: {
        './0.jpg': [500, 350],
        './1.jpg': [800, 600],
        './2.jpg': [800, 400],
        './3.jpg': [700, 500],
        './4.jpg': [200, 650],
        './5.jpg': [600, 600],
      },
      currPhoto: 0,
    };
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
    configs.container = {height, width};
    return tween(configs, 170, 26);
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
        <TransitionSpring className="demo4" values={this.getValues}>
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
        </TransitionSpring>
      </div>
    );
  }
});

React.render(<Demo />, document.querySelector('#content'));
