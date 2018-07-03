import React from 'react';
import ReactDOM from 'react-dom';
import Demo from './Demo';
import { AppContainer } from 'react-hot-loader';

const render = Component => {
  ReactDOM.render(
    <AppContainer>
      <Component />
    </AppContainer>,
    document.querySelector('#content'),
  );
};

render(Demo);

if (module.hot) {
  module.hot.accept('./Demo.jsx', () => {
    /* eslint-disable global-require */
    const nextDemo = require('./Demo');

    render(nextDemo);
    /* eslint-enable */
  });
}
