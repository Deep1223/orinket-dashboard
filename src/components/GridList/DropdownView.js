'use client';

import React from 'react';

const DropdownView = (props) => {
  return (
    <div className="d-flex align-items-center gap-2 h-100">
      <span className="text-14p">
        {props.row[props.field.formdatafield] ? props.row[props.field.formdatafield] : '-'}
      </span>
    </div>
  );
};

export default DropdownView;
