/* @flow */
import presets from './presets';
import type {OpaqueConfig, SpringHelperConfig} from './Types';

const defaultConfig = {
  ...presets.noWobble,
  precision: 0.01,
};

export default function spring(val: number, config?: SpringHelperConfig): OpaqueConfig {
  return {...defaultConfig, ...config, val};
}
