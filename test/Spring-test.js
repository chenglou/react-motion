describe('Spring', () => {
  const SpringInjector = require('inject!../src/Spring');
  let stepper, utils, Spring;


  beforeEach(() => {
    stepper = jasmine.createSpy('stepper');
    utils = jasmine.createSpyObj('utils', ['']);
  });


  beforeEach(() => Spring = SpringInjector({
    './stepper': stepper,
    './utils': utils,
  }));


  it('should be ok', () => {
    expect(Spring).toBeTruthy();
  });
});
