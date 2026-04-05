'use client';

import React from 'react';

const TextView = (props) => {
  const raw = props.row[props.field.field];
  const isDateField =
    props.field.field === 'createdAt' ||
    props.field.field === 'updatedAt' ||
    props.field.field === 'recordinfo.createat' ||
    props.field.field === 'recordinfo.updateat';

  const formatDate = (value) => {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return value;
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const displayValue = raw ? (isDateField ? formatDate(raw) : raw) : '-';

  return (
    <div className="d-flex align-items-center gap-2 h-100">
      <span className="text-14p">
        {displayValue}
      </span>
      {props.idx === 0 && props.row.defaultdata && (
        <span className="badge badge-primary">
          Default
        </span>
      )}
    </div>
  );
};

export default TextView;
