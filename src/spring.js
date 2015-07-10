import { createEndValueType, FRAME_RATE, noSpeed, updateCurrV, updateCurrVals } from './utils';
import Motion from './motion';
import { PropTypes } from 'react';

export default class Spring extends Motion {
  static propTypes = {
    endValue: createEndValueType(PropTypes).isRequired
  };

  raf(justStarted, isLastRaf) {
    if (justStarted && this._rafID !== null) {
      // already rafing
      return;
    }
    this._rafID = requestAnimationFrame(() => {
      const { currVals, currV, now } = this.state;
      let { endValue } = this.props;
      if (typeof endValue === 'function') {
        endValue = endValue(currVals);
      }
      const frameRate = now && !justStarted ? (Date.now() - now) / 1000 : FRAME_RATE;

      const newCurrV = updateCurrV(frameRate, currVals, currV, endValue);
      const newCurrVals = updateCurrVals(frameRate, currVals, currV, endValue);

      this.setState(() => {
        return {
          currV: newCurrV,
          currVals: newCurrVals,
          now: Date.now()
        };
      });

      const stop = noSpeed(newCurrV);
      if (stop && !justStarted) {
        // this flag is necessary, because in `endValue` callback, the user
        // might check that the current value has reached the destination, and
        // decide to return a new destination value. However, since s/he's
        // accessing the last tick's current value, and if we stop rafing after
        // speed is 0, the next `endValue` is never called and we never detect
        // the new chained animation. isLastRaf ensures that we raf a single
        // more time in case the user wants to chain another animation at the
        // end of this one
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
}
