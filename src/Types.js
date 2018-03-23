/* @flow */

// Babel 5.x doesn't support type parameters, so we make this alias here out of
// Babel's sight.
/* eslint-disable spaced-comment, no-undef */
/*::
import type {Element} from 'react';
export type ReactElement = Element<*>;
*/

// === basic reused types ===
// type of the second parameter of `spring(val, config)` all fields are optional
export type SpringHelperConfig = {
  stiffness?: number,
  damping?: number,
  precision?: number,
};
// the object returned by `spring(value, yourConfig)`. For internal usage only!
export type OpaqueConfig = {
  val: number,
  stiffness: number,
  damping: number,
  precision: number,
};
// your typical style object given in props. Maps to a number or a spring config
export type Style = $Shape<{[key: string]: OpaqueConfig | number}>;
// the interpolating style object, with the same keys as the above Style object,
// with the values mapped to numbers, naturally
export type PlainStyle = $Shape<{[key: string]: number}>;
// internal velocity object. Similar to PlainStyle, but whose numbers represent
// speed. Might be exposed one day.
export type Velocity = {[key: string]: number};

// === Motion ===
export type MotionProps = {
  defaultStyle?: PlainStyle,
  style: Style,
  children: (interpolatedStyle: PlainStyle) => ReactElement,
  onRest?: () => void,
};

// === StaggeredMotion ===
export type StaggeredProps = {
  defaultStyles?: Array<PlainStyle>,
  styles: (previousInterpolatedStyles: ?Array<PlainStyle>) => Array<Style>,
  children: (interpolatedStyles: Array<PlainStyle>) => ReactElement,
};

// === TransitionMotion ===
export type TransitionStyle<T> = {
  key: string, // unique ID to identify component across render animations
  data: T, // optional data you want to carry along the style, e.g. itemText
  style: Style, // actual style you're passing
}
export type TransitionPlainStyle<T> = {
  key: string,
  data: T,
  // same as TransitionStyle, passed as argument to style/children function
  style: PlainStyle,
}
export type WillEnter<T> = (styleThatEntered: TransitionStyle<T>) => PlainStyle;
export type WillLeave<T> = (styleThatLeft: TransitionStyle<T>) => ?Style;
export type DidLeave<T> = (styleThatLeft: { key: string, data: T }) => void;

export type TransitionMotionProps<T> = {
  defaultStyles?: Array<TransitionPlainStyle<T>>,
  styles: Array<TransitionStyle<T>>| (previousInterpolatedStyles: ?Array<TransitionPlainStyle<T>>) => Array<TransitionStyle<T>>,
  children: (interpolatedStyles: Array<TransitionPlainStyle<T>>) => ReactElement,
  willEnter: WillEnter<T>,
  willLeave: WillLeave<T>,
  didLeave: DidLeave<T>
};

export type TransitionMotionDefaultProps<T> = {
  willEnter: WillEnter<T>,
  willLeave: WillLeave<T>,
  didLeave: DidLeave<T>
};

export type TransitionProps<T> = $Shape<TransitionMotionProps<T>> & $Diff<TransitionProps<T>, TransitionMotionDefaultProps<T>>;
