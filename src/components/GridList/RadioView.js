'use client';

import React from 'react';

const RadioView = (props) => {
  const raw = props.row[props.field.field];
  const opt = (props.field.options || []).find((o) => String(o.value) === String(raw));
  const text = opt?.label ?? (raw !== undefined && raw !== null && raw !== '' ? String(raw) : null);

  return <span className="text-14p">{text ?? '-'}</span>;
};

export default RadioView;
