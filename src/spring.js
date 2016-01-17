/* @flow */
import presets from './presets';
import type {SpringConfig} from './Types';

export default function spring(
  val: number,
  [stiffness, damping]: [number, number] = presets.noWobble): SpringConfig {
  return {val, stiffness, damping};
}
