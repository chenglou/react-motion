export default function createEndValueType(PropTypes) {
  return PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.object
    // coming soon
    // PropTypes.arrayOf(PropTypes.shape({
    //   key: PropTypes.any.isRequired,
    // })),
    // PropTypes.arrayOf(PropTypes.element),
  ]);
}
