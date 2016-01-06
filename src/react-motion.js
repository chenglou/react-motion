/* @flow */
import React from 'react';
import components from './components';
import {default as makeMotion} from './makeMotion';

export const Motion = makeMotion(React);
export const {Spring, TransitionSpring, StaggeredMotion, TransitionMotion} = components(React);
export {default as spring} from './spring';
export {default as presets} from './presets';
import reorderKeys from './reorderKeys';
export const utils = {
  reorderKeys,
};
