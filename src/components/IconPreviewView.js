import React from 'react';

const IconPreviewView = ({ row, field }) => {
  const iconClass = row[field.field] || '';
  
  if (!iconClass) {
    return <span className="text-muted">-</span>;
  }

  return (
    <div className="d-flex justify-content-start align-items-center h-100">
      <i className={`${iconClass} fs-5 text-primary`}></i>
    </div>
  );
};

export default IconPreviewView;
