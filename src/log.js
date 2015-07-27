/* eslint-disable no-console */

export default function l(stuffToLog = this) {
  console.log(stuffToLog);
  return this;
}
// [1, 2, 3].map(x => x + 1)::l().filter(x => x < 3)::l()
// [2, 3, 4]
// [2]
// wow wat

// <Spring endValue={...}>
//   {() =>
//     <div>
//       bla
//     </div>
//     ::log('hi')::log('keystrokes saver')
//   }
// </Spring>
