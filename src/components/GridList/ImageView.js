'use client';

import React from 'react';
import { FiEye } from 'react-icons/fi';
import IISMethods from '../../utils/IISMethods';
import { Tooltip, Whisper } from 'rsuite';

const TooltipWhisper = ({ children, tooltip }) => (
  <Whisper placement="top" controlId="control-id-hover" trigger="hover" speaker={<Tooltip>{tooltip}</Tooltip>}>
    {children}
  </Whisper>
);

const ImageView = (props) => {
  const handlePreviewClick = () => {
    props.setPreviewImage({
      url: props.row[props.field.field],
      title: props.field.text,
    });
    IISMethods.handleGrid(true, 'previewimage', 1);
  };

  return (
    <span className="text-14p">
      {props.row[props.field.field] ? (
        <TooltipWhisper tooltip="Preview Image">
          <span
            className="w-fit-content text-primary cursor-pointer"
            onClick={handlePreviewClick}
          >
            <FiEye size={18} />
          </span>
        </TooltipWhisper>
      ) : (
        '-'
      )}
    </span>
  );
};

export default ImageView;
