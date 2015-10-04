/* @flow */
const errorMargin = 0.0001;

export default function stepper(
  frameRate: number,
  x: number,
  v: number,
  destX: number,
  k: number,
  b: number): [number, number] {
  // Spring stiffness, in kg / s^2

  // for animations, destX is really spring length (spring at rest). initial
  // position is considered as the stretched/compressed position of a spring
  const Fspring = -k * (x - destX);

  // Damping, in kg / s
  const Fdamper = -b * v;

  // usually we put mass here, but for animation purposes, specifying mass is a
  // bit redundant. you could simply adjust k and b accordingly
  // let a = (Fspring + Fdamper) / mass;
  const a = Fspring + Fdamper;

  const newV = v + a * frameRate;
  const newX = x + newV * frameRate;

  if (Math.abs(newV - v) < errorMargin && Math.abs(newX - x) < errorMargin) {
    return [destX, 0];
  }

  return [newX, newV];
}
