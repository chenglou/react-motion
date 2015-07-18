/* eslint-disable react/prop-types, react/no-did-mount-set-state */
import {TransitionSpring} from '../../src/Spring';
import range from 'lodash.range';
import React from 'react';

// Visible items in the viewport
function getBounaryItemsNum(scrollTop, scrollBottom, itemHeight) {
  const first = Math.floor(scrollTop / itemHeight);
  const last = Math.ceil(scrollBottom / itemHeight);
  return [first, last];
}

const Item = React.createClass({
  render() {
    const {positionTop, number, className} = this.props;
    const transform = `translate3d(0, ${positionTop}px, 0)`;
    const style = {
      MozTransform: transform,
      WebkitTransform: transform,
      transform: transform,
    };

    return (
      <li className="item" style={style} onClick={this.handleClick}>
        <div className={'item-inside ' + className}>
          {number}
        </div>
      </li>
    );
  },
});

const Demo = React.createClass({
  getInitialState() {
    return {
      scrollTop: 0,
      viewportHeight: 0,
      alreadyAppeared: {},
      items: range(50).map(n => {
        const positionY = n * 108;
        return <Item key={n + '-slide'} positionTop={positionY} number={n} />;
      }),
    };
  },

  componentDidMount() {
    // Probably don't want to transition in items already in the viewport
    const viewportHeight = React.findDOMNode(this).clientHeight;
    const scrollTop = React.findDOMNode(this).scrollTop;
    const scrollBottom = scrollTop + viewportHeight;
    const [first, last] = getBounaryItemsNum(scrollTop, scrollBottom, 108);
    let alreadyAppeared = {};
    for (let i = first; i < last; i++) {
      alreadyAppeared[i + '-slide'] = true;
    }
    this.setState({viewportHeight, alreadyAppeared, scrollTop});
  },

  handleScroll() {
    let {viewportHeight, alreadyAppeared} = this.state;
    // Record the items present to make sure they don't transition in again the
    // next time they appear. Theoretically this is simple and can be computed
    // on the fly with nothing but the current scroll position and window
    // height, but let's make it more interesting and assume fast scrolling
    // might skip some items in-between, which we still do want to animate once
    // we scroll up to go back to them
    const scrollTop = React.findDOMNode(this).scrollTop;
    const scrollBottom = scrollTop + viewportHeight;
    const [first, last] = getBounaryItemsNum(scrollTop, scrollBottom, 108);
    for (let i = first; i < last; i++) {
      alreadyAppeared[i + '-slide'] = true;
    }
    this.setState({scrollTop, alreadyAppeared});
  },

  willEnter(key, value) {
    const {alreadyAppeared} = this.state;
    if (alreadyAppeared[key]) {
      return value;
    }
    return React.cloneElement(value, {className: 'transition-in'});
  },

  render() {
    const {items, scrollTop, viewportHeight} = this.state;
    const scrollBottom = scrollTop + viewportHeight;
    const [first, last] = getBounaryItemsNum(scrollTop, scrollBottom, 108);
    const visibleItems = items.slice(first, last + 1);

    return (
      <TransitionSpring endValue={visibleItems} willEnter={this.willEnter}>
        {currList =>
          <ul className="item-list" onScroll={this.handleScroll}>
            {currList}
          </ul>
        }
      </TransitionSpring>
    );
  },
});

export default Demo;
