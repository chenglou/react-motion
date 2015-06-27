'use strict';
import React from 'react';
import {mapTree, reshapeTree} from './utils';
import stepper from './stepper';

function zero() {
  return 0;
}

export default React.createClass({
  getInitialState: function() {
    let {startVal, finalVals} = this.props;
    let defaultVals = startVal || finalVals(null);
    return {
      currVals: defaultVals,
      currV: mapTree(zero, defaultVals),
    };
  },

  raf: function() {
    requestAnimationFrame(() => {
      let {currVals, currV} = this.state;
      let {finalVals, defaultNewTreeVal} = this.props;

      let destVals = finalVals(currVals);

      let patchedCurrV = reshapeTree(
        destVals,
        currV,
        // TODO: expose
        (_, val) => mapTree(zero, val),
      );
      let patchedCurrVals = reshapeTree(
        destVals,
        currVals,
        // TODO: le expose
        defaultNewTreeVal || ((_, val) => mapTree(zero, val)),
      );

      patchedCurrVals = currVals;
      patchedCurrV = currV;

      let newCurrVals = mapTree(
        // TODO: expose spring params
        (_, x, vx, destX) => stepper(x, vx, destX, 120, 16)[0],
        patchedCurrVals,
        patchedCurrV,
        destVals,
      );
      let newCurrV = mapTree(
        // TODO: expose spring params
        (_, x, vx, destX) => stepper(x, vx, destX, 120, 16)[1],
        patchedCurrVals,
        patchedCurrV,
        destVals,
      );

      this.setState(() => {
        return {
          currVals: newCurrVals,
          currV: newCurrV,
        };
      });

      this.raf();
    });
  },

  componentDidMount: function() {
    this.raf();
  },

  render: function() {
    let {currVals} = this.state;
    return (
      <div>
        {this.props.children(currVals)}
      </div>
    );
  }
});
