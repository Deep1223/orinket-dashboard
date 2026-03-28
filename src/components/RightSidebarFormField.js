'use client';

import { useEffect, useState } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

// This is only used by form-based screens; kept minimal here.

const FormField = (props) => {
  const hasError = props.errors && props.errors[props.field.field];
  const [showPassword, setShowPassword] = useState(false);

  const shouldShow = (item) => {
    if (!item.showIf) return true;
    const { field: conditionField, values } = item.showIf;
    const fieldValue =
      props.formData[conditionField] ||
      (props.fields ? props.fields.find((f) => f?.field === conditionField)?.defaultValue : undefined);
    return values.includes(fieldValue);
  };

  useEffect(() => {
    if (!props.formData[props.field.field] && props.field.defaultValue) {
      props.handleChange(
        { target: { name: props.field.field, value: props.field.defaultValue } },
        props.field
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!shouldShow(props.field)) return null;

  return (
    <div key={props.field.field} className="mb-3">
      {props.field.type === 'text' && (
        <>
          <label
            className={`block text-sm font-medium text-gray-700 mb-1 ${
              hasError ? 'text-red-500' : ''
            }`}
          >
            {props.field.text}
            {props.field.required && <span className="text-red-500 ml-1">*</span>}
          </label>
          <input
            type="text"
            className={`border p-2 rounded-md ${props.field.size || ''} text-sm ${
              hasError ? 'border-red-500' : 'border-gray-300'
            }`}
            onChange={(e) => props.handleChange(e, props.field)}
            defaultValue={props.formData[props.field.field] || props.field.defaultValue || ''}
            disabled={props.field.disabled}
            placeholder={props.field.placeholder}
          />
        </>
      )}

      {props.field.type === 'textarea' && (
        <>
          <label
            className={`block text-sm font-medium text-gray-700 mb-1 ${
              hasError ? 'text-red-500' : ''
            }`}
          >
            {props.field.text}
            {props.field.required && <span className="text-red-500 ml-1">*</span>}
          </label>
          <textarea
            className={`border p-2 rounded-md ${props.field.size || ''} text-sm ${
              hasError ? 'border-red-500' : 'border-gray-300'
            }`}
            onChange={(e) => props.handleChange(e, props.field)}
            defaultValue={props.formData?.[props.field.field] || props.field.defaultValue || ''}
            disabled={props.field.disabled}
            rows={props.field.rows || 3}
            placeholder={props.field.placeholder}
          />
        </>
      )}

      {props.field.type === 'password' && (
        <>
          <label
            className={`block text-sm font-medium text-gray-700 mb-1 ${
              hasError ? 'text-red-500' : ''
            }`}
          >
            {props.field.text}
            {props.field.required && <span className="text-red-500 ml-1">*</span>}
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              className={`border p-2 rounded-md ${props.field.size || ''} text-sm ${
                hasError ? 'border-red-500' : 'border-gray-300'
              }`}
              onChange={(e) => props.handleChange(e, props.field)}
              defaultValue={props.formData[props.field.field] || props.field.defaultValue || ''}
              disabled={props.field.disabled}
              placeholder={props.field.placeholder}
            />
            <button
              type="button"
              className="absolute inset-y-0 right-2 flex items-center text-gray-600"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default FormField;

