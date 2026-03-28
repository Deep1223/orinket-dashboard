'use client';

import React from 'react';

const ColorPickerView = (props) => {
  return (
    <div className="d-flex align-items-center gap-2 h-100">
      <div 
        className="rounded border border-light-subtle"
        style={{ 
          width: '24px', 
          height: '24px', 
          background: props.row[props.field.field] || '#ccc' 
        }}
      />
      <span className="text-14p">
        {props.row[props.field.field] || '-'}
      </span>
    </div>
  );
};

export default ColorPickerView;
