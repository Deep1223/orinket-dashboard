'use client';

import React from 'react';
import ColorPickerRsuite from '../ColorPickerRsuite';

const ColorPickerField = (props) => {
  return (
    <div className={`form-group validate-input ${props.fields.required ? 'required-input' : ''}`}>
      <label className="label-form-control">
        {props.fields.text}
        {props.fields.required && <span className="text-danger"> * </span>}
      </label>
      <ColorPickerRsuite
        value={props.formData[props.fields.field]}
        onChange={(value) => {
          props.checkValidation(props.fields.field, value);
          props.handleFormData(props.fields.type, props.fields.field, value);
        }}
        disabled={props.fields.disabled}
        required={props.fields.required}
      />
    </div>
  );
};

export default ColorPickerField;
