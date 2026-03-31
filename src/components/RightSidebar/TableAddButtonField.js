'use client';

import React from 'react';
import { FiEdit, FiPlus, FiEye } from 'react-icons/fi';
import { RiDeleteBin6Line } from 'react-icons/ri';
import { useAppSelector } from '../../store/hooks';
import SelectPickerRsuite from '../SelectPickerRsuite';
import TextOverflowTitle from '../TextOverflowTitle';
import apiService from '../../utils/apiService';
import IISMethods from '../../utils/IISMethods';
import JsCall from '../../utils/JsCall';

const TableAddButtonField = (props) => {
  const masterdatalist = useAppSelector((s) => s.masterdatalist);
  const tableData = props.formData[props.fields.field] || [];
  const tableFields = props.rightSidebarFormData?.[props.activeTabIndex]?.fields.filter(f => props.fields.tablefields.includes(f.field)) || [];

  const handleAddRow = () => {
    // Use JsCall.ValidateForm with a custom formName to trigger validation for tableFields
    const validationResult = JsCall.ValidateForm(props.formData, [{ fields: tableFields }], 'table-form');
    
    if (validationResult.hasErrors) {
      IISMethods.errormsg('Please fill all required fields', 1);
      return;
    }

    const newRow = {};
    tableFields.forEach(tableField => {
      newRow[tableField.field] = props.formData[tableField.field];
    });

    if (props.editIndex !== null) {
      // 1. UPDATE existing row via handleFormData (value = index, fieldtype = null, fieldvalue = updated row object)
      props.handleFormData(props.fields.type, props.fields.field, props.editIndex, null, newRow);
      props.setEditIndex(null); // Exit edit mode
    } else {
      // 2. ADD new row via handleFormData (value = -1, fieldtype = null, fieldvalue = new row object)
      props.handleFormData(props.fields.type, props.fields.field, -1, null, newRow);
    }

    // Clear inputs and remove validation errors for tableFields
    tableFields.forEach(tableField => {
      props.handleFormData(tableField.type, tableField.field, tableField.defaultvalue || '');
      JsCall.hasError(tableField.field, null, 'table-form'); // Use same formName
      
      // Manually clear DOM element value because it uses defaultValue
      const element = document.getElementById(`table-form-${tableField.field}`);
      if (element) {
        element.value = tableField.defaultvalue || '';
      }
    });
  };

  const handleRemoveRow = (index) => {
    // Remove row via handleFormData with 5 arguments: type, key, value (index), fieldtype ('delete'), fieldvalue (null)
    props.handleFormData(props.fields.type, props.fields.field, index, 'delete', null);
    if (props.editIndex === index) props.setEditIndex(null); // Exit edit mode if the row being edited is deleted
  };

  const handleEditRow = (index) => {
    const rowToEdit = tableData[index];
    if (rowToEdit) {
      // 1. Populate table fields with row data
      tableFields.forEach(tableField => {
        props.handleFormData(tableField.type, tableField.field, rowToEdit[tableField.field]);
        
        // Manually update DOM element value
        const element = document.getElementById(`table-form-${tableField.field}`);
        if (element) {
          element.value = rowToEdit[tableField.field] || '';
        }
      });

      // 2. Enter edit mode (DO NOT remove the row from table)
      props.setEditIndex(index);
    }
  };

  const handleTableImageChange = async (e, tableField) => {
    const file = e.target.files[0];
    if (file) {
      props.setUploadingFields(prev => ({ ...prev, [tableField.field]: true }));
      const result = await apiService.upload(file, {
        allowedtypes: tableField.allowedtypes,
        maxfilesize: tableField.maxfilesize
      });
      
      if (result.status === 200) {
        const imageUrl = result.data.url;
        props.handleFormData(tableField.type, tableField.field, imageUrl);
        // localStorage removed - using backend only
        props.checkValidation(tableField.field, imageUrl);
        JsCall.hasError(tableField.field, null, 'table-form');
      } else {
        IISMethods.errormsg(result.message || 'Error uploading image', 1);
      }
      props.setUploadingFields(prev => ({ ...prev, [tableField.field]: false }));
    }
  };

  const handleTableImageDelete = (tableField) => {
    props.handleFormData(tableField.type, tableField.field, '');
    // localStorage removed - using backend only
    const input = document.getElementById(`table-form-${tableField.field}`);
    if (input) input.value = '';
  };

  const handleTableImagePreview = (tableField) => {
    const img = props.formData[tableField.field] || null; // localStorage removed
    props.setPreviewData({ url: img, title: tableField.text });
    IISMethods.handleGrid(true, 'documentpreview', 1);
  };

  return (
    <div className="col-12">
      <div className="d-flex align-items-end gap-2">
        <div className="flex-grow-1">
          <div className="row gx-2">
            {tableFields.map((tableField, i) => (
              <div key={i} className={tableField.size || 'col-4'}>
                {tableField.type === 'text' ? (
                  <div className={`form-group validate-input mb-3 ${tableField.required ? 'required-input' : ''}`}>
                    <label className="label-form-control">
                      {tableField.text}
                      {tableField.required && <span className="text-danger"> * </span>}
                    </label>
                    <input
                      type="text"
                      className={`form-control`}
                      id={`table-form-${tableField.field}`}
                      name={tableField.field}
                      autoComplete="off"
                      placeholder={tableField.placeholder || `Enter ${tableField.text}`}
                      defaultValue={props.formData[tableField.field]}
                      onChange={(e) => {
                        props.checkValidation(tableField.field, e.target.value);
                        // Also clear specific table-form error styling on change
                        JsCall.hasError(tableField.field, null, 'table-form');
                      }}
                      onBlur={(e) => props.handleFormData(tableField.type, tableField.field, e.target.value)}
                      disabled={tableField.disabled}
                    />
                  </div>
                ) : tableField.type === 'image' ? (
                  <div className={`form-group validate-input mb-3 ${tableField.required ? 'required-input' : ''}`}>
                    <div className="d-flex align-items-center justify-content-between mb-1">
                      <label className="label-form-control mb-0">
                        {tableField.text}
                        {tableField.required && <span className="text-danger"> * </span>}
                      </label>
                      <div className="d-flex align-items-center gap-2">
                        {(props.formData[tableField.field] || null) && ( // localStorage removed
                          <>
                            <FiEye 
                              className="cursor-pointer text-primary" 
                              title="Preview Image"
                              onClick={() => handleTableImagePreview(tableField)}
                              style={{ fontSize: '14px' }}
                            />
                            <RiDeleteBin6Line 
                              className="cursor-pointer text-danger" 
                              title="Delete Image"
                              onClick={() => handleTableImageDelete(tableField)}
                              style={{ fontSize: '14px' }}
                            />
                          </>
                        )}
                      </div>
                    </div>
                    <div className="position-relative">
                      <input
                        type="file"
                        className={`form-control ${props.uploadingFields[tableField.field] ? 'opacity-0' : ''}`}
                        id={`table-form-${tableField.field}`}
                        name={tableField.field}
                        accept="image/*"
                        onChange={(e) => handleTableImageChange(e, tableField)}
                        disabled={tableField.disabled || props.uploadingFields[tableField.field]}
                      />
                      {props.uploadingFields[tableField.field] && (
                        <div 
                          className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-light rounded"
                          style={{ border: '1px solid #ced4da' }}
                        >
                          <div className="spinner-border spinner-border-sm text-primary me-2" role="status"></div>
                          <span className="text-12p text-muted fw-medium">Uploading...</span>
                        </div>
                      )}
                    </div>
                  </div>
                ) : tableField.type === 'dropdown' ? (
                  <div className={`form-group validate-input mb-3 ${tableField.required ? 'required-input' : ''}`}>
                    <label className="label-form-control">
                      {tableField.text}
                      {tableField.required && <span className="text-danger"> * </span>}
                    </label>
                    <SelectPickerRsuite
                      data={
                        tableField.masterdataarray ||
                        props.masterdata?.[tableField.storemasterdatabyfield ? tableField.field : tableField.masterdata] ||
                        []
                      }
                      placeholder={tableField.placeholder}
                      onChange={(value) => {
                        props.handleFormData(tableField.type, tableField.field, value);
                        JsCall.hasError(tableField.field, null, 'table-form');
                      }}
                      disabled={tableField.disabled}
                      value={props.formData[tableField.field]}
                      className={`col-12 h-35p`}
                      id={`table-form-${tableField.field}`}
                      name={tableField.field}
                    />
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </div>
        <button
          type="button"
          className="btn btn-primary h-35p w-35p d-flex align-items-center justify-content-center mb-3 flex-shrink-0"
          onClick={handleAddRow}
        >
          {props.editIndex !== null ? <FiEdit className="text-16" /> : <FiPlus className="text-16" />}
        </button>
      </div>

      <div className="table-responsive border rounded mb-3">
        <table className="table table-sm mb-0" style={{ tableLayout: 'fixed', width: '100%' }}>
          <thead style={{ backgroundColor: '#f3f0ff' }}>
            <tr>
              {tableFields.map((tableField, i) => (
                <th key={i} className={`text-uppercase text-12p py-2 px-3 ${tableField.rightsidebartablesize || 'tbl-w-100p'}`}>
                  {tableField.text}
                </th>
              ))}
              <th className="text-uppercase text-12p py-2 px-3 text-center" style={{ width: '80px' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {tableData.length > 0 ? (
              tableData.map((row, rowIndex) => (
                <tr key={rowIndex} className="align-middle">
                  {tableFields.map((tableField, i) => {
                    let rawValue = row[tableField.field];
                    let displayValue;
                    if (tableField.type === 'file') {
                      displayValue =
                        row[tableField.field]?.name ||
                        (typeof row[tableField.field] === 'string'
                          ? row[tableField.field].split('/').pop()
                          : '-') ||
                        '-';
                    } else if (tableField.type === 'dropdown' && tableField.formdatafield) {
                      const named = row[tableField.formdatafield];
                      const mKey = tableField.storemasterdatabyfield ? tableField.field : tableField.masterdata;
                      const item = IISMethods.getObjectfromArray(
                        masterdatalist?.[mKey] || [],
                        '_id',
                        row[tableField.field]
                      );
                      displayValue =
                        named ||
                        item?.[tableField.masterdatafield] ||
                        item?.categoryname ||
                        (rawValue != null && rawValue !== '' ? String(rawValue) : '-');
                      rawValue = displayValue;
                    } else {
                      displayValue = rawValue != null && rawValue !== '' ? rawValue : '-';
                    }

                    return (
                      <td key={i} className={`text-14p py-2 px-3 ${tableField.rightsidebartablesize || 'tbl-w-100p'}`} style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        <TextOverflowTitle title={String(displayValue)}>
                          {displayValue}
                        </TextOverflowTitle>
                      </td>
                    );
                  })}
                  <td className="text-center px-3">
                    <div className="d-flex align-items-center justify-content-center gap-2" style={{ minHeight: '38px' }}>
                      <button
                        type="button"
                        className="btn btn-link text-primary p-0"
                        onClick={() => handleEditRow(rowIndex)}
                      >
                        <FiEdit className="text-16" />
                      </button>
                      <button
                        type="button"
                        className="btn btn-link text-danger p-0"
                        onClick={() => handleRemoveRow(rowIndex)}
                      >
                        <RiDeleteBin6Line className="text-16" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={tableFields.length + 1} className="text-center py-3 text-muted">
                  No data added
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TableAddButtonField;
