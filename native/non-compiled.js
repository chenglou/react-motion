/* @flow */
import React from 'react-native';
import components from '../lib/components';
import {default as makeMotion} from '.,/lib/makeMotion';

export const Motion = makeMotion(React);
export const {Spring, TransitionSpring, StaggeredMotion, TransitionMotion} = components(React);
export {default as spring} from '../lib/spring';
export {default as presets} from '../lib/presets';
import reorderKeys from '../lib/reorderKeys';
export const utils = {
  reorderKeys,
};
