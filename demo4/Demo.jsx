import React from 'react';
import {TransitionSpring} from '../Spring';

let Demo = React.createClass({
  getInitialState() {
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

  handleChange({target: {value}}) {
    let {currPhoto, photos} = this.state;
    this.setState({currPhoto: value});
    if (parseInt(value) === Object.keys(photos).length - 1) {
      let w = Math.floor(Math.random() * 500 + 200);
      let h = Math.floor(Math.random() * 500 + 200);
      let hash = (Math.random() + '').slice(3);
      this.setState({
        photos: {
          ...photos,
          // What the hell are you doing chenglou?

          // I'm loading pictures on the fly and using the default
          // transitionless (!) `willEnter` to place the picture on the page.
          // essentially, I'm abusing the diffing/merging algorithm to animate
          // from one (more or less) arbitrary data structure to another, and It
          // Just Works.
          [`http://lorempixel.com/${w}/${h}/sports/a${hash}`]: [w, h],
        },
      });
    }
  },

  getValues() {
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
        val: {
          left: prevLeft,
          height: height,
          width: height / origH * origW,
        },
        config: [170, 26],
      };
      return prevLeft + widths[i];
    }, offset);
    configs.container = {val: {height, width}};
    return configs;
  },

  render() {
    let {photos, currPhoto} = this.state;
    return (
      <div>
        <div>When you scroll to the end, wait for the images to load.</div>
        <input
          type="range"
          min={0}
          max={Object.keys(photos).length - 1}
          value={currPhoto}
          onChange={this.handleChange} />
        {currPhoto}
        <TransitionSpring endValue={this.getValues}>
          {({container, ...rest}) =>
            <div className="demo4">
              <div className="demo4-inner" style={container.val}>
                {Object.keys(rest).map((key) =>
                  <img
                    className="demo4-photo"
                    key={key}
                    src={key}
                    style={rest[key].val} />
                )}
              </div>
            </div>
          }
        </TransitionSpring>
      </div>
    );
  }
});

export default Demo;
