import { createElement } from 'preact';
import propTypes from 'prop-types';

import { withServices } from '../util/service-context';
import isThirdPartyService from '../util/is-third-party-service';
import SvgIcon from './svg-icon';

/**
 * Subcomponent: an "instruction" within the tutorial step that includes an
 * icon and a "command" associated with that icon. Encapsulating these together
 * allows for styling to keep them from having a line break between them.
 */
function TutorialInstruction({ commandName, iconName }) {
  return (
    <span className="tutorial__instruction">
      <SvgIcon name={iconName} inline={true} className="tutorial__icon" />
      <em>{commandName}</em>
    </span>
  );
}

TutorialInstruction.propTypes = {
  /* the name of the "command" the instruction represents, e.g. "Annotate" */
  commandName: propTypes.string.isRequired,
  /* the name of the SVGIcon to display with this instruction */
  iconName: propTypes.string.isRequired,
};

/**
 * Tutorial for using the sidebar app
 */
function Tutorial({ settings }) {
  const canCreatePrivateGroups = !isThirdPartyService(settings);
  return (
    <ol className="tutorial__list">
      <li className="tutorial__item">
        To create an annotation, select text and click the{' '}
        <TutorialInstruction iconName="annotate" commandName="Annotate" />{' '}
        button.
      </li>
      <li className="tutorial__item">
        To create a highlight (
        <a
          href="https://web.hypothes.is/help/why-are-highlights-private-by-default/"
          target="_blank"
          rel="noopener noreferrer"
        >
          visible only to you
        </a>
        ), select text and click the{' '}
        <TutorialInstruction iconName="highlight" commandName="Highlight" />{' '}
        button.
      </li>
      {canCreatePrivateGroups && (
        <li className="tutorial__item">
          To annotate in a private group, select the group from the groups
          dropdown. Don&apos;t see your group? Ask the group creator to send a{' '}
          <a
            href="https://web.hypothes.is/help/how-to-join-a-private-group/"
            target="_blank"
            rel="noopener noreferrer"
          >
            join link
          </a>
          ).
        </li>
      )}
      <li className="tutorial__item">
        To reply to an annotation, click the{' '}
        <TutorialInstruction iconName="reply" commandName="Reply" /> button.
      </li>
    </ol>
  );
}

Tutorial.propTypes = {
  settings: propTypes.object.isRequired,
};

Tutorial.injectedProps = ['settings'];

module.exports = withServices(Tutorial);
