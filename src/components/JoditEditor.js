'use client';

import { useRef } from 'react';
import JoditEditor from 'jodit-react';

const JoditEditorComponent = ({
  value = '',
  onChange,
  placeholder = 'Enter content...',
  disabled = false,
  height = 300,
  config = {},
  id,
  name,
}) => {
  const editor = useRef(null);

  const editorConfig = {
    readonly: disabled,
    placeholder,
    height,
    toolbar: true,
    spellcheck: true,
    language: 'en',
    toolbarButtonSize: 'medium',
    toolbarAdaptive: true,
    showPlaceholder: true,
    showCharsCounter: true,
    showWordsCounter: true,
    showXPathInStatusbar: false,
    showPoweredBy: false,
    ...config,
  };

  return (
    <div className="jodit-editor-wrapper" id={id} name={name}>
      <input type="hidden" id={id} name={name} value={value} readOnly />
      <JoditEditor
        ref={editor}
        value={value}
        config={editorConfig}
        onBlur={(newContent) => {
          if (onChange) {
            onChange({
              target: {
                name: name || 'content',
                value: newContent,
              },
            });
          }
        }}
      />
    </div>
  );
};

export default JoditEditorComponent;

