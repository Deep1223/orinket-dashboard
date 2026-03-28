'use client';

import React from 'react';

const ColorPickerRenderField = (props) => {
  const Label = ({ text, required }) => (
    <label className="text-uppercase text-muted fw-bold mb-1 d-block" style={{ fontSize: '0.7rem', letterSpacing: '0.05em' }}>
      {text}
      {required && <span className="text-danger ml-4">*</span>}
    </label>
  );

  const ValueContainer = ({ children, className = "" }) => (
    <div className={`p-2 rounded bg-light border border-light-subtle ${className}`} style={{ minHeight: '38px', display: 'flex', alignItems: 'center' }}>
      {children}
    </div>
  );

  return (
    <div className={`${props.field.size} mb-3`}>
      <Label text={props.field.text} required={props.field.required} />
      <ValueContainer>
        <div className="d-flex align-items-center gap-2">
          {props.viewDetails[props.field.field] ? (
            <div 
              className="rounded border border-light-subtle"
              style={{ 
                width: '40px', 
                height: '40px', 
                background: props.viewDetails[props.field.field],
                border: '1px solid #e4e8f5'
              }}
            />
          ) : (
            <ValueContainer>-</ValueContainer>
          )}
        </div>
      </ValueContainer>
    </div>
  );
};

export default ColorPickerRenderField;
