import React, {addons} from 'react/addons';
import deprecatedSprings from '../src/deprecatedSprings';

const {Spring, TransitionSpring} = deprecatedSprings(React);
const TestUtils = addons.TestUtils;

describe('Spring', () => {
  it('should warn for deprecation, once per owner', () => {
    const Wrap = React.createClass({
      render() {
        return <Spring />;
      },
    });
    spyOn(console, 'error');
    TestUtils.renderIntoDocument(<Wrap />);
    TestUtils.renderIntoDocument(<Wrap />);

    expect(console.error).toHaveBeenCalledWith(
      'Spring (used in %srender) has now been renamed to Motion. Please see the release note for the upgrade path. Thank you!',
      'Wrap\'s ',
    );
    expect(console.error.calls.count()).toBe(1);
  });

  it('should warn for deprecation, for the top level React.render', () => {
    spyOn(console, 'error');
    TestUtils.renderIntoDocument(<Spring />);
    TestUtils.renderIntoDocument(<Spring />);

    expect(console.error).toHaveBeenCalledWith(
      'Spring (used in %srender) has now been renamed to Motion. Please see the release note for the upgrade path. Thank you!',
      'React.',
    );
    expect(console.error.calls.count()).toBe(1);
  });
});

describe('TransitionSpring', () => {
  it('should warn for deprecation, once per owner', () => {
    const Wrap = React.createClass({
      render() {
        return <TransitionSpring />;
      },
    });
    spyOn(console, 'error');
    TestUtils.renderIntoDocument(<Wrap />);
    TestUtils.renderIntoDocument(<Wrap />);

    expect(console.error).toHaveBeenCalledWith(
      'TransitionSpring (used in %srender) has now been renamed to TransitionMotion. Please see the release note for the upgrade path. Thank you!',
      'Wrap\'s ',
    );
    expect(console.error.calls.count()).toBe(1);
  });

  it('should warn for deprecation, for the top level React.render', () => {
    spyOn(console, 'error');
    TestUtils.renderIntoDocument(<TransitionSpring />);
    TestUtils.renderIntoDocument(<TransitionSpring />);

    expect(console.error).toHaveBeenCalledWith(
      'TransitionSpring (used in %srender) has now been renamed to TransitionMotion. Please see the release note for the upgrade path. Thank you!',
      'React.',
    );
    expect(console.error.calls.count()).toBe(1);
  });
});
