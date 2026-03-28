'use client';

import React from 'react';
import JoditEditorComponent from '../JoditEditor';

const HtmlEditorField = (props) => {
  return (
    <div
      className={`form-group validate-input ${props.fields.required ? 'required-input' : ''}`}
    >
      <label className="label-form-control">
        {props.fields.text}
        {props.fields.required && <span className="text-danger"> * </span>}
      </label>
      <JoditEditorComponent
        value={props.formData[props.fields.field] || props.fields.defaultvalue || ''}
        onChange={(e) => {
          const value = e.target.value;
          props.checkValidation(props.fields.field, value);
          props.handleFormData(props.fields.type, props.fields.field, value);
        }}
        placeholder={props.fields.placeholder || `Enter ${props.fields.text}`}
        disabled={props.fields.disabled}
        height={props.fields.height || 300}
        id={`form-${props.fields.field}`}
        name={props.fields.field}
        config={props.fields.editorConfig || {}}
      />
    </div>
  );
};

export default HtmlEditorField;
