'use client';

import React from 'react';
import { DatePicker } from 'rsuite';

const DatePickerField = (props) => {
  return (
    <div
      className={`form-group validate-input ${props.fields.required ? 'required-input' : ''}`}
    >
      <label className="label-form-control">
        {props.fields.text}
        {props.fields.required && <span className="text-danger"> * </span>}
      </label>
      <DatePicker
        defaultValue={
          props.formData[props.fields.field] ? new Date(props.formData[props.fields.field]) : null
        }
        onChange={(value) =>
          props.handleFormData(props.fields.type, props.fields.field, value)
        }
        disabled={props.fields.disabled}
        id={`form-${props.fields.field}`}
        name={props.fields.field}
        placeholder={props.fields.placeholder || `Select ${props.fields.text}`}
        style={{ width: '100%' }}
        size="md"
        format="yyyy-MM-dd"
        cleanable={props.fields.cleanable || false}
      />
    </div>
  );
};

export default DatePickerField;
