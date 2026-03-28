'use client';

import React from 'react';
import { FiEye } from 'react-icons/fi';
import { Tooltip, Whisper } from 'rsuite';

const TooltipWhisper = ({ children, tooltip }) => (
  <Whisper placement="top" controlId="control-id-hover" trigger="hover" speaker={<Tooltip>{tooltip}</Tooltip>}>
    {children}
  </Whisper>
);

const ImageRenderField = (props) => {
  const Label = ({ text, required }) => (
    <label className="text-uppercase text-muted fw-bold mb-1 d-block" style={{ fontSize: '0.7rem', letterSpacing: '0.05em' }}>
      {text}
      {required && <span className="text-danger ml-4">*</span>}
    </label>
  );

  const ValueContainer = ({ children, className = "" }) => (
    <div className={`p-2 rounded bg-light border border-light-subtle ${className}`} style={{ minHeight: '38px', display: 'flex', alignItems: 'center' }}>
      {children}
    </div>
  );

  return (
    <div className={`${props.field.size} mb-3`}>
      <Label text={props.field.text} required={props.field.required} />
      <div className="d-flex align-items-center gap-2">
        {props.viewDetails[props.field.field] ? (
          <TooltipWhisper tooltip="View Image">
            <div 
              className="d-flex align-items-center justify-content-center rounded bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25 cursor-pointer"
              onClick={() => props.handlePreview(props.viewDetails[props.field.field], props.field.text)}
              style={{ width: '40px', height: '40px', transition: 'all 0.2s' }}
              onMouseOver={(e) => e.currentTarget.classList.add('shadow-sm')}
              onMouseOut={(e) => e.currentTarget.classList.remove('shadow-sm')}
            >
              <FiEye size={20} />
            </div>
          </TooltipWhisper>
        ) : (
          <ValueContainer>-</ValueContainer>
        )}
      </div>
    </div>
  );
};

export default ImageRenderField;
