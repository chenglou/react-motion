/* @flow */
export type SpringConfig = {
  val: number,
  stiffness: number,
  damping: number,
  precision: number,
  onRest: ?(() => void),
};

// Motion
export type Style = {[key: string]: number | SpringConfig};
export type PlainStyle = {[key: string]: number};
export type Velocity = {[key: string]: number};
export type MotionProps = {
  defaultStyle: PlainStyle,
  style: Style,
  children: (interpolated: PlainStyle) => ReactElement,
};

// StaggeredMotion
export type StaggeredPlainStyles = Array<PlainStyle>;
export type StaggeredStyles = Array<Style>;
export type StaggeredVelocities = Array<Velocity>;
export type StaggeredMotionProps = {
  defaultStyles: StaggeredPlainStyles,
  styles: (previousInterpolatedStyles: ?StaggeredPlainStyles) => StaggeredStyles,
  children: (interpolated: StaggeredPlainStyles) => ReactElement,
};

// TransitionMotion
export type TransitionPlainStyles = Array<{key: any, style: PlainStyle}>;
export type TransitionStyles = Array<{key: any, style: Style}>;
export type TransitionVelocities = Array<{key: any, style: Velocity}>;
export type WillEnter = (style: Style) => PlainStyle;
export type WillLeave = (style: Style) => ?Style;
export type TransitionMotionProps = {
  defaultStyles: TransitionPlainStyles,
  styles: TransitionStyles | (previousInterpolatedStyles: ?TransitionPlainStyles) => TransitionStyles,
  children: (interpolated: TransitionPlainStyles) => ReactElement,
  willEnter?: WillEnter,
  willLeave?: WillLeave,
};
