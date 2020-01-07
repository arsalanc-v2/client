import { createElement } from 'preact';
import { mount } from 'enzyme';

import * as fixtures from '../../test/annotation-fixtures';
import AnnotationHeader from '../annotation-header';
import mockImportedComponents from './mock-imported-components';

describe('AnnotationHeader', () => {
  const createAnnotationHeader = props => {
    return mount(
      <AnnotationHeader
        annotation={fixtures.defaultAnnotation()}
        isEditing={false}
        isHighlight={false}
        onReplyCountClick={sinon.stub()}
        replyCount={0}
        showDocumentInfo={false}
        {...props}
      />
    );
  };

  beforeEach(() => {
    AnnotationHeader.$imports.$mock(mockImportedComponents());
  });

  afterEach(() => {
    AnnotationHeader.$imports.$restore();
  });

  describe('collapsed replies', () => {
    it('should have a callback', () => {
      const fakeCallback = sinon.stub();
      const wrapper = createAnnotationHeader({
        onReplyCountClick: fakeCallback,
      });
      const replyCollapseLink = wrapper.find('.annotation-link');
      assert.equal(replyCollapseLink.prop('onClick'), fakeCallback);
    });

    [
      {
        replyCount: 0,
        expected: '0 replies',
      },
      {
        replyCount: 1,
        expected: '1 reply',
      },
      {
        replyCount: 2,
        expected: '2 replies',
      },
    ].forEach(testCase => {
      it(`it should render the annotation reply count (${testCase.replyCount})`, () => {
        const wrapper = createAnnotationHeader({
          replyCount: testCase.replyCount,
        });
        const replyCollapseLink = wrapper.find('.annotation-link');
        assert.equal(replyCollapseLink.text(), testCase.expected);
      });
    });
  });

  describe('timestamps', () => {
    it('should render timestamp container element if annotation has a `created` value', () => {
      const wrapper = createAnnotationHeader();
      const timestamp = wrapper.find('.annotation-header__timestamp');

      assert.isTrue(timestamp.exists());
    });

    it('should not render timestamp container if annotation does not have a `created` value', () => {
      const wrapper = createAnnotationHeader({
        annotation: fixtures.newAnnotation(),
      });
      const timestamp = wrapper.find('.annotation-header__timestamp');

      assert.isFalse(timestamp.exists());
    });

    it('should render edited timestamp if annotation has been edited', () => {
      const annotation = fixtures.defaultAnnotation();
      annotation.updated = '2018-05-10T20:18:56.613388+00:00';

      const wrapper = createAnnotationHeader({
        annotation: annotation,
      });
      const timestamp = wrapper
        .find('Timestamp')
        .filter('.annotation-header__timestamp-edited-link');

      assert.isTrue(timestamp.exists());
    });

    it('should not render edited timestamp if annotation has not been edited', () => {
      // Default annotation's created value is same as updated; as if the annotation
      // has not been edited before
      const wrapper = createAnnotationHeader({
        annotation: fixtures.newAnnotation(),
      });
      const timestamp = wrapper
        .find('Timestamp')
        .filter('.annotation-header__timestamp-edited-link');

      assert.isFalse(timestamp.exists());
    });
  });

  describe('annotation is-highlight icon', () => {
    it('should display is-highlight icon if annotation is a highlight', () => {
      const wrapper = createAnnotationHeader({
        isEditing: false,
        isHighlight: true,
      });
      const highlightIcon = wrapper.find('.annotation-header__highlight');

      assert.isTrue(highlightIcon.exists());
    });

    it('should not display the is-highlight icon if annotation is not a highlight', () => {
      const wrapper = createAnnotationHeader({
        isEditing: false,
        isHighlight: false,
      });
      const highlightIcon = wrapper.find('.annotation-header__highlight');

      assert.isFalse(highlightIcon.exists());
    });
  });

  describe('annotation document info', () => {
    it('should render document info if `showDocumentInfo` is enabled', () => {
      const wrapper = createAnnotationHeader({ showDocumentInfo: true });

      const documentInfo = wrapper.find('AnnotationDocumentInfo');

      assert.isTrue(documentInfo.exists());
    });

    it('should not render document info if `showDocumentInfo` is not enabled', () => {
      const wrapper = createAnnotationHeader({ showDocumentInfo: false });

      const documentInfo = wrapper.find('AnnotationDocumentInfo');

      assert.isFalse(documentInfo.exists());
    });
  });

  context('user is editing annotation', () => {
    it('should not display timestamp', () => {
      const wrapper = createAnnotationHeader({
        annotation: fixtures.defaultAnnotation(),
        isEditing: true,
      });

      const timestamp = wrapper.find('Timestamp');

      assert.isFalse(timestamp.exists());
    });

    it('should not display is-highlight icon', () => {
      const wrapper = createAnnotationHeader({
        annotation: fixtures.defaultAnnotation(),
        isEditing: true,
        isHighlight: true,
      });
      const highlight = wrapper.find('.annotation-header__highlight');

      assert.isFalse(highlight.exists());
    });
  });
});
