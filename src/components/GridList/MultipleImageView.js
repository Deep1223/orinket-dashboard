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

const MultipleImageView = (props) => {
  const urls = IISMethods.normalizeImageList(props.row[props.field.field]);

  if (!urls.length) {
    return <span className="text-14p">-</span>;
  }

  const preview = (url, idx) => {
    props.setPreviewImage({
      url,
      title: `${props.field.text} (${idx + 1})`,
    });
    IISMethods.handleGrid(true, 'previewimage', 1);
  };

  const maxIcons = 4;
  const shown = urls.slice(0, maxIcons);
  const extra = urls.length - shown.length;

  return (
    <span className="text-14p d-inline-flex align-items-center gap-1 flex-wrap">
      {shown.map((url, i) => (
        <TooltipWhisper key={`${url}-${i}`} tooltip="Preview">
          <span className="text-primary cursor-pointer d-inline-flex" onClick={() => preview(url, i)}>
            <FiEye size={18} />
          </span>
        </TooltipWhisper>
      ))}
      {extra > 0 ? <span className="text-muted text-12p">+{extra}</span> : null}
    </span>
  );
};

export default MultipleImageView;
