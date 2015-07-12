Legend:

- [I]: improvement
- [F]: fix
- [B]: fix

### Upcoming
- [B] `Spring` and `TransitionSpring`'s `children` function now expect a ReactElement. The components will no longer wrap the return value in a `div` for you. #44 #20
- [I] Move React to from dependencies to peerDependencies. #35
- [F] Mis-detecting React Element as object.
- [F] No more accidentally updating values at the first level of `endValue` without `{val: ...}` wrapper.

### 0.0.3 (July 9th 2015)
- [I] Initial release.
