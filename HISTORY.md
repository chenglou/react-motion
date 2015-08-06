Legend:

- [B]: Breaking
- [F]: Fix
- [I]: Improvement

### Upcoming
- [I] `Spring` `endValue` and `defaultValue` now support passing a simple number. You no longer have to do `endValue={{val: 10}}`.

### 0.2.7 (August 6th 2015)
- [F] Small bug where nested springs don't animate. #123
- [I] Support for all React 0.14.0 betas.

### 0.2.6 (July 31th 2015)
- [F] React-native warning's now gone, but also put into a separate file path. To require react-motion on react-native, do `require('react-motion/native')`.
- [I] Support for React 0.14.0-beta1.

### 0.2.4 (July 29th 2015)
- [I] React-native support!
- [I] Allow returning `null` from children function. #101
- [I] `defaultValue` for specifying a... default value, upon mounting.
- [I] `TransitionSpring`'s `willLeave` API got simplified and now asks for an object as a return value instead of `null`. `null` is still supported, but is deprecated and will be removed in the next version. See the new docs on it [here](https://github.com/chenglou/react-motion/blob/24d6a7284ef61268c0ead67fe43d7e40bf45d381/README.md#transitionspring-).
- [I] Exposed a few tasteful default spring configurations under the new exported `presets`.

### 0.2.2 (July 24th 2015)
- [F] Import some internal modules correctly for Ubuntu/Linux node (case-sensitive for them).
- [F] Nested springs work again.

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
