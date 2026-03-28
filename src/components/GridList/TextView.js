'use client';

import React from 'react';

const TextView = (props) => {
  return (
    <div className="d-flex align-items-center gap-2 h-100">
      <span className="text-14p">
        {props.row[props.field.field] ? props.row[props.field.field] : '-'}
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
