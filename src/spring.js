import presets from './presets';

// instead of exposing {val: bla, config: bla}, use a helper
export default function spring(val, config = presets.noWobble) {
  return {val, config};
}
