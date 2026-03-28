'use client';

import React from 'react';

const CheckboxRenderField = (props) => {
  const Label = ({ text, required }) => (
    <label className="text-uppercase text-muted fw-bold mb-1 d-block" style={{ fontSize: '0.7rem', letterSpacing: '0.05em' }}>
      {text}
      {required && <span className="text-danger ml-4">*</span>}
    </label>
  );

  const isChecked = props.viewDetails[props.field.field] ? props.viewDetails[props.field.field] === 1 : 0;

  return (
    <div className={`${props.field.size} mb-3`}>
      <Label text={props.field.text} required={props.field.required} />
      <div className="d-flex align-items-center mt-1">
        <span className={`badge ${isChecked ? 'badge-success' : 'badge-danger'}`}>
          {isChecked ? 'Active' : 'Inactive'}
        </span>
      </div>
    </div>
  );
};

export default CheckboxRenderField;
