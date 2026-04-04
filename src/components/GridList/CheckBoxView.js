'use client';

import React from 'react';

const CheckBoxView = (props) => {
  return (
    <div className="form-check form-switch">
      <input
        className={`form-check-input ${props.row.defaultdata ? '' : 'cursor-pointer'}`}
        type="checkbox"
        role="switch"
        id="switchCheckDefault"
        disabled={props.row.defaultdata === true}
        checked={props.row[props.field.field] ? props.row[props.field.field] === 1 : 0}
        onChange={(e) =>
          props.onChangeCheckbox(props.field.type, props.field.field, e.target.checked ? 1 : 0, props.row._id, { ...props.row }, props.index)
        }
      />
    </div>
  );
};

export default CheckBoxView;
