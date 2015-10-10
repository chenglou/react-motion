/* @flow */

export type Style = Object;
export type Velocity = {
  [key: string]: number,
};
export type SpringConfig = {
  val: number,
  config: [number, number],
};
export type TransitionStyles = {
  [key: string]: Style,
};
