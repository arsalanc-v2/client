import * as annotations from '../annotations';
import createStore from '../../create-store';
import * as selection from '../selection';
import * as uiConstants from '../../../ui-constants';

describe('sidebar/store/modules/selection', () => {
  let store;
  let fakeSettings = [{}, {}];

  const getSelectionState = () => {
    return store.getState().selection;
  };

  beforeEach(() => {
    store = createStore([annotations, selection], fakeSettings);
  });

  describe('getFirstSelectedAnnotationId', function() {
    it('returns the first selected annotation id it finds', function() {
      store.selectAnnotations([1, 2]);
      assert.equal(store.getFirstSelectedAnnotationId(), 1);
    });

    it('returns null if no selected annotation ids are found', function() {
      store.selectAnnotations([]);
      assert.isNull(store.getFirstSelectedAnnotationId());
    });
  });

  describe('setForceVisible()', function() {
    it('sets the visibility of the annotation', function() {
      store.setForceVisible('id1', true);
      assert.deepEqual(getSelectionState().forceVisible, { id1: true });
    });
  });

  describe('setCollapsed()', function() {
    it('sets the expanded state of the annotation', function() {
      store.setCollapsed('parent_id', false);
      assert.deepEqual(getSelectionState().expanded, { parent_id: true });
    });
  });

  describe('focusAnnotations()', function() {
    it('adds the passed annotations to the focusedAnnotationMap', function() {
      store.focusAnnotations([1, 2, 3]);
      assert.deepEqual(getSelectionState().focusedAnnotationMap, {
        1: true,
        2: true,
        3: true,
      });
    });

    it('replaces any annotations originally in the map', function() {
      store.focusAnnotations([1]);
      store.focusAnnotations([2, 3]);
      assert.deepEqual(getSelectionState().focusedAnnotationMap, {
        2: true,
        3: true,
      });
    });

    it('nulls the map if no annotations are focused', function() {
      store.focusAnnotations([1]);
      store.focusAnnotations([]);
      assert.isNull(getSelectionState().focusedAnnotationMap);
    });
  });

  describe('hasSelectedAnnotations', function() {
    it('returns true if there are any selected annotations', function() {
      store.selectAnnotations([1]);
      assert.isTrue(store.hasSelectedAnnotations());
    });

    it('returns false if there are no selected annotations', function() {
      assert.isFalse(store.hasSelectedAnnotations());
    });
  });

  describe('filterQuery', function() {
    it('returns the filterQuery value when provided', function() {
      store.setFilterQuery('tag:foo');
      assert.equal(store.filterQuery(), 'tag:foo');
    });

    it('returns null when no filterQuery is present', function() {
      assert.isNull(store.filterQuery());
    });
  });

  describe('isAnnotationSelected', function() {
    it('returns true if the id provided is selected', function() {
      store.selectAnnotations([1]);
      assert.isTrue(store.isAnnotationSelected(1));
    });

    it('returns false if the id provided is not selected', function() {
      store.selectAnnotations([1]);
      assert.isFalse(store.isAnnotationSelected(2));
    });

    it('returns false if there are no selected annotations', function() {
      assert.isFalse(store.isAnnotationSelected(1));
    });
  });

  describe('selectAnnotations()', function() {
    it('adds the passed annotations to the selectedAnnotationMap', function() {
      store.selectAnnotations([1, 2, 3]);
      assert.deepEqual(getSelectionState().selectedAnnotationMap, {
        1: true,
        2: true,
        3: true,
      });
    });

    it('replaces any annotations originally in the map', function() {
      store.selectAnnotations([1]);
      store.selectAnnotations([2, 3]);
      assert.deepEqual(getSelectionState().selectedAnnotationMap, {
        2: true,
        3: true,
      });
    });

    it('nulls the map if no annotations are selected', function() {
      store.selectAnnotations([1]);
      store.selectAnnotations([]);
      assert.isNull(getSelectionState().selectedAnnotationMap);
    });
  });

  describe('toggleSelectedAnnotations()', function() {
    it('adds annotations missing from the selectedAnnotationMap', function() {
      store.selectAnnotations([1, 2]);
      store.toggleSelectedAnnotations([3, 4]);
      assert.deepEqual(getSelectionState().selectedAnnotationMap, {
        1: true,
        2: true,
        3: true,
        4: true,
      });
    });

    it('removes annotations already in the selectedAnnotationMap', function() {
      store.selectAnnotations([1, 3]);
      store.toggleSelectedAnnotations([1, 2]);
      assert.deepEqual(getSelectionState().selectedAnnotationMap, {
        2: true,
        3: true,
      });
    });

    it('nulls the map if no annotations are selected', function() {
      store.selectAnnotations([1]);
      store.toggleSelectedAnnotations([1]);
      assert.isNull(getSelectionState().selectedAnnotationMap);
    });
  });

  describe('#REMOVE_ANNOTATIONS', function() {
    it('removing an annotation should also remove it from selectedAnnotationMap', function() {
      store.selectAnnotations([1, 2, 3]);
      store.removeAnnotations([{ id: 2 }]);
      assert.deepEqual(getSelectionState().selectedAnnotationMap, {
        1: true,
        3: true,
      });
    });
  });

  describe('clearSelectedAnnotations()', function() {
    it('removes all annotations from the selection', function() {
      store.selectAnnotations([1]);
      store.clearSelectedAnnotations();
      assert.isNull(getSelectionState().selectedAnnotationMap);
    });

    it('clears the current search query', function() {
      store.setFilterQuery('foo');
      store.clearSelectedAnnotations();
      assert.isNull(getSelectionState().filterQuery);
    });
  });

  describe('setFilterQuery()', function() {
    it('sets the filter query', function() {
      store.setFilterQuery('a-query');
      assert.equal(getSelectionState().filterQuery, 'a-query');
    });

    it('resets the force-visible and expanded sets', function() {
      store.setForceVisible('123', true);
      store.setCollapsed('456', false);
      store.setFilterQuery('some-query');
      assert.deepEqual(getSelectionState().forceVisible, {});
      assert.deepEqual(getSelectionState().expanded, {});
    });
  });

  describe('changeFocusModeUser()', function() {
    it('sets the focused user and enables focus mode', function() {
      store.setFocusModeFocused(false);
      store.changeFocusModeUser({
        username: 'testuser',
        displayName: 'Test User',
      });
      assert.equal(store.focusModeUserId(), 'testuser');
      assert.equal(store.focusModeUserPrettyName(), 'Test User');
      assert.equal(store.focusModeFocused(), true);
      assert.equal(store.focusModeEnabled(), true);
    });

    // When the LMS app wants the client to disable focus mode it sends a
    // changeFocusModeUser() RPC call with {username: undefined, displayName:
    // undefined}:
    //
    // https://github.com/hypothesis/lms/blob/d6b88fd7e375a4b23899117556b3e39cfe18986b/lms/static/scripts/frontend_apps/components/LMSGrader.js#L46
    //
    // This is the LMS app's way of asking the client to disable focus mode.
    it('disables focus mode if username is undefined', function() {
      store.setFocusModeFocused(true);
      store.changeFocusModeUser({
        username: undefined,
        displayName: undefined,
      });
      assert.equal(store.focusModeFocused(), false);
      assert.equal(store.focusModeEnabled(), false);
    });
  });

  describe('setFocusModeFocused()', function() {
    it('sets the focus mode to enabled', function() {
      store.setFocusModeFocused(true);
      assert.equal(getSelectionState().focusMode.focused, true);
    });

    it('sets the focus mode to not enabled', function() {
      store = createStore([selection], [{ focus: { user: {} } }]);
      store.setFocusModeFocused(false);
      assert.equal(getSelectionState().focusMode.focused, false);
    });
  });

  describe('focusModeEnabled()', function() {
    it('should be true when the focus setting is present', function() {
      store = createStore([selection], [{ focus: { user: {} } }]);
      assert.equal(store.focusModeEnabled(), true);
    });
    it('should be false when the focus setting is not present', function() {
      assert.equal(store.focusModeEnabled(), false);
    });
  });

  describe('focusModeFocused()', function() {
    it('should return true by default when focus mode is enabled', function() {
      store = createStore([selection], [{ focus: { user: {} } }]);
      assert.equal(getSelectionState().focusMode.enabled, true);
      assert.equal(getSelectionState().focusMode.focused, true);
      assert.equal(store.focusModeFocused(), true);
    });
    it('should return false by default when focus mode is not enabled', function() {
      assert.equal(getSelectionState().focusMode.enabled, false);
      assert.equal(getSelectionState().focusMode.focused, true);
      assert.equal(store.focusModeFocused(), false);
    });
  });

  describe('focusModeHasUser()', () => {
    it('should return `true` if focus enabled and valid `user` object present', () => {
      store = createStore(
        [selection],
        [{ focus: { user: { userid: 'acct:userid@authority' } } }]
      );
      assert.isTrue(store.focusModeHasUser());
    });
    it('should return `false` if focus enabled but `user` object invalid', () => {
      store = createStore(
        [selection],
        [{ focus: { user: { displayName: 'FakeDisplayName' } } }] // `userid` is required
      );
      assert.isFalse(store.focusModeHasUser());
    });
    it('should return `false` if `user` object missing', () => {
      store = createStore([selection], [{ focus: {} }]);
      assert.isFalse(store.focusModeHasUser());
    });
  });

  describe('focusModeUserPrettyName()', function() {
    it('returns false by default when focus mode is not enabled', function() {
      store = createStore(
        [selection],
        [{ focus: { user: { displayName: 'FakeDisplayName' } } }]
      );
      assert.equal(store.focusModeUserPrettyName(), 'FakeDisplayName');
    });
    it('returns the userid when displayName is missing', function() {
      store = createStore(
        [selection],
        [{ focus: { user: { userid: 'acct:userid@authority' } } }]
      );
      assert.equal(store.focusModeUserPrettyName(), 'acct:userid@authority');
    });
    it('returns an empty string when user object has is empty', function() {
      store = createStore([selection], [{ focus: { user: {} } }]);
      assert.equal(store.focusModeUserPrettyName(), '');
    });
    it('return an empty string when there is no focus object', function() {
      assert.equal(store.focusModeUserPrettyName(), '');
    });
    it('returns the username when displayName and userid is missing', function() {
      // remove once LMS no longer sends username in RPC or config
      // https://github.com/hypothesis/client/issues/1516
      store = createStore(
        [selection],
        [{ focus: { user: { username: 'fake_user_name' } } }]
      );
      assert.equal(store.focusModeUserPrettyName(), 'fake_user_name');
    });
  });

  describe('focusModeUserId()', function() {
    it('should return the userid when present', function() {
      store = createStore(
        [selection],
        [{ focus: { user: { userid: 'acct:userid@authority' } } }]
      );
      assert.equal(store.focusModeUserId(), 'acct:userid@authority');
    });
    it('should return null when the userid is not present', function() {
      store = createStore([selection], [{ focus: { user: {} } }]);
      assert.isNull(store.focusModeUserId());
    });
    it('should return null when the user object is not present', function() {
      assert.isNull(store.focusModeUserId());
    });
    it('should return the username when present but no userid', function() {
      // remove once LMS no longer sends username in RPC or config
      // https://github.com/hypothesis/client/issues/1516
      store = createStore(
        [selection],
        [{ focus: { user: { username: 'fake_user_name' } } }]
      );
      assert.equal(store.focusModeUserId(), 'fake_user_name');
    });
  });

  describe('highlightAnnotations()', function() {
    it('sets the highlighted annotations', function() {
      store.highlightAnnotations(['id1', 'id2']);
      assert.deepEqual(getSelectionState().highlighted, ['id1', 'id2']);
    });
  });

  describe('selectTab()', function() {
    it('sets the selected tab', function() {
      store.selectTab(uiConstants.TAB_ANNOTATIONS);
      assert.equal(
        getSelectionState().selectedTab,
        uiConstants.TAB_ANNOTATIONS
      );
    });

    it('ignores junk tag names', function() {
      store.selectTab('flibbertigibbert');
      assert.equal(
        getSelectionState().selectedTab,
        uiConstants.TAB_ANNOTATIONS
      );
    });

    it('allows sorting annotations by time and document location', function() {
      store.selectTab(uiConstants.TAB_ANNOTATIONS);
      assert.deepEqual(getSelectionState().sortKeysAvailable, [
        'Newest',
        'Oldest',
        'Location',
      ]);
    });

    it('allows sorting page notes by time', function() {
      store.selectTab(uiConstants.TAB_NOTES);
      assert.deepEqual(getSelectionState().sortKeysAvailable, [
        'Newest',
        'Oldest',
      ]);
    });

    it('allows sorting orphans by time and document location', function() {
      store.selectTab(uiConstants.TAB_ORPHANS);
      assert.deepEqual(getSelectionState().sortKeysAvailable, [
        'Newest',
        'Oldest',
        'Location',
      ]);
    });

    it('sorts annotations by document location by default', function() {
      store.selectTab(uiConstants.TAB_ANNOTATIONS);
      assert.deepEqual(getSelectionState().sortKey, 'Location');
    });

    it('sorts page notes from oldest to newest by default', function() {
      store.selectTab(uiConstants.TAB_NOTES);
      assert.deepEqual(getSelectionState().sortKey, 'Oldest');
    });

    it('sorts orphans by document location by default', function() {
      store.selectTab(uiConstants.TAB_ORPHANS);
      assert.deepEqual(getSelectionState().sortKey, 'Location');
    });

    it('does not reset the sort key unless necessary', function() {
      // Select the tab, setting sort key to 'Oldest', and then manually
      // override the sort key.
      store.selectTab(uiConstants.TAB_NOTES);
      store.setSortKey('Newest');

      store.selectTab(uiConstants.TAB_NOTES);

      assert.equal(getSelectionState().sortKey, 'Newest');
    });
  });
});
