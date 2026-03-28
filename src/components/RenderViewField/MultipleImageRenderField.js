'use client';

import React from 'react';
import { FiEye } from 'react-icons/fi';
import { Tooltip, Whisper } from 'rsuite';
import IISMethods from '../../utils/IISMethods';

const TooltipWhisper = ({ children, tooltip }) => (
  <Whisper placement="top" controlId="control-id-hover" trigger="hover" speaker={<Tooltip>{tooltip}</Tooltip>}>
    {children}
  </Whisper>
);

const MultipleImageRenderField = (props) => {
  const Label = ({ text, required }) => (
    <label className="text-uppercase text-muted fw-bold mb-1 d-block" style={{ fontSize: '0.7rem', letterSpacing: '0.05em' }}>
      {text}
      {required && <span className="text-danger ml-4">*</span>}
    </label>
  );

  const urls = IISMethods.normalizeImageList(props.viewDetails[props.field.field]);

  return (
    <div className={`${props.field.size} mb-3`}>
      <Label text={props.field.text} required={props.field.required} />
      <div className="d-flex flex-wrap align-items-center gap-2">
        {urls.length ? (
          <TooltipWhisper tooltip="Preview images">
            <button
              type="button"
              className="btn btn-sm btn-outline-primary p-1 d-flex align-items-center justify-content-center rounded"
              style={{ width: 40, height: 40 }}
              onClick={() => props.handlePreview(urls[0], props.field.text, urls)}
            >
              <FiEye size={18} />
            </button>
          </TooltipWhisper>
        ) : (
          <div className="p-2 rounded bg-light border border-light-subtle text-muted text-14" style={{ minHeight: 38, display: 'flex', alignItems: 'center' }}>
            -
          </div>
        )}
      </div>
    </div>
  );
};

export default MultipleImageRenderField;
