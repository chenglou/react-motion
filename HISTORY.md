Legend:
- [B]: Breaking
- [F]: Fix
- [I]: Improvement

### 0.5.1 (August 28th 2017)
- [F] New flow definitions, fixes children typing.

### 0.5.0 (April 26th 2017)
- [B] Dropping support for older React. Currently supported versions are `^0.14.9` || `^15.3.0`
- [I] Upgraded all React components to use ES6 classes
- [I] Replace React.PropTypes with prop-types package

### 0.4.8 (April 17th 2017)

- [I] Externalize stripStyle #452 by @bearcott
- [I] Migrated deprecated React.PropTypes and React.createClass #446 by @Andarist
- [F] Fix link to TypeScript types #443 by @pshrmn
- [F] Refactored demo and fixed flow check errors #435 by @therewillbecode
- [F] Fix broken link #430 by @codler
- [F] Unmounted component setState fix #420 by @alleycat-at-git

### 0.4.7 (December 15th 2016)
- [I] `didLeave` for `TransitionMotion`! Please check the README for more.

### 0.4.4 (June 4th 2016)
- [F] Small fix to component unmounting bug (https://github.com/chenglou/react-motion/commit/49ea396041b0031b95f4941cc7efce200fcca454). It's not clear why this is erroring, but people want the temp fix.

### 0.4.3 (April 19th 2016)
- [F] `TransitionMotion` `styles` function not being passed `defaultStyles` value upon first call. #296
- [I] `onRest` callback for `Motion`!

### 0.4.2 (January 30th 2016)
- [F] `TransitionMotion` keys merging bug. #264
- [F] `TransitionMotion` rare stale read bug. [https://github.com/chenglou/react-motion/commit/f20dc1b9c8de7b387927b24afdb73e0a5ea0d0a6](https://github.com/chenglou/react-motion/commit/f20dc1b9c8de7b387927b24afdb73e0a5ea0d0a6)

### 0.4.1 (January 26th 2016)
- [F] Made a mistake while publishing the bower package; fixed.

### 0.4.0 (January 26th 2016)
- [B] `spring` helper's format has changed from `spring(10, [120, 12])` to `spring(10, {stiffness: 120, damping: 12})`.
- [B] `style`, `styles` and `styles` of the three respective components now only accept either a number to interpolate, or a `spring` configuration to interpolate. Previously, it accepted (and ignored) random key/value pairs mixed in, such as `{x: spring(0), y: 'helloWorld'}`. `y` Doesn't belong there and should be placed elsewhere, e.g. directly on the (actual react) style of the component you're assigning the interpolating values on.
- [B] `TransitionMotion` got an all-around clearer API. See the [upgrade guide](https://github.com/chenglou/react-motion/wiki) and [README section](https://github.com/chenglou/react-motion/blob/9877c311cc4a22099eb56fe7c76bad9753519ddb/README.md#transitionmotion-) for more.
- [B] `Motion`'s' `defaultStyle`, informally accepted the format `{x: spring(0)}`. This is now officially unsupported. The correct format has always been `{x: 0}`. Setting a default style of `{x: spring(whatever)}` did not make sense; the configuration only applies for a `style`, aka destination value. Same modification applies to `StaggeredMotion` and `TransitionMotion`'s `defaultStyles` & `willEnter`.
- [B] `TransitionMotion`'s `willEnter`/`willLeave`'s signature has changed.
- [B] The `reorderKeys` helper is no longer needed thanks to the changes to `TransitionMotion`. It's now removed.
- [B] React-Native specific build gone. RN 0.18+ uses the vanilla Npm React package, so there's no more need for us to export a wrapper.
- [F] Bunch of bugs gone: #225, #212, #179, #157, #90, #88.
- [I] `spring` has acquired a new field as part of the new signature: [precision tuning](https://github.com/chenglou/react-motion/blob/9877c311cc4a22099eb56fe7c76bad9753519ddb/README.md#--spring-val-number-config-springhelperconfig--opaqueconfig)!
- [I] [Fully typed](https://github.com/chenglou/react-motion/blob/05d76f5ec7e9722dbca0237a97c41267e297eb2c/src/Types.js) via [Flow types](http://flowtype.org).
- [I] Performance improvements.

### 0.3.1 (October 14th 2015)
- [F] Handle `null` and `undefined` in `style`/`styles`. #181
- [I] Library's now partially annotated with [Flow](http://flowtype.org).
- [I] Related to above, the `src/` folder is now exposed on npm so that you can take advantage of Flow by using: `import {Motion} from 'react-motion/src/react-motion'` directly, instead of the old, prebuilt `import {Motion} from 'react-motion'`. **This is experimental** and intentionally undocumented. You'll have to adjust your webpack/browserify configurations to require these original source files correctly. No harm trying of course. It's just some type annotations =).

### 0.3.0 (September 30th 2015)
- [B] API revamp! See [https://github.com/chenglou/react-motion/wiki](https://github.com/chenglou/react-motion/wiki) for more details. Thanks!

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
