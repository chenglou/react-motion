import React from 'react-native';
import components from '../lib/components';

export const {Spring, TransitionSpring, Motion, TransitionMotion} = components(React);
export spring from './spring';
export presets from '../lib/presets';
import reorderKeys from '../lib/reorderKeys';
export const utils = {
  reorderKeys,
};
