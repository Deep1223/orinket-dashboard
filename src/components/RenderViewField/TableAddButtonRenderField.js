'use client';

import React from 'react';

const TableAddButtonRenderField = (props) => {
  const Label = ({ text, required }) => (
    <label className="text-uppercase text-muted fw-bold mb-1 d-block" style={{ fontSize: '0.7rem', letterSpacing: '0.05em' }}>
      {text}
      {required && <span className="text-danger ml-4">*</span>}
    </label>
  );

  const tableData = props.viewDetails[props.field.field] || [];

  return (
    <div className={`${props.field.size} mb-3`}>
      <Label text={props.field.text} required={props.field.required} />
      <div className="table-responsive border rounded overflow-hidden shadow-sm bg-white">
        <table className="table table-sm mb-0">
          <thead>
            <tr style={{ backgroundColor: '#f8f9fa' }}>
              {props.field.tablefields.map((f, i) => (
                <th key={i} className="text-uppercase text-muted fw-bold py-2 px-3 border-bottom" style={{ fontSize: '0.65rem' }}>{f}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tableData.length > 0 ? (
              tableData.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {props.field.tablefields.map((f, i) => (
                    <td key={i} className="text-14p py-2 px-3 text-dark fw-medium">
                      {typeof row[f] === 'object' ? JSON.stringify(row[f]) : (row[f] || '-')}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={props.field.tablefields.length} className="text-center py-3 text-muted">No data available</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TableAddButtonRenderField;
