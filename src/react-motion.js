import React from 'react';
import components from './components';

export const {Spring, TransitionSpring, Motion, StaggeredMotion, TransitionMotion} = components(React);
export spring from './spring';
export presets from './presets';
import reorderKeys from './reorderKeys';
export const utils = {
  reorderKeys,
};
