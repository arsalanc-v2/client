import { mount } from 'enzyme';
import { createElement } from 'preact';

import VersionInfo from '../version-info';

describe('VersionInfo', function() {
  let fakeVersionData;
  // Services
  let fakeFlash;
  // Mocked dependencies
  let fakeCopyToClipboard;

  function createComponent(props) {
    // Services
    fakeFlash = {
      info: sinon.stub(),
      error: sinon.stub(),
    };
    return mount(
      <VersionInfo flash={fakeFlash} versionData={fakeVersionData} {...props} />
    );
  }

  beforeEach(() => {
    fakeCopyToClipboard = {
      copyText: sinon.stub(),
    };
    VersionInfo.$imports.$mock({
      '../util/copy-to-clipboard': fakeCopyToClipboard,
    });

    fakeVersionData = {
      version: 'fakeVersion',
      userAgent: 'fakeUserAgent',
      url: 'fakeUrl',
      fingerprint: 'fakeFingerprint',
      account: 'fakeAccount',
      timestamp: 'fakeTimestamp',
    };
    fakeVersionData.asFormattedString = sinon.stub().returns('fakeString');
  });

  it('renders `versionData` information', () => {
    const wrapper = createComponent();
    const componentText = wrapper.text();
    assert.include(componentText, 'fakeVersion');
    assert.include(componentText, 'fakeUserAgent');
    assert.include(componentText, 'fakeUrl');
    assert.include(componentText, 'fakeFingerprint');
    assert.include(componentText, 'fakeAccount');
    assert.include(componentText, 'fakeTimestamp');
  });
  describe('copy version info to clipboard', () => {
    it('copies version info to clipboard when copy button clicked', () => {
      const wrapper = createComponent();

      wrapper.find('button').simulate('click');

      assert.calledWith(fakeCopyToClipboard.copyText, 'fakeString');
    });

    it('confirms info copy when successful', () => {
      const wrapper = createComponent();

      wrapper.find('button').simulate('click');

      assert.calledWith(fakeFlash.info, 'Copied version info to clipboard');
    });

    it('flashes an error if info copying unsuccessful', () => {
      fakeCopyToClipboard.copyText.throws();
      const wrapper = createComponent();

      wrapper.find('button').simulate('click');

      assert.calledWith(fakeFlash.error, 'Unable to copy version info');
    });
  });
});
