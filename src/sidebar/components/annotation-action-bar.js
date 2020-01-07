import propTypes from 'prop-types';
import { createElement } from 'preact';

import { withServices } from '../util/service-context';
import { isShareable, shareURI } from '../util/annotation-sharing';
import AnnotationShareControl from './annotation-share-control';
import Button from './button';

/**
 * A collection of `Button`s in the footer area of an annotation.
 */
function AnnotationActionBar({
  annotation,
  onDelete,
  onEdit,
  onFlag,
  onReply,
  groups,
  permissions,
  session,
  settings,
}) {
  // Is the current user allowed to take the given `action` on this annotation?
  const userIsAuthorizedTo = action => {
    return permissions.permits(
      annotation.permissions,
      action,
      session.state.userid
    );
  };

  const showDeleteAction = userIsAuthorizedTo('delete');
  const showEditAction = userIsAuthorizedTo('update');
  // Anyone may flag an annotation except the annotation's author.
  // This option is even presented to anonymous users
  const showFlagAction = session.state.userid !== annotation.user;
  const showShareAction = isShareable(annotation, settings);

  const annotationGroup = groups.get(annotation.group);

  return (
    <div className="annotation-action-bar">
      {showEditAction && <Button icon="edit" title="Edit" onClick={onEdit} />}
      {showDeleteAction && (
        <Button icon="trash" title="Delete" onClick={onDelete} />
      )}
      <Button icon="reply" title="Reply" onClick={onReply} />
      {showShareAction && (
        <AnnotationShareControl
          annotation={annotation}
          group={annotationGroup}
          shareUri={shareURI(annotation)}
        />
      )}
      {showFlagAction && !annotation.flagged && (
        <Button
          icon="flag"
          title="Report this annotation to moderators"
          onClick={onFlag}
        />
      )}
      {showFlagAction && annotation.flagged && (
        <Button
          isActive={true}
          icon="flag--active"
          title="Annotation has been reported to the moderators"
        />
      )}
    </div>
  );
}

AnnotationActionBar.propTypes = {
  annotation: propTypes.object.isRequired,
  /** Callbacks for when action buttons are clicked/tapped */
  onEdit: propTypes.func.isRequired,
  onDelete: propTypes.func.isRequired,
  onFlag: propTypes.func.isRequired,
  onReply: propTypes.func.isRequired,

  // Injected services
  groups: propTypes.object.isRequired,
  permissions: propTypes.object.isRequired,
  session: propTypes.object.isRequired,
  settings: propTypes.object.isRequired,
};

AnnotationActionBar.injectedProps = [
  'groups',
  'permissions',
  'session',
  'settings',
];

module.exports = withServices(AnnotationActionBar);
