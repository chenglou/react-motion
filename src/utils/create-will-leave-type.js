export default function createWillLeaveType(PropTypes) {
  return PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.object,
    PropTypes.array
    // TODO: numbers? strings?
  ]);
}
