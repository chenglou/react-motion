Legend:

- [I]: improvement
- [F]: fix
- [B]: fix

### Upcoming
- [F] Definitively fix the previous problem of mis-detecting React Element as object.

### 0.1.0 (July 14th 2015)
- [B] Breaking API: `TransitionSpring`'s `willEnter`'s callback signature is now `(keyThatEnters, correspondingValue, endValueYouJustSpecified, currentInterpolatedValue, currentSpeed)` (added `correspondingValue` as the second argument). Same for `willLeave`.
- [B] `Spring` is now no longer exposed as a default, but simply as "Spring": `require('react-motion').Spring`. Or `import {Spring} from 'react-motion'`.
- [B] `Spring` and `TransitionSpring`'s `children` function now expect a ReactElement. The components will no longer wrap the return value in a `div` for you. #44 #20
- [I] Move React to from dependencies to peerDependencies. #35
- [I] Internal cleanups + tests, for happier contributors.
- [F] Mis-detecting React Element as object.
- [F] Accidentally updating values at the first level of `endValue` without `{val: ...}` wrapper.

### 0.0.3 (July 9th 2015)
- [I] Initial release.
