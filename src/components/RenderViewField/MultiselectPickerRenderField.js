'use client';

import React from 'react';

const MultiselectPickerRenderField = (props) => {
  const { field, viewDetails } = props;
  const raw = viewDetails[field.field];
  const keys = Array.isArray(raw) ? raw : [];
  const options = field.masterdataarray || [];
  const labels = keys
    .map((k) => options.find((o) => o.value === k)?.label || k)
    .filter(Boolean);

  const Label = ({ text, required }) => (
    <label
      className="text-uppercase text-muted fw-bold mb-1 d-block"
      style={{ fontSize: '0.7rem', letterSpacing: '0.05em' }}
    >
      {text}
      {required && <span className="text-danger ml-4">*</span>}
    </label>
  );

  return (
    <div className={`${field.size} mb-3`}>
      <Label text={field.text} required={field.required} />
      <div
        className="p-2 rounded bg-light border border-light-subtle text-14 fw-semibold text-dark text-break"
        style={{ minHeight: '38px' }}
      >
        {labels.length ? labels.join(', ') : '-'}
      </div>
    </div>
  );
};

export default MultiselectPickerRenderField;
