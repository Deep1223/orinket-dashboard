'use client';

import React from 'react';

const TextareaField = (props) => {
  return (
    <div
      className={`form-group validate-input ${props.fields.required ? 'required-input' : ''}`}
    >
      <label className="label-form-control">
        {props.fields.text}
        {props.fields.required && <span className="text-danger"> * </span>}
      </label>
      <textarea
        className={`form-control`}
        id={`form-${props.fields.field}`}
        name={props.fields.field}
        autoComplete="off"
        placeholder={props.fields.placeholder || `Enter ${props.fields.text}`}
        defaultValue={props.formData[props.fields.field]}
        onChange={(e) => props.checkValidation(props.fields.field, e.target.value)}
        onBlur={(e) => props.handleFormData(props.fields.type, props.fields.field, e.target.value)}
        disabled={props.fields.disabled}
        rows={3}
      />
    </div>
  );
};

export default TextareaField;
