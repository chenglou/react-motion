import React from 'react-native';
import components from '../lib/components';

export const {Spring, TransitionSpring, Motion, StaggeredMotion, TransitionMotion} = components(React);
export spring from '../lib/spring';
export presets from '../lib/presets';
import reorderKeys from '../lib/reorderKeys';
export const utils = {
  reorderKeys,
};
