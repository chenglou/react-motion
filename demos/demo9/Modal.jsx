import React from 'react';
import {TransitionSpring} from '../../src/Spring';

export default class Modal {

  static propTypes = {
    shown: React.PropTypes.bool,
	onClose: React.PropTypes.func,
    children: React.PropTypes.any,
  };

  renderModal(anim) {
    const { onClose, children } = this.props;

    return (
      <div className="full-screen-overlay" onClick={onClose} style={{ opacity: anim.opacity.val }}>
		<div className="modal" style={{ transform: `scale(${anim.scale.val})` }}>
          <button className="close-button" onClick={onClose}>X</button>
          {children}
		</div>
      </div>
	);
  }

  getEndValue() {
    return (!this.props.shown)
      ? {}
      : {
        modal: {
          scale: { val: 1, config: [1500, 40] },
          opacity: { val: 1, config: [1000, 40] },
        },
      };
  }

  willEnter() {
    return {
      scale: { val: 0.75 },
      opacity: { val: 0.5 },
    };
  }

  willLeave() {
    return {
      scale: { val: 0, config: [1000, 40] },
      opacity: { val: 0, config: [1000, 40] },
    };
  }

  render() {
    return (
      <TransitionSpring
        endValue={::this.getEndValue}
        willEnter={::this.willEnter}
        willLeave={::this.willLeave}>
        {x => <div>
          {Object.keys(x).map(key =>
            <div key={key}>{this.renderModal(x[key])}</div>
          )}
          </div>
        }
      </TransitionSpring>
    );
  }
}
