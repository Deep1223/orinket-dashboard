'use client';

import React from 'react';

const CheckboxField = (props) => {
  return (
    <label className="checkbox checkbox-outline-primary mb-0">
      <input
        type="checkbox"
        id={`form-${props.fields.field}`}
        name={props.fields.field}
        checked={props.formData[props.fields.field] === 1}
        onChange={(e) =>
          props.handleFormData(
            props.fields.type,
            props.fields.field,
            e.target.checked ? 1 : 0
          )
        }
        className='mr-6'
      />
      <span>{props.fields.text}</span>
      <span className="checkmark"></span>
    </label>
  );
};

export default CheckboxField;
