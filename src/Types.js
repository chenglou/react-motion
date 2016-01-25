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
  defaultStyle?: PlainStyle,
  style: Style,
  children: (interpolated: PlainStyle) => ReactElement,
};

// StaggeredMotion
export type StaggeredPlainStyles = Array<PlainStyle>;
export type StaggeredStyles = Array<Style>;
export type StaggeredVelocities = Array<Velocity>;

export type StaggeredProps = {
  defaultStyles?: StaggeredPlainStyles,
  styles: (previousInterpolatedStyles: ?StaggeredPlainStyles) => StaggeredStyles,
  children: (interpolated: StaggeredPlainStyles) => ReactElement,
};

// === TransitionMotion ===
export type TransitionPlainStyle = {key: any, style: PlainStyle};
export type TransitionStyle = {key: any, style: Style};
export type WillEnter = (style: TransitionStyle) => PlainStyle;
export type WillLeave = (style: TransitionStyle) => ?Style;

export type TransitionProps = {
  defaultStyles?: Array<TransitionPlainStyle>,
  styles: Array<TransitionStyle> | (previousInterpolatedStyles: ?Array<TransitionPlainStyle>) => Array<TransitionStyle>,
  children: (interpolatedStyles: Array<TransitionPlainStyle>) => ReactElement,
  willEnter?: WillEnter,
  willLeave?: WillLeave,
};
