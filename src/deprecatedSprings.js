let hasWarnedForSpring = {};
let hasWarnedForTransitionSpring = {};

export default function deprecatedSprings(React) {
  const Spring = React.createClass({
    componentWillMount() {
      if (process.env.NODE_ENV === 'development') {
        const ownerName =
          this._reactInternalInstance._currentElement._owner &&
          this._reactInternalInstance._currentElement._owner.getName();
        if (!hasWarnedForSpring[ownerName]) {
          hasWarnedForSpring[ownerName] = true;
          console.error(
            `Spring (used in %s's render) has now been renamed to Motion. Please
see the release note for the upgrade path. Thank you!`,
            ownerName,
          );
        }
      }
    },

    render() {
      return null;
    },
  });

  const TransitionSpring = React.createClass({
    componentWillMount() {
      if (process.env.NODE_ENV === 'development') {
        const ownerName =
          this._reactInternalInstance._currentElement._owner &&
          this._reactInternalInstance._currentElement._owner.getName();
        if (!hasWarnedForTransitionSpring[ownerName]) {
          hasWarnedForTransitionSpring[ownerName] = true;
          // TODO: check props, provide more descriptive warning.
          console.error(
            `TransitionSpring (used in %s's render) has now been renamed to
Motion. Please see the release note for the upgrade path. Thank you!`,
            ownerName,
          );
        }
      }
    },

    render() {
      return null;
    },
  });

  return {Spring, TransitionSpring};
}
