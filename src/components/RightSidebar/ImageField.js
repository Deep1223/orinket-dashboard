'use client';

import React from 'react';
import { FiEye } from 'react-icons/fi';
import { RiDeleteBin6Line } from 'react-icons/ri';
import apiService from '../../utils/apiService';
import IISMethods from '../../utils/IISMethods';

const ImageField = (props) => {
  const fieldName = props.fields.field;
  const imageData = props.formData[fieldName] || null; // localStorage removed

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      props.setUploadingFields(prev => ({ ...prev, [fieldName]: true }));
      // Pass validation params to upload method
      const result = await apiService.upload(file, {
        allowedtypes: props.fields.allowedtypes,
        maxfilesize: props.fields.maxfilesize
      });
      
      if (result.status === 200) {
        const imageUrl = result.data.url;
        props.handleFormData(props.fields.type, fieldName, imageUrl);
        // localStorage removed - using backend only
        props.checkValidation(fieldName, imageUrl);
      } else {
        IISMethods.errormsg(result.message || 'Error uploading image', 1);
      }
      props.setUploadingFields(prev => ({ ...prev, [fieldName]: false }));
    }
  };

  const handleImageDelete = () => {
    props.handleFormData(props.fields.type, fieldName, '');
    // localStorage removed - using backend only
    const input = document.getElementById(`form-${fieldName}`);
    if (input) input.value = '';
  };

  const handlePreview = () => {
    props.setPreviewData({
      url: imageData,
      title: props.fields.text
    });
    IISMethods.handleGrid(true, 'documentpreview', 1);
  };

  return (
    <div className={`form-group validate-input ${props.fields.required ? 'required-input' : ''}`}>
      <div className="d-flex align-items-center justify-content-between mb-1">
        <label className="label-form-control mb-0">
          {props.fields.text}
          {props.fields.required && <span className="text-danger"> * </span>}
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
          className={`form-control ${props.uploadingFields[fieldName] ? 'opacity-0' : ''}`}
          id={`form-${fieldName}`}
          name={fieldName}
          accept="image/*"
          onChange={handleImageChange}
          disabled={props.fields.disabled || props.uploadingFields[fieldName]}
        />
        {props.uploadingFields[fieldName] && (
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
};

export default ImageField;
