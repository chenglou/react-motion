/* @flow */
import React from 'react';
import components from './components';
import {default as makeMotion} from './makeMotion';
import {default as makeStaggeredMotion} from './makeStaggeredMotion';
import reorderKeys from './reorderKeys';

export const Motion = makeMotion(React);
export const StaggeredMotion = makeStaggeredMotion(React);
export const {Spring, TransitionSpring, TransitionMotion} = components(React);
export {default as spring} from './spring';
export {default as presets} from './presets';
export const utils = {
  reorderKeys,
};
