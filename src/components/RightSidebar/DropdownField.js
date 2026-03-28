'use client';

import React from 'react';
import SelectPickerRsuite from '../SelectPickerRsuite';

const DropdownField = (props) => {
  const masterData = props.fields.masterdataarray ||
          props.masterdata?.[props.fields.storemasterdatabyfield ? props.fields.field : props.fields.masterdata] ||
          [];

  return (
    <div
      className={`form-group validate-input ${props.fields.required ? 'required-input' : ''}`}
    >
      <label className="label-form-control">
        {props.fields.text}
        {props.fields.required && <span className="text-danger"> * </span>}
      </label>

      <SelectPickerRsuite
        data={masterData}
        placeholder={props.fields.placeholder}
        onChange={(value) => props.handleFormData(props.fields.type, props.fields.field, value)}
        disabled={props.fields.disabled}
        value={props.formData[props.fields.field]}
        className={`col-12 h-35p`}
        id={`form-${props.fields.field}`}
        name={props.fields.field}
      />
    </div>
  );
};

export default DropdownField;
