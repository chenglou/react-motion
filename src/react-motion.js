/* @flow */
import React from 'react';
import {default as makeMotion} from './makeMotion';
import {default as makeStaggeredMotion} from './makeStaggeredMotion';
import {default as makeTransitionMotion} from './makeTransitionMotion';
import reorderKeys from './reorderKeys';

export const Motion = makeMotion(React);
export const StaggeredMotion = makeStaggeredMotion(React);
export const TransitionMotion = makeTransitionMotion(React);
export {default as spring} from './spring';
export {default as presets} from './presets';
export const utils = {
  reorderKeys,
};
