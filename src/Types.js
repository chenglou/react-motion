/* @flow */

// === basic reused types ===
// the opaque object returned by `spring(value, yourConfig)`
export type SpringConfig = {
  val: number,
  stiffness: number,
  damping: number,
  precision: number,
  onRest: ?(() => void),
};
// your typical style object given in props. Maps to a number or a spring config
export type Style = {[key: string]: number | SpringConfig};
// the interpolating style object, with the same keys as the above Style object,
// with the values mapped to numbers, naturally
export type PlainStyle = {[key: string]: number};
// internal velocity object. Similar to PlainStyle, but whose numbers represent
// speed. Might be exposed one day.
export type Velocity = {[key: string]: number};

// === Motion ===
export type MotionProps = {
  defaultStyle?: PlainStyle,
  style: Style,
  children: (interpolatedStyle: PlainStyle) => ReactElement,
};

// === StaggeredMotion ===
export type StaggeredProps = {
  defaultStyles?: Array<PlainStyle>,
  styles: (previousInterpolatedStyles: ?Array<PlainStyle>) => Array<Style>,
  children: (interpolatedStyles: Array<PlainStyle>) => ReactElement,
};

// === TransitionMotion ===
export type TransitionStyle = {
  key: any, // unique ID to identify component across render animations
  data?: any, // optional data you want to carry along the style, e.g. itemText
  style: Style, // actual style you're passing
};
export type TransitionPlainStyle = {
  key: any,
  data?: any,
  // same as TransitionStyle, passed to you as argument to style/children
  // function
  style: PlainStyle,
};
export type WillEnter = (style: TransitionStyle) => PlainStyle;
export type WillLeave = (style: TransitionStyle) => ?Style;

export type TransitionProps = {
  defaultStyles?: Array<TransitionPlainStyle>,
  styles: Array<TransitionStyle> | (previousInterpolatedStyles: ?Array<TransitionPlainStyle>) => Array<TransitionStyle>,
  children: (interpolatedStyles: Array<TransitionPlainStyle>) => ReactElement,
  willEnter?: WillEnter,
  willLeave?: WillLeave,
};
