'use client';

import React from 'react';
import { FiEye } from 'react-icons/fi';
import IISMethods from '../../utils/IISMethods';

const TextAreaView = (props) => {
  const handleViewClick = () => {
    props.setTextareaValue(props.row[props.field.field]);
    IISMethods.handleGrid(true, 'viewtextareamodal', 1);
  };

  return (
    <span className="text-14p">
      {props.row[props.field.field] ? (
        <span
          className="w-fit-content text-primary cursor-pointer"
          onClick={handleViewClick}
        >
          <FiEye />
        </span>
      ) : (
        '-'
      )}
    </span>
  );
};

export default TextAreaView;
