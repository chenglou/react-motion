import React from 'react';
import components from './components';

export const {Spring, TransitionSpring, spring, Motion, TransitionMotion} = components(React);
export presets from './presets';
import reorderKeys from './reorderKeys';
export const utils = {
  reorderKeys,
};
