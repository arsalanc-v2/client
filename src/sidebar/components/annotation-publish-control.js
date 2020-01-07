import propTypes from 'prop-types';
import { createElement } from 'preact';

import { applyTheme } from '../util/theme';
import { withServices } from '../util/service-context';
import Button from './button';
import Menu from './menu';
import MenuItem from './menu-item';

/**
 * Render a compound control button for publishing (saving) an annotation:
 * - Save the annotation — left side of button
 * - Choose sharing/privacy option - drop-down menu on right side of button
 *
 */
function AnnotationPublishControl({
  group,
  isDisabled,
  isShared,
  onCancel,
  onSave,
  onSetPrivacy,
  settings,
}) {
  const publishDestination = isShared ? group.name : 'Only Me';
  const themeProps = ['ctaTextColor', 'ctaBackgroundColor'];

  const menuLabel = (
    <div className="annotation-publish-control__btn-dropdown-arrow">
      <div className="annotation-publish-control__btn-dropdown-arrow-separator" />
      <div
        className="annotation-publish-control__btn-dropdown-arrow-indicator"
        style={applyTheme(themeProps, settings)}
      >
        <div>▼</div>
      </div>
    </div>
  );

  return (
    <div className="annotation-publish-control">
      <div className="annotation-publish-control__btn">
        <button
          className="annotation-publish-control__btn-primary"
          style={applyTheme(themeProps, settings)}
          onClick={onSave}
          disabled={isDisabled}
          title={`Publish this annotation to ${publishDestination}`}
        >
          Post to {publishDestination}
        </button>
        <Menu
          arrowClass="annotation-publish-control__btn-menu-arrow"
          containerPositioned={false}
          contentClass="annotation-publish-control__btn-menu-content"
          label={menuLabel}
          menuIndicator={false}
          title="Change annotation sharing setting"
          align="left"
        >
          <MenuItem
            icon={group.type === 'open' ? 'public' : 'groups'}
            label={group.name}
            isSelected={isShared}
            onClick={() => onSetPrivacy({ level: 'shared' })}
          />
          <MenuItem
            icon="lock"
            label="Only Me"
            isSelected={!isShared}
            onClick={() => onSetPrivacy({ level: 'private' })}
          />
        </Menu>
      </div>
      <Button
        icon="cancel"
        buttonText="Cancel"
        onClick={onCancel}
        useCompactStyle
      />
    </div>
  );
}

AnnotationPublishControl.propTypes = {
  /** The group the annotation is currently associated with */
  group: propTypes.object.isRequired,

  /**
   * Should the save button be disabled?
   * Hint: it will be if the annotation has no content
   */
  isDisabled: propTypes.bool,

  /** The current privacy setting on the annotation. Is it shared to group? */
  isShared: propTypes.bool,

  /** Callback for cancel button click */
  onCancel: propTypes.func.isRequired,

  /** Callback for save button click */
  onSave: propTypes.func.isRequired,

  /** Callback when selecting a privacy option in the menu */
  onSetPrivacy: propTypes.func.isRequired,

  /** services */
  settings: propTypes.object.isRequired,
};

AnnotationPublishControl.injectedProps = ['settings'];

module.exports = withServices(AnnotationPublishControl);
