/* @flow */
import presets from './presets';

export default function spring(
  val: number,
  config = presets.noWobble): Object {
  return {val, config};
}
