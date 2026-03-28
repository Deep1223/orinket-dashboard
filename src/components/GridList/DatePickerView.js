'use client';

import React from 'react';
import IISMethods from '../../utils/IISMethods';

const DatePickerView = (props) => {
  return (
    <span className="text-14p">
      {props.row[props.field.field]
        ? IISMethods.getDateFormate(props.row[props.field.field])
        : '-'}
    </span>
  );
};

export default DatePickerView;
