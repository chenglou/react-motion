
import React from 'react-native';
import components from '../lib/components';
import {default as makeMotion} from '.,/lib/makeMotion';
import {default as makeStaggeredMotion} from './makeStaggeredMotion';
import reorderKeys from '../lib/reorderKeys';

export const Motion = makeMotion(React);
export const StaggeredMotion = makeStaggeredMotion(React);
export const {Spring, TransitionSpring, TransitionMotion} = components(React);
export {default as spring} from '../lib/spring';
export {default as presets} from '../lib/presets';
export const utils = {
  reorderKeys,
};
