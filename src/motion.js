import { mapTree, zero } from './utils';
import invariant from 'invariant';
import React, { Component } from 'react';

export default class Motion extends Component {
  constructor(props) {
    super(props);

    invariant(this.raf, "You must implement your own 'raf(justStarted, isLastRaf)' method");

    let { endValue } = this.props;
    if (typeof endValue === 'function') {
      endValue = endValue();
    }

    this.state = {
      currV: mapTree(zero, endValue),
      currVals: endValue,
      now: null
    };
  }

  componentDidMount() {
    this.raf(true, false);
  }

  componentWillReceiveProps() {
    this.raf(true, false);
  }

  componentWillUnmount() {
    cancelAnimationFrame(this._rafID);
  }

  _rafID = null;

  render() {
    return (
      <div {...this.props}>
        {this.props.children(this.state.currVals)}
      </div>
    );
  }
}
