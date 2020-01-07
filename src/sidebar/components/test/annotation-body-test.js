import { createElement } from 'preact';
import { mount } from 'enzyme';

import AnnotationBody from '../annotation-body';
import mockImportedComponents from './mock-imported-components';

describe('AnnotationBody', () => {
  function createBody(props = {}) {
    return mount(<AnnotationBody text="test comment" {...props} />);
  }

  beforeEach(() => {
    AnnotationBody.$imports.$mock(mockImportedComponents());
  });

  afterEach(() => {
    AnnotationBody.$imports.$restore();
  });

  it('displays the body if `isEditing` is false', () => {
    const wrapper = createBody({ isEditing: false });
    assert.isFalse(wrapper.exists('MarkdownEditor'));
    assert.isTrue(wrapper.exists('MarkdownView'));
  });

  it('displays an editor if `isEditing` is true', () => {
    const wrapper = createBody({ isEditing: true });
    assert.isTrue(wrapper.exists('MarkdownEditor'));
    assert.isFalse(wrapper.exists('MarkdownView'));
  });
});
