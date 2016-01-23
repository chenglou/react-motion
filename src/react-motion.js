/* @flow */
import React from 'react';
import makeMotion from './makeMotion';
import makeStaggeredMotion from './makeStaggeredMotion';
import makeTransitionMotion from './makeTransitionMotion';

export const Motion = makeMotion(React);
export const StaggeredMotion = makeStaggeredMotion(React);
export const TransitionMotion = makeTransitionMotion(React);
export {default as spring} from './spring';
export {default as presets} from './presets';
