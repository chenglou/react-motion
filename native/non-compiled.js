
import React from 'react-native';
import {default as makeMotion} from '.,/lib/makeMotion';
import {default as makeStaggeredMotion} from '../lib/makeStaggeredMotion';
import {default as makeTransitionMotion} from '../lib/makeTransitionMotion';
import reorderKeys from '../lib/reorderKeys';

export const Motion = makeMotion(React);
export const StaggeredMotion = makeStaggeredMotion(React);
export const TransitionMotion = makeTransitionMotion(React);
export {default as spring} from '../lib/spring';
export {default as presets} from '../lib/presets';
export const utils = {
  reorderKeys,
};
