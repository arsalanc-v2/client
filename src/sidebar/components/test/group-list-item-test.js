'use strict';

const { createElement } = require('preact');
const { act } = require('preact/test-utils');

const { mount } = require('enzyme');
const GroupListItem = require('../group-list-item');

const { events } = require('../../services/analytics');

describe('GroupListItem', () => {
  let fakeAnalytics;
  let fakeGroupsService;
  let fakeStore;
  let fakeGroupListItemCommon;
  let fakeGroup;

  beforeEach(() => {
    fakeGroup = {
      id: 'groupid',
      name: 'Test',
      links: {
        html: 'https://annotate.com/groups/groupid',
      },
      scopes: {
        enforced: false,
      },
      type: 'private',
    };

    fakeStore = {
      focusGroup: sinon.stub(),
      focusedGroupId: sinon.stub().returns('groupid'),
      clearDirectLinkedIds: sinon.stub(),
      clearDirectLinkedGroupFetchFailed: sinon.stub(),
    };

    fakeAnalytics = {
      track: sinon.stub(),
      events,
    };

    fakeGroupListItemCommon = {
      orgName: sinon.stub(),
    };

    fakeGroupsService = {
      leave: sinon.stub(),
    };

    function FakeMenuItem() {
      return null;
    }
    FakeMenuItem.displayName = 'MenuItem';

    GroupListItem.$imports.$mock({
      './menu-item': FakeMenuItem,
      '../util/group-list-item-common': fakeGroupListItemCommon,
      '../store/use-store': callback => callback(fakeStore),
    });

    sinon.stub(window, 'confirm').returns(false);
  });

  afterEach(() => {
    GroupListItem.$imports.$restore();
    window.confirm.restore();
  });

  const createGroupListItem = (fakeGroup, props = {}) => {
    // nb. Mount rendering is used here with a manually mocked `MenuItem`
    // because `GroupListItem` renders multiple top-level elements (wrapped in
    // a fragment) and `wrapper.update()` cannot be used in that case when using
    // shallow rendering.
    return mount(
      <GroupListItem
        group={fakeGroup}
        groups={fakeGroupsService}
        analytics={fakeAnalytics}
        {...props}
      />
    );
  };

  it('changes the focused group when group is clicked', () => {
    const wrapper = createGroupListItem(fakeGroup);
    wrapper
      .find('MenuItem')
      .props()
      .onClick();

    assert.calledWith(fakeStore.focusGroup, fakeGroup.id);
    assert.calledWith(fakeAnalytics.track, fakeAnalytics.events.GROUP_SWITCH);
  });

  it('clears the direct linked ids from the store when the group is clicked', () => {
    const wrapper = createGroupListItem(fakeGroup);
    wrapper
      .find('MenuItem')
      .props()
      .onClick();

    assert.calledOnce(fakeStore.clearDirectLinkedIds);
  });

  it('clears the direct-linked group fetch failed from the store when the group is clicked', () => {
    const wrapper = createGroupListItem(fakeGroup);
    wrapper
      .find('MenuItem')
      .props()
      .onClick();

    assert.calledOnce(fakeStore.clearDirectLinkedGroupFetchFailed);
  });

  it('sets alt text for organization logo', () => {
    const group = {
      ...fakeGroup,
      // Dummy scheme to avoid actually trying to load image.
      logo: 'dummy://hypothes.is/logo.svg',
      organization: { name: 'org' },
    };
    fakeGroupListItemCommon.orgName
      .withArgs(group)
      .returns(group.organization.name);

    const wrapper = createGroupListItem(group);
    const altText = wrapper.find('MenuItem').prop('iconAlt');

    assert.equal(altText, group.organization.name);
  });

  describe('selected state', () => {
    [
      {
        description: 'is selected if group is the focused group',
        focusedGroupId: 'groupid',
        expectedIsSelected: true,
      },
      {
        description: 'is not selected if group is not the focused group',
        focusedGroupId: 'other',
        expectedIsSelected: false,
      },
    ].forEach(({ description, focusedGroupId, expectedIsSelected }) => {
      it(description, () => {
        fakeStore.focusedGroupId.returns(focusedGroupId);

        const wrapper = createGroupListItem(fakeGroup);

        assert.equal(
          wrapper.find('MenuItem').prop('isSelected'),
          expectedIsSelected
        );
      });
    });
  });

  it('toggles submenu when toggle is clicked', () => {
    const wrapper = createGroupListItem(fakeGroup);
    const toggleSubmenu = () => {
      const dummyEvent = new Event();
      act(() => {
        wrapper
          .find('MenuItem')
          .first()
          .props()
          .onToggleSubmenu(dummyEvent);
      });
      wrapper.update();
    };

    toggleSubmenu();
    assert.isTrue(wrapper.exists('ul'));
    toggleSubmenu();
    assert.isFalse(wrapper.exists('ul'));
  });

  it('does not show submenu toggle if there are no available actions', () => {
    fakeGroup.links.html = null;
    fakeGroup.type = 'open';
    const wrapper = createGroupListItem(fakeGroup);
    assert.isUndefined(wrapper.find('MenuItem').prop('isExpanded'));
  });

  it('does not show link to activity page if not available', () => {
    fakeGroup.links.html = null;
    const wrapper = createGroupListItem(fakeGroup, {
      defaultSubmenuOpen: true,
    });
    assert.isFalse(wrapper.exists('MenuItem[label="View group activity"]'));
  });

  it('shows link to activity page if available', () => {
    const wrapper = createGroupListItem(fakeGroup, {
      defaultSubmenuOpen: true,
    });
    assert.isTrue(wrapper.exists('MenuItem[label="View group activity"]'));
  });

  it('does not show "Leave" action if user cannot leave', () => {
    fakeGroup.type = 'open';
    const wrapper = createGroupListItem(fakeGroup, {
      defaultSubmenuOpen: true,
    });
    assert.isFalse(wrapper.exists('MenuItem[label="Leave group"]'));
  });

  it('shows "Leave" action if user can leave', () => {
    fakeGroup.type = 'private';
    const wrapper = createGroupListItem(fakeGroup, {
      defaultSubmenuOpen: true,
    });
    assert.isTrue(wrapper.exists('MenuItem[label="Leave group"]'));
  });

  it('prompts to leave group if "Leave" action is clicked', () => {
    const wrapper = createGroupListItem(fakeGroup, {
      defaultSubmenuOpen: true,
    });
    act(() => {
      wrapper
        .find('MenuItem[label="Leave group"]')
        .props()
        .onClick();
    });
    assert.called(window.confirm);
    assert.notCalled(fakeGroupsService.leave);
  });

  it('leaves group if "Leave" is clicked and user confirms', () => {
    const wrapper = createGroupListItem(fakeGroup, {
      defaultSubmenuOpen: true,
    });
    window.confirm.returns(true);
    act(() => {
      wrapper
        .find('MenuItem[label="Leave group"]')
        .props()
        .onClick();
    });
    assert.called(window.confirm);
    assert.calledWith(fakeGroupsService.leave, fakeGroup.id);
  });

  [
    {
      enforced: false,
      isScopedToUri: false,
      expectDisabled: false,
    },
    {
      enforced: true,
      isScopedToUri: false,
      expectDisabled: true,
    },
    {
      enforced: true,
      isScopedToUri: true,
      expectDisabled: false,
    },
  ].forEach(({ enforced, isScopedToUri, expectDisabled }) => {
    it('disables menu item and shows note in submenu if group is not selectable', () => {
      fakeGroup.scopes.enforced = enforced;
      fakeGroup.isScopedToUri = isScopedToUri;
      const wrapper = createGroupListItem(fakeGroup, {
        defaultSubmenuOpen: true,
      });
      assert.equal(
        wrapper
          .find('MenuItem')
          .first()
          .prop('isDisabled'),
        expectDisabled
      );
      assert.equal(wrapper.exists('.group-list-item__footer'), expectDisabled);
    });
  });
});
