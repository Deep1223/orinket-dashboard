'use client';

import { SelectPicker } from 'rsuite';

const SelectPickerRsuite = (props) => {
  return (
    <SelectPicker
      {...props}
      data={props.data}
      placeholder={props.placeholder}
      onChange={props.onChange}
      className={props.className}
    />
  );
};

export default SelectPickerRsuite;

