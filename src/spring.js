import presets from './presets';

export default function spring(val, config = presets.noWobble) {
  return {val, config};
}
