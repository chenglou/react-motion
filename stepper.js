let frameRate = 1 / 60;
let errorMargin = 0.001;

function stepper(x, v, destX, k, b) {
  // Spring stiffness, in kg / s^2

  // for animations, destX is really spring length (spring at rest). initial
  // position is considered as the stretched/compressed posiiton of a spring
  let Fspring = -k * (x - destX);

  // Damping constant, in kg / s
  let Fdamper = -b * v;

  // usually we put mass here, but for animation purposes, specifying mass is a
  // bit redundant. you could simply adjust k and b accordingly
  // let a = (Fspring + Fdamper) / mass;
  let a = Fspring + Fdamper;

  let newX = x + v * frameRate;
  let newV = v + a * frameRate;

  if (Math.abs(newV - v) < errorMargin && Math.abs(newX - x) < errorMargin) {
    return [destX, 0];
  }

  return [newX, newV];
}

module.exports = stepper;
