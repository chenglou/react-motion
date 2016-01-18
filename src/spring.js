/* @flow */
import presets from './presets';
import type {SpringConfig} from './Types';

export default function spring(
  val: number,
  config?: [number, number] = presets.noWobble): SpringConfig {
  return {
    val,
    stiffness: config[0],
    damping: config[1],
  };
}
