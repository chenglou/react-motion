import React from 'react';
import {TransitionMotion, spring} from '../../src/react-motion';

const Demo = React.createClass({
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
    const {photos} = this.state;
    this.setState({currPhoto: value});
    if (parseInt(value, 10) === Object.keys(photos).length - 1) {
      const w = Math.floor(Math.random() * 500 + 200);
      const h = Math.floor(Math.random() * 500 + 200);
      const hash = (Math.random() + '').slice(3);
      this.setState({
        photos: {
          ...photos,
          // Loading pictures on the fly and using the default transitionless
          // (!) `willEnter` to place the picture on the page. essentially, I'm
          // abusing the diffing/merging algorithm to animate from one (more or
          // less) arbitrary data structure to another, and It Just Works.
          [`http://lorempixel.com/${w}/${h}/sports/a${hash}`]: [w, h],
        },
      });
    }
  },

  getStyles() {
    const {photos, currPhoto} = this.state;
    const keys = Object.keys(photos);
    const currKey = keys[currPhoto];
    const [width, height] = photos[currKey];
    const widths = keys.map(key => {
      const [origW, origH] = photos[key];
      return height / origH * origW;
    });
    let offset = 0;
    for (let i = 0; i < widths.length; i++) {
      if (keys[i] === currKey) {
        break;
      }
      offset -= widths[i];
    }
    const configs = {};
    keys.reduce((prevLeft, key, i) => {
      const [origW, origH] = photos[key];
      configs[key] = {
        left: spring(prevLeft, [170, 26]),
        height: spring(height, [170, 26]),
        width: spring(height / origH * origW, [170, 26]),
      };
      return prevLeft + widths[i];
    }, offset);
    configs.container = {height: spring(height), width: spring(width)};

    return configs;
  },

  render() {
    const {photos, currPhoto} = this.state;
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
        <TransitionMotion styles={this.getStyles()}>
          {({container, ...rest}) =>
            <div className="demo4">
              <div className="demo4-inner" style={container}>
                {Object.keys(rest).map((key) =>
                  <img
                    className="demo4-photo"
                    key={key}
                    src={key}
                    style={rest[key]} />
                )}
              </div>
            </div>
          }
        </TransitionMotion>
      </div>
    );
  },
});

export default Demo;
