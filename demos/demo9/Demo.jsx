import React from 'react';
import Modal from './Modal';

const Demo = React.createClass({
  getInitialState() {
    return {modalShown: false};
  },

  openModal() {
    this.setState({modalShown: true});
  },

  closeModal() {
    this.setState({modalShown: false});
  },

  render() {
    return (
      <div>
        <button onClick={this.openModal}>Open</button>
        <Modal shown={this.state.modalShown} onClose={this.closeModal}>
            React Motion Rocks!
        </Modal>
      </div>
    );
  },
});

export default Demo;
