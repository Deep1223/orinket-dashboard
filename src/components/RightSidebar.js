'use client';

import { useState, useEffect, useRef } from 'react';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { setFirstErrorTabIndex } from '../store/reducer';
import ModalRsuite from './modalrsuite';
import IISMethods from '../utils/IISMethods';
import JsCall from '../utils/JsCall';
import { getCurrentState } from '../utils/reduxUtils';
import RenderViewField from './RenderViewField';
import SelectPickerRsuite from './SelectPickerRsuite';
import JoditEditorComponent from './JoditEditor';
import TextOverflowTitle from './TextOverflowTitle';
import DocumentPreviewModal from './DocumentPreviewModal';
import ColorPickerRsuite from './ColorPickerRsuite';
import { DatePicker, CheckPicker } from 'rsuite';
import { FiEdit, FiPlus, FiEye, FiEyeOff } from 'react-icons/fi';
import { RiDeleteBin6Line } from 'react-icons/ri';
import apiService from '../utils/apiService';

const RightSidebar = (props) => {
  const dispatch = useAppDispatch();
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [editIndex, setEditIndex] = useState(null);
  const [previewData, setPreviewData] = useState({ url: '', title: '', galleryUrls: undefined });
  const [uploadingFields, setUploadingFields] = useState({}); // Track uploading status per field
  const [passwordVisibility, setPasswordVisibility] = useState({}); // Track password visibility per field
  const modal = useAppSelector((s) => s.modal);
  const rightSidebarFormData = useAppSelector((s) => s.rightsidebarformdata);
  const formData = useAppSelector((s) => s.formdata);
  const masterdata = useAppSelector((s) => s.masterdata); // Add masterdata selector
  const masterdatalist = useAppSelector((s) => s.masterdatalist);
  const firstErrorTabIndex = useAppSelector((s) => s.firstErrorTabIndex);
  const hasMultipleTabs = rightSidebarFormData?.length > 1;
  const scrollContainerRef = useRef(null);

  // Toggle password visibility
  const togglePasswordVisibility = (fieldName) => {
    setPasswordVisibility(prev => ({
      ...prev,
      [fieldName]: !prev[fieldName]
    }));
  };


  const embedMode = props.embedMode === true;

  useEffect(() => {
    if (embedMode || modal?.rightsidebar) {
      setActiveTabIndex(0);
    }
  }, [embedMode, modal?.rightsidebar, formData._id]);

  useEffect(() => {
    if (hasMultipleTabs && firstErrorTabIndex != null) {
      setActiveTabIndex(firstErrorTabIndex);
      dispatch(setFirstErrorTabIndex(null));
    }
  }, [firstErrorTabIndex, hasMultipleTabs, dispatch]);

  const title = rightSidebarFormData?.[0]?.pagename
    ? `Create ${rightSidebarFormData[0].pagename}`
    : 'Create';

  const pageHeading = rightSidebarFormData?.[0]?.pagename || 'Settings';

  /** Shared tab / single-column form body (used by modal and embed pages). */
  const renderMainFormContent = () =>
    hasMultipleTabs ? (
      <div className="rightsidebar-body-wrapper">
        <div
          className={`project-page-tabs col-12 flex-shrink-0 ${
            hasMultipleTabs ? (embedMode ? 'pb-3 px-3 px-md-4 pt-3' : 'pb-1') : ''
          }`}
        >
          {embedMode ? (
            <div className="embed-tabs-pill" role="tablist" aria-label="Settings sections">
              {rightSidebarFormData?.map((tab, tabindex) => (
                <button
                  key={`tab-${tabindex}-${tab.tabname}`}
                  type="button"
                  className={`embed-tab-pill ${activeTabIndex === tabindex ? 'active' : ''}`}
                  role="tab"
                  aria-controls={tab.tabname}
                  aria-selected={activeTabIndex === tabindex}
                  onClick={() => setActiveTabIndex(tabindex)}
                >
                  {tab.tabname}
                </button>
              ))}
            </div>
          ) : (
            <div className="tabs_square line_tabs border-bottom">
              <ul className="line_tabs_list" role="tablist">
                {rightSidebarFormData?.map((tab, tabindex) => (
                  <li key={`tab-${tabindex}-${tab.tabname}`} className="line_tabs_items">
                    <button
                      type="button"
                      className={`tabs_links ${activeTabIndex === tabindex ? 'active' : ''}`}
                      role="tab"
                      aria-controls={tab.tabname}
                      aria-selected={activeTabIndex === tabindex}
                      onClick={() => setActiveTabIndex(tabindex)}
                    >
                      {tab.tabname}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <div
          className={`tab-content overflowX-hidden rightsidebar-tab-content-scroll ${
            embedMode ? 'embed-tab-panel pt-0' : ''
          }`}
        >
          <div
            className={`row ${embedMode ? 'gx-2 gx-lg-3 embed-form-row' : 'gx-3 gx-lg-4 embed-form-row'}`}
          >
            {renderFieldsWithSections(activeTabIndex, 'tab')}
          </div>
        </div>
      </div>
    ) : (
      <div className={`rightsidebar-tab-content-scroll ${embedMode ? 'embed-tab-panel' : ''}`}>
        <div
          className={`row ${embedMode ? 'gx-2 gx-lg-3 embed-form-row' : 'gx-3 gx-lg-4 embed-form-row'}`}
        >
          {renderFieldsWithSections(0, 'single')}
        </div>
      </div>
    );

  const checkValidation = (field, value) => {
    const newRightSidebarFormData = IISMethods.createRightSidebarData(field, rightSidebarFormData);
    const fd = IISMethods.createFormData(field, value);
    JsCall.ValidateForm(fd, newRightSidebarFormData);
  };

  const isFieldVisible = (fields) => {
    if (!fields.visibleWhen) return true;
    const { field, notEquals, equals } = fields.visibleWhen;
    const val = formData[field];
    if (notEquals !== undefined) return String(val) !== String(notEquals);
    if (equals !== undefined) return String(val) === String(equals);
    return true;
  };

  const renderFieldByType = (fields) => {
    if (fields.type === 'text') {
      return (
        <div className={`form-group validate-input ${fields.required ? 'required-input' : ''}`}>
          <label className="label-form-control">
            {fields.text}
            {fields.required && <span className="text-danger"> * </span>}
          </label>
          <input
            type="text"
            className={`form-control`}
            id={`form-${fields.field}`}
            name={fields.field}
            autoComplete="off"
            placeholder={fields.placeholder || `Enter ${fields.text}`}
            defaultValue={formData[fields.field]}
            onChange={(e) => checkValidation(fields.field, e.target.value)}
            onBlur={(e) => props.handleFormData(fields.type, fields.field, e.target.value)}
            disabled={fields.disabled}
          />
        </div>
      );
    }
    else if (fields.type === 'number') {
      return (
        <div className={`form-group validate-input ${fields.required ? 'required-input' : ''}`}>
          <label className="label-form-control">
            {fields.text}
            {fields.required && <span className="text-danger"> * </span>}
          </label>
          <input
            type="text"
            className={`form-control`}
            id={`form-${fields.field}`}
            name={fields.field}
            autoComplete="off"
            placeholder={fields.placeholder || `Enter ${fields.text}`}
            defaultValue={formData[fields.field]}
            inputMode="numeric"
            pattern="[0-9]*"
            onChange={(e) => {
              const value = e.target.value.replace(/[^0-9]/g, '');
              e.target.value = value;
              checkValidation(fields.field, value);
            }}
            onBlur={(e) => props.handleFormData(fields.type, fields.field, e.target.value)}
            disabled={fields.disabled}
          />
        </div>
      )
    }
    else if (fields.type === 'checkbox') {
      return (
        <label className="checkbox checkbox-outline-primary mb-0">
          <input
            type="checkbox"
            id={`form-${fields.field}`}
            name={fields.field}
            checked={formData[fields.field] === 1}
            onChange={(e) =>
              props.handleFormData(
                fields.type,
                fields.field,
                e.target.checked ? 1 : 0
              )
            }
            className='mr-6'
          />
          <span>{fields.text}</span>
          <span className="checkmark"></span>
        </label>
      );
    } else if (fields.type === 'radio') {
      const opts = fields.options || [];
      const raw = formData[fields.field];
      const selected =
        raw !== undefined && raw !== null && raw !== ''
          ? raw
          : fields.defaultvalue !== undefined && fields.defaultvalue !== null
            ? fields.defaultvalue
            : '';
      return (
        <div
          className={`form-group validate-input ${fields.required ? 'required-input' : ''}`}
          id={`form-${fields.field}`}
        >
          <label className="label-form-control">
            {fields.text}
            {fields.required && <span className="text-danger"> * </span>}
          </label>
          <div className="d-flex flex-wrap gap-3 mt-1">
            {opts.map((opt) => (
              <label key={String(opt.value)} className="d-flex align-items-center gap-2 mb-0 cursor-pointer">
                <input
                  type="radio"
                  name={fields.field}
                  checked={String(selected) === String(opt.value)}
                  onChange={() => {
                    checkValidation(fields.field, opt.value);
                    props.handleFormData(fields.type, fields.field, opt.value);
                  }}
                  disabled={fields.disabled}
                />
                <span className="text-14">{opt.label}</span>
              </label>
            ))}
          </div>
        </div>
      );
    } else if (fields.type === 'textarea') {
      return (
        <div
          className={`form-group validate-input ${fields.required ? 'required-input' : ''}`}
        >
          <label className="label-form-control">
            {fields.text}
            {fields.required && <span className="text-danger"> * </span>}
          </label>
          <textarea
            className={`form-control`}
            id={`form-${fields.field}`}
            name={fields.field}
            autoComplete="off"
            placeholder={fields.placeholder || `Enter ${fields.text}`}
            defaultValue={formData[fields.field]}
            onChange={(e) => checkValidation(fields.field, e.target.value)}
            onBlur={(e) => props.handleFormData(fields.type, fields.field, e.target.value)}
            disabled={fields.disabled}
            rows={3}
          />
        </div>
      );
    } else if (fields.type === 'dropdown') {
      const masterData = fields.masterdataarray ||
              masterdata?.[fields.storemasterdatabyfield ? fields.field : fields.masterdata] ||
              [];
      return (
        <div
          className={`form-group validate-input ${fields.required ? 'required-input' : ''}`}
        >
          <label className="label-form-control">
            {fields.text}
            {fields.required && <span className="text-danger"> * </span>}
          </label>

          <SelectPickerRsuite
            data={masterData}
            placeholder={fields.placeholder}
            onChange={(value) => props.handleFormData(fields.type, fields.field, value)}
            disabled={fields.disabled}
            value={formData[fields.field]}
            className={`col-12 h-35p`}
            id={`form-${fields.field}`}
            name={fields.field}
          />
        </div>
      );
    } else if (fields.type === 'multiselectpicker') {
      const pickerData =
        fields.masterdataarray ||
        masterdata?.[fields.storemasterdatabyfield ? fields.field : fields.masterdata] ||
        [];
      const multiVal = Array.isArray(formData[fields.field]) ? formData[fields.field] : [];
      return (
        <div
          className={`form-group validate-input ${fields.required ? 'required-input' : ''}`}
        >
          <label className="label-form-control">
            {fields.text}
            {fields.required && <span className="text-danger"> * </span>}
          </label>
          <CheckPicker
            container={() => scrollContainerRef.current}
            data={pickerData}
            value={multiVal}
            onChange={(v) => props.handleFormData('multiselectpicker', fields.field, v)}
            disabled={fields.disabled}
            placeholder={fields.placeholder || `Select ${fields.text}`}
            style={{ width: '100%' }}
            size="md"
            searchable
            cleanable
            id={`form-${fields.field}`}
          />
        </div>
      );
    } else if (fields.type === 'html-editor') {
      return (
        <div
          className={`form-group validate-input ${fields.required ? 'required-input' : ''}`}
        >
          <label className="label-form-control">
            {fields.text}
            {fields.required && <span className="text-danger"> * </span>}
          </label>
          <JoditEditorComponent
            value={formData[fields.field] || fields.defaultvalue || ''}
            onChange={(e) => {
              const value = e.target.value;
              checkValidation(fields.field, value);
              props.handleFormData(fields.type, fields.field, value);
            }}
            placeholder={fields.placeholder || `Enter ${fields.text}`}
            disabled={fields.disabled}
            height={fields.height || 300}
            id={`form-${fields.field}`}
            name={fields.field}
            config={fields.editorConfig || {}}
          />
        </div>
      );
    } else if (fields.type === 'datepicker') {
      return (
        <div
          className={`form-group validate-input ${fields.required ? 'required-input' : ''}`}
        >
          <label className="label-form-control">
            {fields.text}
            {fields.required && <span className="text-danger"> * </span>}
          </label>
          <DatePicker
            defaultValue={
              formData[fields.field] ? new Date(formData[fields.field]) : null
            }
            onChange={(value) =>
              props.handleFormData(fields.type, fields.field, value)
            }
            disabled={fields.disabled}
            id={`form-${fields.field}`}
            name={fields.field}
            placeholder={fields.placeholder || `Select ${fields.text}`}
            style={{ width: '100%' }}
            size="md"
            format="yyyy-MM-dd"
            cleanable={fields.cleanable || false}
          />
        </div>
      );
    } else if (fields.type === 'image') {
      const fieldName = fields.field;
      const imageData = formData[fieldName] || null; // localStorage removed

      const handleImageChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
          setUploadingFields(prev => ({ ...prev, [fieldName]: true }));
          // Pass validation params to upload method
          const result = await apiService.upload(file, {
            allowedtypes: fields.allowedtypes,
            maxfilesize: fields.maxfilesize
          });
          
          if (result.status === 200) {
            const imageUrl = result.data.url;
            props.handleFormData(fields.type, fieldName, imageUrl);
            // localStorage removed - using backend only
            checkValidation(fieldName, imageUrl);
          } else {
            IISMethods.errormsg(result.message || 'Error uploading image', 1);
          }
          setUploadingFields(prev => ({ ...prev, [fieldName]: false }));
        }
      };

      const handleImageDelete = () => {
        props.handleFormData(fields.type, fieldName, '');
        // localStorage removed - using backend only
        const input = document.getElementById(`form-${fieldName}`);
        if (input) input.value = '';
      };

      const handlePreview = () => {
        setPreviewData({
          url: imageData,
          title: fields.text,
          galleryUrls: undefined,
        });
        IISMethods.handleGrid(true, 'documentpreview', 1);
      };

      return (
        <div className={`form-group validate-input ${fields.required ? 'required-input' : ''}`}>
          <div className="d-flex align-items-center justify-content-between mb-1">
            <label className="label-form-control mb-0">
              {fields.text}
              {fields.required && <span className="text-danger"> * </span>}
            </label>
            <div className="d-flex align-items-center gap-2">
              {imageData && (
                <>
                  <FiEye 
                    className="cursor-pointer text-primary" 
                    title="Preview Image"
                    onClick={handlePreview}
                    style={{ fontSize: '14px' }}
                  />
                  <RiDeleteBin6Line 
                    className="cursor-pointer text-danger" 
                    title="Delete Image"
                    onClick={handleImageDelete}
                    style={{ fontSize: '14px' }}
                  />
                </>
              )}
            </div>
          </div>
          <div className="position-relative">
            <input
              type="file"
              className={`form-control ${uploadingFields[fieldName] ? 'opacity-0' : ''}`}
              id={`form-${fieldName}`}
              name={fieldName}
              accept="image/*"
              onChange={handleImageChange}
              disabled={fields.disabled || uploadingFields[fieldName]}
            />
            {uploadingFields[fieldName] && (
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
      );
    } else if (fields.type === 'multipleimage') {
      const fieldName = fields.field;
      const urls = IISMethods.normalizeImageList(formData[fieldName]);

      const handleMultiImageChange = async (e) => {
        const files = Array.from(e.target.files || []);
        e.target.value = '';
        if (!files.length) return;
        setUploadingFields((prev) => ({ ...prev, [fieldName]: true }));
        const next = [...urls];
        try {
          for (const file of files) {
            const result = await apiService.upload(file, {
              allowedtypes: fields.allowedtypes,
              maxfilesize: fields.maxfilesize,
            });
            if (result.status === 200) {
              next.push(result.data.url);
            } else {
              IISMethods.errormsg(result.message || 'Error uploading image', 1);
            }
          }
          props.handleFormData(fields.type, fieldName, next);
          checkValidation(fieldName, next);
        } finally {
          setUploadingFields((prev) => ({ ...prev, [fieldName]: false }));
        }
      };

      const handleClearAllImages = () => {
        props.handleFormData(fields.type, fieldName, []);
        checkValidation(fieldName, []);
        const input = document.getElementById(`form-${fieldName}`);
        if (input) input.value = '';
      };

      const openMultiPreview = () => {
        if (!urls.length) return;
        setPreviewData({
          url: urls[0],
          title: fields.text,
          galleryUrls: [...urls],
        });
        IISMethods.handleGrid(true, 'documentpreview', 1);
      };

      return (
        <div className={`form-group validate-input ${fields.required ? 'required-input' : ''}`}>
          <div className="d-flex align-items-center justify-content-between mb-1">
            <label className="label-form-control mb-0">
              {fields.text}
              {fields.required && <span className="text-danger"> * </span>}
            </label>
            <div className="d-flex align-items-center gap-2">
              {urls.length > 0 && (
                <>
                  <FiEye
                    className="cursor-pointer text-primary"
                    title="Preview images"
                    onClick={openMultiPreview}
                    style={{ fontSize: '14px' }}
                  />
                  <RiDeleteBin6Line
                    className="cursor-pointer text-danger"
                    title="Remove all images"
                    onClick={handleClearAllImages}
                    style={{ fontSize: '14px' }}
                  />
                </>
              )}
            </div>
          </div>
          <div className="position-relative">
            <input
              type="file"
              className={`form-control ${uploadingFields[fieldName] ? 'opacity-0' : ''}`}
              id={`form-${fieldName}`}
              name={fieldName}
              accept="image/*"
              multiple
              onChange={handleMultiImageChange}
              disabled={fields.disabled || uploadingFields[fieldName]}
            />
            {uploadingFields[fieldName] && (
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
      );
    } else if (fields.type === 'colorpicker') {
      return (
        <div className={`form-group validate-input ${fields.required ? 'required-input' : ''}`}>
          <label className="label-form-control">
            {fields.text}
            {fields.required && <span className="text-danger"> * </span>}
          </label>
          <ColorPickerRsuite
            value={formData[fields.field]}
            onChange={(value) => {
              checkValidation(fields.field, value);
              props.handleFormData(fields.type, fields.field, value);
            }}
            disabled={fields.disabled}
            required={fields.required}
          />
        </div>
      );
    } else if (fields.type === 'password') {
      return (
        <div className={`form-group validate-input ${fields.required ? 'required-input' : ''}`}>
          <label className="label-form-control">
            {fields.text}
            {fields.required && <span className="text-danger"> * </span>}
          </label>
          <div className="position-relative">
            <input
              type={passwordVisibility[fields.field] ? 'text' : 'password'}
              className={`form-control`}
              id={`form-${fields.field}`}
              name={fields.field}
              autoComplete="new-password"
              placeholder={fields.placeholder || `Enter ${fields.text}`}
              defaultValue={formData[fields.field]}
              onChange={(e) => checkValidation(fields.field, e.target.value)}
              onBlur={(e) => props.handleFormData(fields.type, fields.field, e.target.value)}
              disabled={fields.disabled}
              minLength={fields.minlength || 8}
              style={{ paddingRight: '40px' }}
            />
            <button
              type="button"
              className="btn btn-link position-absolute"
              style={{ 
                right: '10px', 
                top: '50%', 
                transform: 'translateY(-50%)', 
                padding: '0', 
                border: 'none', 
                background: 'none',
                color: '#6c757d',
                zIndex: 10
              }}
              onClick={() => togglePasswordVisibility(fields.field)}
              disabled={fields.disabled}
            >
              {passwordVisibility[fields.field] ? <FiEyeOff size={16} /> : <FiEye size={16} />}
            </button>
          </div>
        </div>
      );
    } 
    else if (fields.type === 'tbl-add-button') {
      const tableData = formData[fields.field] || [];
      const tableFields = rightSidebarFormData?.[activeTabIndex]?.fields.filter(f => fields.tablefields.includes(f.field)) || [];

      const handleAddRow = () => {
        // Use JsCall.ValidateForm with a custom formName to trigger validation for tableFields
        const validationResult = JsCall.ValidateForm(formData, [{ fields: tableFields }], 'table-form');
        
        if (validationResult.hasErrors) {
          IISMethods.errormsg('Please fill all required fields', 1);
          return;
        }

        const newRow = {};
        tableFields.forEach(tableField => {
          newRow[tableField.field] = formData[tableField.field];
        });

        if (editIndex !== null) {
          // 1. UPDATE existing row via handleFormData (value = index, fieldtype = null, fieldvalue = updated row object)
          props.handleFormData(fields.type, fields.field, editIndex, null, newRow);
          setEditIndex(null); // Exit edit mode
        } else {
          // 2. ADD new row via handleFormData (value = -1, fieldtype = null, fieldvalue = new row object)
          props.handleFormData(fields.type, fields.field, -1, null, newRow);
        }

        // Clear inputs and remove validation errors for tableFields
        tableFields.forEach(tableField => {
          const dv =
            tableField.type === 'checkbox'
              ? tableField.defaultvalue === 1 || tableField.defaultvalue === true
                ? 1
                : 0
              : tableField.defaultvalue ?? '';
          if (tableField.type === 'checkbox') {
            props.handleFormData('checkbox', tableField.field, dv);
          } else {
            props.handleFormData(tableField.type, tableField.field, dv);
          }
          JsCall.hasError(tableField.field, null, 'table-form'); // Use same formName

          const element = document.getElementById(`table-form-${tableField.field}`);
          if (element) {
            if (tableField.type === 'checkbox') {
              element.checked = dv === 1;
            } else {
              element.value = tableField.defaultvalue ?? '';
            }
          }
        });
      };

      const handleRemoveRow = (index) => {
        // Remove row via handleFormData with 5 arguments: type, key, value (index), fieldtype ('delete'), fieldvalue (null)
        props.handleFormData(fields.type, fields.field, index, 'delete', null);
        if (editIndex === index) setEditIndex(null); // Exit edit mode if the row being edited is deleted
      };

      const handleEditRow = (index) => {
        const rowToEdit = tableData[index];
        if (rowToEdit) {
          // 1. Populate table fields with row data
          tableFields.forEach(tableField => {
            let v = rowToEdit[tableField.field];
            if (tableField.type === 'checkbox') {
              v = v === true || v === 1 || v === '1' ? 1 : 0;
              props.handleFormData('checkbox', tableField.field, v);
            } else {
              props.handleFormData(tableField.type, tableField.field, v);
            }

            const element = document.getElementById(`table-form-${tableField.field}`);
            if (element) {
              if (tableField.type === 'checkbox') {
                element.checked = v === 1;
              } else {
                element.value =
                  rowToEdit[tableField.field] !== undefined && rowToEdit[tableField.field] !== null
                    ? String(rowToEdit[tableField.field])
                    : '';
              }
            }
          });

          // 2. Enter edit mode (DO NOT remove the row from table)
          setEditIndex(index);
        }
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
                          defaultValue={formData[tableField.field]}
                          onChange={(e) => {
                            checkValidation(tableField.field, e.target.value);
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
                            {(formData[tableField.field] || null) && ( // localStorage removed
                              <>
                                <FiEye 
                                  className="cursor-pointer text-primary" 
                                  title="Preview Image"
                                  onClick={() => {
                                    const img = formData[tableField.field] || null; // localStorage removed
                                    setPreviewData({ url: img, title: tableField.text, galleryUrls: undefined });
                                    IISMethods.handleGrid(true, 'documentpreview', 1);
                                  }}
                                  style={{ fontSize: '14px' }}
                                />
                                <RiDeleteBin6Line 
                                  className="cursor-pointer text-danger" 
                                  title="Delete Image"
                                  onClick={() => {
                                    props.handleFormData(tableField.type, tableField.field, '');
                                    // localStorage removed - using backend only
                                    const input = document.getElementById(`table-form-${tableField.field}`);
                                    if (input) input.value = '';
                                  }}
                                  style={{ fontSize: '14px' }}
                                />
                              </>
                            )}
                          </div>
                        </div>
                        <div className="position-relative">
                          <input
                            type="file"
                            className={`form-control ${uploadingFields[tableField.field] ? 'opacity-0' : ''}`}
                            id={`table-form-${tableField.field}`}
                            name={tableField.field}
                            accept="image/*"
                            onChange={async (e) => {
                              const file = e.target.files[0];
                              if (file) {
                                setUploadingFields(prev => ({ ...prev, [tableField.field]: true }));
                                const result = await apiService.upload(file, {
                                  allowedtypes: tableField.allowedtypes,
                                  maxfilesize: tableField.maxfilesize
                                });
                                
                                if (result.status === 200) {
                                  const imageUrl = result.data.url;
                                  props.handleFormData(tableField.type, tableField.field, imageUrl);
                                  // localStorage removed - using backend only
                                  checkValidation(tableField.field, imageUrl);
                                  JsCall.hasError(tableField.field, null, 'table-form');
                                } else {
                                  IISMethods.errormsg(result.message || 'Error uploading image', 1);
                                }
                                setUploadingFields(prev => ({ ...prev, [tableField.field]: false }));
                              }
                            }}
                            disabled={tableField.disabled || uploadingFields[tableField.field]}
                          />
                          {uploadingFields[tableField.field] && (
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
                    ) : tableField.type === 'checkbox' ? (
                      <div className={`form-group mb-3 ${tableField.required ? 'required-input' : ''}`}>
                        <label className="checkbox checkbox-outline-primary mb-0 d-flex align-items-center">
                          <input
                            type="checkbox"
                            id={`table-form-${tableField.field}`}
                            checked={
                              formData[tableField.field] === 1 ||
                              formData[tableField.field] === true
                            }
                            onChange={(e) =>
                              props.handleFormData(
                                'checkbox',
                                tableField.field,
                                e.target.checked ? 1 : 0
                              )
                            }
                            className="mr-6"
                            disabled={tableField.disabled}
                          />
                          <span>{tableField.text}</span>
                        </label>
                      </div>
                    ) : tableField.type === 'number' ? (
                      <div className={`form-group validate-input mb-3 ${tableField.required ? 'required-input' : ''}`}>
                        <label className="label-form-control">
                          {tableField.text}
                          {tableField.required && <span className="text-danger"> * </span>}
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          id={`table-form-${tableField.field}`}
                          name={tableField.field}
                          autoComplete="off"
                          placeholder={tableField.placeholder || `Enter ${tableField.text}`}
                          defaultValue={formData[tableField.field]}
                          inputMode="numeric"
                          onChange={(e) => {
                            const value = e.target.value.replace(/[^0-9]/g, '');
                            e.target.value = value;
                            JsCall.hasError(tableField.field, null, 'table-form');
                          }}
                          onBlur={(e) =>
                            props.handleFormData(
                              tableField.type,
                              tableField.field,
                              e.target.value
                            )
                          }
                          disabled={tableField.disabled}
                        />
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
                            masterdata?.[tableField.storemasterdatabyfield ? tableField.field : tableField.masterdata] ||
                            []
                          }
                          placeholder={tableField.placeholder}
                          onChange={(value) => {
                            props.handleFormData(tableField.type, tableField.field, value);
                            JsCall.hasError(tableField.field, null, 'table-form');
                          }}
                          disabled={tableField.disabled}
                          value={formData[tableField.field]}
                          className={`col-12 h-35p`}
                          id={`table-form-${tableField.field}`}
                          name={tableField.field}
                        />
                      </div>
                    ) : tableField.type === 'password' ? (
                      <div className={`form-group validate-input mb-3 ${tableField.required ? 'required-input' : ''}`}>
                        <label className="label-form-control">
                          {tableField.text}
                          {tableField.required && <span className="text-danger"> * </span>}
                        </label>
                        <div className="position-relative">
                          <input
                            type={passwordVisibility[`table-${tableField.field}`] ? 'text' : 'password'}
                            className="form-control"
                            id={`table-form-${tableField.field}`}
                            name={tableField.field}
                            autoComplete="new-password"
                            placeholder={tableField.placeholder || `Enter ${tableField.text}`}
                            defaultValue={formData[tableField.field]}
                            onChange={(e) => {
                              props.handleFormData(tableField.type, tableField.field, e.target.value);
                              JsCall.hasError(tableField.field, null, 'table-form');
                            }}
                            onBlur={(e) => props.handleFormData(tableField.type, tableField.field, e.target.value)}
                            disabled={tableField.disabled}
                            minLength={tableField.minlength || 8}
                            style={{ paddingRight: '40px' }}
                          />
                          <button
                            type="button"
                            className="btn btn-link position-absolute"
                            style={{ 
                              right: '10px', 
                              top: '50%', 
                              transform: 'translateY(-50%)', 
                              padding: '0', 
                              border: 'none', 
                              background: 'none',
                              color: '#6c757d',
                              zIndex: 10
                            }}
                            onClick={() => togglePasswordVisibility(`table-${tableField.field}`)}
                            disabled={tableField.disabled}
                          >
                            {passwordVisibility[`table-${tableField.field}`] ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                          </button>
                        </div>
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
            <button
              type="button"
              className="btn btn-primary h-35p w-35p d-flex align-items-center justify-content-center mb-3"
              onClick={handleAddRow}
            >
              {editIndex !== null ? <FiEdit className="text-16" /> : <FiPlus className="text-16" />}
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
                        const rawValue = row[tableField.field];

                        if (tableField.type === 'image') {
                          const src =
                            rawValue != null && String(rawValue).trim() !== ''
                              ? String(rawValue).trim()
                              : '';
                          return (
                            <td
                              key={i}
                              className={`text-14p py-2 px-3 ${tableField.rightsidebartablesize || 'tbl-w-100p'}`}
                              style={{ verticalAlign: 'middle' }}
                            >
                              {src ? (
                                <img
                                  src={src}
                                  alt=""
                                  style={{
                                    maxWidth: 72,
                                    maxHeight: 54,
                                    width: 'auto',
                                    height: 'auto',
                                    objectFit: 'cover',
                                    borderRadius: 4,
                                    display: 'block',
                                  }}
                                />
                              ) : (
                                <span className="text-muted">—</span>
                              )}
                            </td>
                          );
                        }

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
                        } else if (tableField.type === 'checkbox') {
                          displayValue =
                            rawValue === 1 || rawValue === true || rawValue === '1' ? 'Yes' : 'No';
                        } else if (tableField.type === 'number') {
                          const n = Number(rawValue);
                          displayValue =
                            Number.isFinite(n) && n > 0 ? String(Math.floor(n)) : '—';
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
    }

    return null;
  };

  /** Renders fields in order; optional `sectionTitle` on a field starts a new group (title + border-bottom). */
  const renderFieldsWithSections = (tabIndex, keyPrefix) => {
    const tabFields = rightSidebarFormData?.[tabIndex]?.fields || [];
    let prevSectionTitle = null;
    const nodes = [];

    tabFields.forEach((fields, index) => {
      if (fields.istablefield) return;
      if (!isFieldVisible(fields)) return;

      const st = typeof fields.sectionTitle === 'string' ? fields.sectionTitle.trim() : '';
      if (st) {
        if (st !== prevSectionTitle) {
          prevSectionTitle = st;
          nodes.push(
            <div key={`${keyPrefix}-section-${st}-${index}`} className="col-12">
              <div
                className={`rightsidebar-field-section-title border-bottom pb-2 mb-3 mt-2 ${
                  embedMode ? 'rightsidebar-field-section-title--embed' : ''
                }`}
              >
                <span className="fw-semibold text-dark text-14">{st}</span>
              </div>
            </div>
          );
        }
      }

      nodes.push(
        <div key={fields.field || `${keyPrefix}-f-${index}`} className={`${fields.size}`}>
          {renderFieldByType(fields)}
        </div>
      );
    });

    return nodes;
  };

  return (
    <>
      {embedMode ? (
        <div className="rightsidebar-embed rightsidebar-embed-settings bg-white border rounded-3 shadow-sm">
          <div className="rightsidebar-embed-header border-bottom px-3 px-md-4 py-3">
            <h1 className="h4 fw-semibold text-dark mb-0">{pageHeading}</h1>
          </div>
          <form method="post" className="rightsidebar-form-with-tabs rightsidebar-embed-form">
            {renderMainFormContent()}
          </form>
          <div className="rightsidebar-embed-actions d-flex gap-2 gap-md-3 justify-content-end align-items-center flex-wrap px-3 px-md-4 py-3">
            {typeof props.onCancelEmbed === 'function' && (
              <button type="button" className="btn btn-outline-secondary" onClick={props.onCancelEmbed}>
                Cancel
              </button>
            )}
            <button
              type="button"
              className="btn btn-primary px-4"
              onClick={() => props.handleAddButtonClick(null)}
            >
              Save changes
            </button>
          </div>
        </div>
      ) : (
        <ModalRsuite
          open={modal?.rightsidebar}
          onClose={() => {
            IISMethods.handleGrid(false, 'rightsidebar', 0);
          }}
          title={title}
          size={rightSidebarFormData?.[0]?.rightsidebarsize}
          bodyClassName={hasMultipleTabs ? 'rightsidebar-modal-body' : 'rightsidebar-modal-body-single-tab'}
          body={
            <form method="post" className="rightsidebar-form-with-tabs">
              {renderMainFormContent()}
            </form>
          }
          footer={
            <div className="d-flex gap-10">
              <button className="btn btn-primary" onClick={() => props.handleAddButtonClick(hasMultipleTabs ? activeTabIndex : undefined)}>
                Save
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => {
                  IISMethods.handleGrid(false, 'rightsidebar', 0);
                }}
              >
                Cancel
              </button>
            </div>
          }
        />
      )}

      <ModalRsuite
        open={getCurrentState().modal?.viewdetails}
        onClose={() => {
          IISMethods.handleGrid(false, 'viewdetails', 0);
        }}
        title="View Details"
        size={getCurrentState().rightsidebarformdata?.[0]?.rightsidebarsize}
        body={
          <div className="row">
            {getCurrentState().rightsidebarformdata?.length > 1 ? (
              getCurrentState().rightsidebarformdata.map((tab, tabindex) => (
                <div key={`tab-${tabindex}-${tab.tabname}`} className="col-12 mb-3">
                  <h6 className="border-bottom pb-1 text-primary">{tab.tabname}</h6>
                  <div className="row">
                    {tab.fields.map((field, fieldindex) => (
                      <RenderViewField
                        key={`field-${tabindex}-${fieldindex}`}
                        field={field}
                        viewDetails={props.viewDetails}
                        index={fieldindex}
                        handlePreview={(url, title, galleryUrls) => {
                          setPreviewData({
                            url: url || '',
                            title: title || '',
                            galleryUrls: galleryUrls?.length ? [...galleryUrls] : undefined,
                          });
                          IISMethods.handleGrid(true, 'documentpreview', 1);
                        }}
                      />
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <>
                {getCurrentState().rightsidebarformdata?.[0]?.fields.map((field, index) => (
                  <RenderViewField
                    key={`field-${field.field}-${index}`}
                    field={field}
                    viewDetails={props.viewDetails}
                    index={index}
                    handlePreview={(url, title, galleryUrls) => {
                      setPreviewData({
                        url: url || '',
                        title: title || '',
                        galleryUrls: galleryUrls?.length ? [...galleryUrls] : undefined,
                      });
                      IISMethods.handleGrid(true, 'documentpreview', 1);
                    }}
                  />
                ))}
              </>
            )}
          </div>
        }
        footer={
          <div className="d-flex gap-10">
            <button
              className="btn btn-primary"
              onClick={() => IISMethods.handleGrid(false, 'viewdetails', 0)}
            >
              Close
            </button>
          </div>
        }
      />
      <DocumentPreviewModal
        modalname="documentpreview"
        fileUrl={previewData.url}
        title={previewData.title}
        galleryUrls={previewData.galleryUrls}
      />
    </>
  );
};

export default RightSidebar;

