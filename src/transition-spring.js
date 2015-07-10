import { clone, createEndValueType, createWillEnterType, createWillLeaveType, FRAME_RATE, mapTree,
  mergeDiffObj, noSpeed, updateCurrV, updateCurrVals, zero } from './utils';
import Motion from './motion';
import React, { PropTypes } from 'react';

export default class TransitionSpring extends Motion {
  static propTypes = {
    endValue: createEndValueType(PropTypes).isRequired,
    willEnter: createWillEnterType(PropTypes),
    willLeave: createWillLeaveType(PropTypes)
  };

  static defaultProps = {
    willEnter: (key, endValue) => endValue[key],
    willLeave: () => null
  };

  raf(justStarted, isLastRaf) {
    if (justStarted && this._rafID !== null) {
      // already rafing
      return;
    }

    this._rafID = requestAnimationFrame(() => {
      let { currV, currVals } = this.state;
      const { now } = this.state;
      let { endValue } = this.props;
      const { willEnter, willLeave } = this.props;

      if (typeof endValue === 'function') {
        endValue = endValue(currVals);
      }

      const mergedVals = mergeDiffObj(
        currVals,
        endValue,
        key => willLeave(key, endValue, currVals, currV)
      );

      currVals = clone(currVals);
      currV = clone(currV);
      Object.keys(mergedVals)
        .filter(key => !currVals.hasOwnProperty(key))
        .forEach(key => {
          currVals[key] = willEnter(key, endValue, currVals, currV);
          currV[key] = mapTree(zero, currVals[key]);
        });

      const frameRate = now && !justStarted ? (Date.now() - now) / 1000 : FRAME_RATE;

      const newCurrVals = updateCurrVals(frameRate, currVals, currV, mergedVals);
      const newCurrV = updateCurrV(frameRate, currVals, currV, mergedVals);

      this.setState(() => {
        return {
          currV: newCurrV,
          currVals: newCurrVals,
          now: Date.now()
        };
      });

      const stop = noSpeed(newCurrV);
      if (stop && !justStarted) {
        if (isLastRaf) {
          this._rafID = null;
        } else {
          this.raf(false, true);
        }
      } else {
        this.raf(false, false);
      }
    });
  }

  render() {
    return (
      <div {...this.props}>
        {this.props.children(this.state.currVals)}
      </div>
    );
  }
}
