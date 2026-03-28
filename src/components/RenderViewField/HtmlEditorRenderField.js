'use client';

import React from 'react';

const HtmlEditorRenderField = (props) => {
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
      <div className="text-14 fw-semibold text-dark text-break">
        {props.viewDetails[props.field.field] ? (
          <div
            dangerouslySetInnerHTML={{ __html: props.viewDetails[props.field.field] }}
            className="p-3 rounded bg-light border border-light-subtle"
            style={{ minHeight: '100px' }}
          />
        ) : (
          <ValueContainer>-</ValueContainer>
        )}
      </div>
    </div>
  );
};

export default HtmlEditorRenderField;
