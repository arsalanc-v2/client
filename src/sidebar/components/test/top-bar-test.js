import { createElement } from 'preact';
import { mount } from 'enzyme';

import * as uiConstants from '../../ui-constants';
import * as bridgeEvents from '../../../shared/bridge-events';
import TopBar from '../top-bar';
import mockImportedComponents from './mock-imported-components';

describe('TopBar', () => {
  const fakeSettings = {};
  let fakeBridge;
  let fakeStore;
  let fakeStreamer;
  let fakeIsThirdPartyService;
  let fakeServiceConfig;

  beforeEach(() => {
    fakeIsThirdPartyService = sinon.stub().returns(false);

    fakeStore = {
      filterQuery: sinon.stub().returns(null),
      getState: sinon.stub().returns({
        sidebarPanels: {
          activePanelName: null,
        },
      }),
      pendingUpdateCount: sinon.stub().returns(0),
      setFilterQuery: sinon.stub(),
      toggleSidebarPanel: sinon.stub(),
    };

    fakeBridge = {
      call: sinon.stub(),
    };

    fakeServiceConfig = sinon.stub().returns({});

    fakeStreamer = {
      applyPendingUpdates: sinon.stub(),
    };

    TopBar.$imports.$mock(mockImportedComponents());
    TopBar.$imports.$mock({
      '../store/use-store': callback => callback(fakeStore),
      '../util/is-third-party-service': fakeIsThirdPartyService,
      '../service-config': fakeServiceConfig,
    });
  });

  afterEach(() => {
    TopBar.$imports.$restore();
  });

  // Helper to retrieve an `Button` by icon name, for convenience
  function getButton(wrapper, iconName) {
    return wrapper.find('Button').filter({ icon: iconName });
  }

  function createTopBar(props = {}) {
    const auth = { status: 'unknown' };
    return mount(
      <TopBar
        auth={auth}
        bridge={fakeBridge}
        isSidebar={true}
        settings={fakeSettings}
        streamer={fakeStreamer}
        {...props}
      />
    );
  }

  it('shows the pending update count', () => {
    fakeStore.pendingUpdateCount.returns(1);
    const wrapper = createTopBar();
    const applyBtn = getButton(wrapper, 'refresh');
    assert.isTrue(applyBtn.exists());
  });

  it('does not show the pending update count when there are no updates', () => {
    const wrapper = createTopBar();
    const applyBtn = getButton(wrapper, 'refresh');
    assert.isFalse(applyBtn.exists());
  });

  it('applies updates when clicked', () => {
    fakeStore.pendingUpdateCount.returns(1);
    const wrapper = createTopBar();
    const applyBtn = getButton(wrapper, 'refresh');

    applyBtn.props().onClick();

    assert.called(fakeStreamer.applyPendingUpdates);
  });

  describe('`HelpButton` and help requests', () => {
    context('no help service handler configured in services (default)', () => {
      it('toggles Help Panel on click', () => {
        const wrapper = createTopBar();
        const helpButton = getButton(wrapper, 'help');

        helpButton.props().onClick();

        assert.calledWith(fakeStore.toggleSidebarPanel, uiConstants.PANEL_HELP);
      });

      it('displays a help icon active state when help panel active', () => {
        // state returning active sidebar panel as `PANEL_HELP` triggers active class
        fakeStore.getState = sinon.stub().returns({
          sidebarPanels: {
            activePanelName: uiConstants.PANEL_HELP,
          },
        });
        const wrapper = createTopBar();
        const helpButton = getButton(wrapper, 'help');

        wrapper.update();

        assert.isTrue(helpButton.props().isActive);
      });

      context('help service handler configured in services', () => {
        it('fires a bridge event if help clicked and service is configured', () => {
          fakeServiceConfig.returns({ onHelpRequestProvided: true });
          const wrapper = createTopBar();

          const helpButton = getButton(wrapper, 'help');

          helpButton.props().onClick();

          assert.equal(fakeStore.toggleSidebarPanel.callCount, 0);
          assert.calledWith(fakeBridge.call, bridgeEvents.HELP_REQUESTED);
        });
      });
    });
  });

  describe('login/account actions', () => {
    const getLoginText = wrapper => wrapper.find('.top-bar__login-links');

    it('Shows ellipsis when login state is unknown', () => {
      const wrapper = createTopBar({ auth: { status: 'unknown' } });
      const loginText = getLoginText(wrapper);
      assert.isTrue(loginText.exists());
      assert.equal(loginText.text(), '⋯');
    });

    it('Shows "Log in" and "Sign up" links when user is logged out', () => {
      const onLogin = sinon.stub();
      const onSignUp = sinon.stub();

      const wrapper = createTopBar({
        auth: { status: 'logged-out' },
        onLogin,
        onSignUp,
      });
      const loginText = getLoginText(wrapper);
      const links = loginText.find('a');
      assert.equal(links.length, 2);

      assert.equal(links.at(0).text(), 'Sign up');
      links.at(0).simulate('click');
      assert.called(onSignUp);

      assert.equal(links.at(1).text(), 'Log in');
      links.at(1).simulate('click');
      assert.called(onLogin);
    });

    it('Shows user menu when logged in', () => {
      const onLogout = sinon.stub();
      const auth = { status: 'logged-in' };
      const wrapper = createTopBar({ auth, onLogout });
      assert.isFalse(getLoginText(wrapper).exists());

      const userMenu = wrapper.find('UserMenu');
      assert.isTrue(userMenu.exists());
      assert.include(userMenu.props(), { auth, onLogout });
    });
  });

  it("checks whether we're using a third-party service", () => {
    createTopBar();

    assert.called(fakeIsThirdPartyService);
    assert.alwaysCalledWithExactly(fakeIsThirdPartyService, fakeSettings);
  });

  context('when using a first-party service', () => {
    it('shows the share annotations button', () => {
      const wrapper = createTopBar();
      assert.isTrue(wrapper.exists('[title="Share annotations on this page"]'));
    });
  });

  context('when using a third-party service', () => {
    beforeEach(() => {
      fakeIsThirdPartyService.returns(true);
    });

    it("doesn't show the share annotations button", () => {
      const wrapper = createTopBar();
      assert.isFalse(
        wrapper.exists('[title="Share annotations on this page"]')
      );
    });
  });

  it('toggles the share annotations panel when "Share" is clicked', () => {
    const wrapper = createTopBar();
    const shareButton = getButton(wrapper, 'share');

    shareButton.props().onClick();

    assert.calledWith(
      fakeStore.toggleSidebarPanel,
      uiConstants.PANEL_SHARE_ANNOTATIONS
    );
  });

  it('adds an active-state class to the "Share" icon when the panel is open', () => {
    fakeStore.getState.returns({
      sidebarPanels: {
        activePanelName: uiConstants.PANEL_SHARE_ANNOTATIONS,
      },
    });
    const wrapper = createTopBar();
    const shareButton = getButton(wrapper, 'share');

    assert.isTrue(shareButton.prop('isActive'));
  });

  it('displays search input in the sidebar', () => {
    fakeStore.filterQuery.returns('test-query');
    const wrapper = createTopBar();
    assert.equal(wrapper.find('SearchInput').prop('query'), 'test-query');
  });

  it('updates current filter when changing search query in the sidebar', () => {
    const wrapper = createTopBar();
    wrapper.find('SearchInput').prop('onSearch')('new-query');
    assert.calledWith(fakeStore.setFilterQuery, 'new-query');
  });

  it('displays search input in the single annotation view / stream', () => {
    const wrapper = createTopBar({ isSidebar: false });
    const searchInput = wrapper.find('StreamSearchInput');
    assert.ok(searchInput.exists());
  });

  it('shows the clean theme when settings contains the clean theme option', () => {
    fakeSettings.theme = 'clean';
    const wrapper = createTopBar();
    assert.isTrue(wrapper.exists('.top-bar--theme-clean'));
  });

  context('in the stream and single annotation pages', () => {
    it('does not render the group list, sort menu or share menu', () => {
      const wrapper = createTopBar({ isSidebar: false });
      assert.isFalse(wrapper.exists('GroupList'));
      assert.isFalse(wrapper.exists('SortMenu'));
      assert.isFalse(wrapper.exists('button[title="Share this page"]'));
    });
  });
});
