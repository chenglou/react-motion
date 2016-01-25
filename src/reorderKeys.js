/* @flow */

let hasWarned = false;
export default function reorderKeys() {
  if (process.env.NODE_ENV === 'development') {
    if (!hasWarned) {
      hasWarned = true;
      console.error(
        '`reorderKeys` has been removed, since it is no longer needed for TransitionMotion\'s new styles array API.'
      );
    }
  }
}
