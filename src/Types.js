/* @flow */
export type SpringConfig = {
  val: number,
  stiffness: number,
  damping: number,
  precision: number,
  onRest?: (() => void),
};
export type Style = {
  [key: string]: number | SpringConfig,
};
export type CurrentStyle = {
  [key: string]: number,
};
export type Velocity = {
  [key: string]: number,
};
// TODO: gather all the public types here
export type TransitionStyles = {
  [key: string]: Style,
};
