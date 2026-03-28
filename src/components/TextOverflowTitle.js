import React from 'react';

const TextOverflowTitle = ({ title, children, className = '' }) => {
  // Use children as default title if not provided
  const tooltip = title || (typeof children === 'string' ? children : '');

  return (
    <div 
      className={`textoverflowtitle d-block w-100 ${className}`} 
      title={tooltip}
      style={{
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        maxWidth: '100%',
        cursor: 'pointer'
      }}
    >
      {children}
    </div>
  );
};

export default TextOverflowTitle;
