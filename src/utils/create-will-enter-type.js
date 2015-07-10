export default function createWillEnterType(PropTypes) {
  return PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.object,
    PropTypes.array
  ]);
}
