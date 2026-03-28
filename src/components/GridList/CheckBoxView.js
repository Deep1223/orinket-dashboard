'use client';

import React from 'react';

const CheckBoxView = (props) => {
  return (
    <div className="form-check form-switch">
      <input
        className="cursor-pointer form-check-input"
        type="checkbox"
        role="switch"
        id="switchCheckDefault"
        checked={props.row[props.field.field] ? props.row[props.field.field] === 1 : 0}
        onChange={(e) =>
          props.onChangeCheckbox(props.field.type, props.field.field, e.target.checked ? 1 : 0, props.row._id, { ...props.row }, props.index)
        }
      />
    </div>
  );
};

export default CheckBoxView;
