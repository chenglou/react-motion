Legend:

- [B]: Breaking
- [F]: Fix
- [I]: Improvement

### Upcoming
- [F] Import some internal modules correctly for Ubuntu/Linux node (case-sensitive for them).

### 0.2.0 (July 22th 2015)
- [B] `willLeave` returning `false` will now keep the key. Only `null` and `undefined` will serve as a signal to kill the disappeared key.
- [B] `willLeave` previously failed to expose the second argument `correspondingValueOfKeyThatJustLeft`. It's now exposed correctly.
- [F] Definitively fix the previous problem of mis-detecting React Element as object.
- [F] `willLeave` is now called only once per disappearing key. It was called more than once previously as a implementation detail. Though you should never have put side-effects in `willLeave`. It's still discouraged now.
- [F] If you have some `this.props.handlerThatSetStateAndUnmountsSpringInOwnerRender()` in `Spring`'s `endValue`, Spring's already scheduled `requestAnimationFrame` will no longer cause an extra `setState` since it's unmounted. But in general, _please_ don't put side-effect in `endValue`.
- [I] Stabilize the spring algorithm. No more erratic behavior with a big amount of animated items or tab switching (which usually slows down `requestAnimationFrame`). #57
- [I] Partial (total?) support for IE9 by using a `requestAnimationFrame` polyfill.

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
