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
export type TransitionPlainStyles = {[key: string]: PlainStyle};
export type TransitionStyles = {[key: string]: Style};
export type TransitionVelocities = {[key: string]: Velocity};
export type WillEnter = (key: string, b: Style, c: TransitionStyles, d: TransitionPlainStyles, e: TransitionVelocities) => PlainStyle;
export type WillLeave = (key: string, b: Style, c: TransitionStyles, d: TransitionPlainStyles, e: TransitionVelocities) => ?Style;
export type TransitionMotionProps = {
  defaultStyles: TransitionPlainStyles,
  styles: TransitionStyles | (previousInterpolatedStyles: ?TransitionPlainStyles) => TransitionStyles,
  children: (interpolated: TransitionPlainStyles) => ReactElement,
  willEnter?: WillEnter,
  willLeave?: WillLeave,
};
