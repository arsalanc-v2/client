const { createElement } = require('preact');

const useStore = require('../store/use-store');

const Button = require('./button');
const Menu = require('./menu');
const MenuItem = require('./menu-item');

/**
 * A drop-down menu of sorting options for a collection of annotations.
 */
function SortMenu() {
  const actions = useStore(store => ({
    setSortKey: store.setSortKey,
  }));
  // The currently-applied sort order
  const sortKey = useStore(store => store.getState().selection.sortKey);
  // All available sorting options. These change depending on current
  // "tab" or context.
  const sortKeysAvailable = useStore(
    store => store.getState().selection.sortKeysAvailable
  );

  const menuItems = sortKeysAvailable.map(sortOption => {
    return (
      <MenuItem
        key={sortOption}
        label={sortOption}
        onClick={() => actions.setSortKey(sortOption)}
        isSelected={sortOption === sortKey}
      >
        {sortOption}
      </MenuItem>
    );
  });

  const menuLabel = (
    <Button
      className="top-bar__icon-button"
      icon="sort"
      title="Sort annotations"
      useCompactStyle
    />
  );

  return (
    <div className="sort-menu">
      <Menu
        label={menuLabel}
        title={`Sort by ${sortKey}`}
        align="right"
        menuIndicator={false}
      >
        {menuItems}
      </Menu>
    </div>
  );
}

SortMenu.propTypes = {};

module.exports = SortMenu;
