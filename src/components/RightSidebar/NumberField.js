'use client';

import React from 'react';

const NumberField = (props) => {
  return (
    <div className={`form-group validate-input ${props.fields.required ? 'required-input' : ''}`}>
      <label className="label-form-control">
        {props.fields.text}
        {props.fields.required && <span className="text-danger"> * </span>}
      </label>
      <input
        type="text"
        className={`form-control`}
        id={`form-${props.fields.field}`}
        name={props.fields.field}
        autoComplete="off"
        placeholder={props.fields.placeholder || `Enter ${props.fields.text}`}
        defaultValue={props.formData[props.fields.field]}
        inputMode="numeric"
        pattern="[0-9]*"
        onChange={(e) => {
          const value = e.target.value.replace(/[^0-9]/g, '');
          e.target.value = value;
          props.checkValidation(props.fields.field, value);
        }}
        onBlur={(e) => props.handleFormData(props.fields.type, props.fields.field, e.target.value)}
        disabled={props.fields.disabled}
      />
    </div>
  );
};

export default NumberField;
