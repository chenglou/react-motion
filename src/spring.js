/* @flow */
import presets from './presets';
import type {SpringConfig} from './Types';

type SpringHelperConfig = {
  stiffness?: number,
  damping?: number,
  onRest?: () => void,
  precision?: number,
};

const defaultConfig = {
  ...presets.noWobble,
  onRest: null,
  precision: 0.001,
};

export default function spring(val: number, config?: SpringHelperConfig): SpringConfig {
  return {...defaultConfig, ...config, val};
}
