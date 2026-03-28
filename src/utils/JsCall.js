import { toast } from 'react-toastify';
import Config from '../config/config';
import { setProps } from './reduxUtils';

// Validation utility, copied from stock-dashboard with paths adjusted.

class JsCall {
  static ValidateForm(formData, rightSidebarFormData, formName = 'form') {
    const errors = {};
    let hasErrors = false;

    if (!rightSidebarFormData || !Array.isArray(rightSidebarFormData)) {
      return { hasErrors: false, errors: {} };
    }

    rightSidebarFormData.forEach((tab) => {
      if (tab.fields && Array.isArray(tab.fields)) {
        tab.fields.forEach((field) => {
          // If we are validating the WHOLE form (Save button), skip istablefield.
          // But if we are validating ONLY tableFields (Add button), we don't pass istablefield=true in config.
          if (field.istablefield && formName === 'form') return; 

          const fieldName = field.field;
          const fieldValue = formData[fieldName];

          if (field && typeof field === 'object') {
            const fieldError = this.validateField(fieldValue, field, formData);
            if (fieldError) {
              errors[fieldName] = fieldError;
              hasErrors = true;
              this.hasError(fieldName, errors, formName);
            } else {
              this.hasError(fieldName, null, formName);
            }
          }
        });
      }
    });

    return { hasErrors, errors };
  }

  /**
   * Returns the first tab index that contains a field with validation error.
   * Used for tab-wise form validation (redirect user to the tab with first error).
   */
  static getFirstErrorTabIndex(rightSidebarFormData, errorFields) {
    if (!rightSidebarFormData?.length || !errorFields?.length) return null;
    const errorSet = new Set(errorFields);
    for (let i = 0; i < rightSidebarFormData.length; i++) {
      const tab = rightSidebarFormData[i];
      if (tab.fields?.some((f) => errorSet.has(f.field))) return i;
    }
    return null;
  }

  /**
   * Validates form and returns result with firstErrorTabIndex for tabbed right-sidebar forms.
   * When currentTabIndex is passed: shouldRedirect is false if current tab has any error (user stays on same tab).
   * @param {object} formData - form values
   * @param {Array} rightSidebarFormData - tab/field config
   * @param {string} [formName] - form name for DOM
   * @param {number|null} [currentTabIndex] - active tab when Save clicked; if this tab has any error, shouldRedirect will be false
   * @returns {{ hasErrors: boolean, errors: {}, firstErrorTabIndex: number|null, errorFields: string[], shouldRedirect: boolean }}
   */
  static ValidateFormWithTabs(formData, rightSidebarFormData, formName = 'form', currentTabIndex = null) {
    const { hasErrors, errors } = this.ValidateForm(formData, rightSidebarFormData, formName);
    const errorFields = Object.keys(errors || {});
    const firstErrorTabIndex = this.getFirstErrorTabIndex(rightSidebarFormData, errorFields);
    const errorSet = new Set(errorFields);
    const currentTabHasError =
      currentTabIndex != null &&
      rightSidebarFormData?.[currentTabIndex]?.fields?.some((f) => errorSet.has(f.field));
    const shouldRedirect = firstErrorTabIndex != null && !currentTabHasError;
    return {
      hasErrors,
      errors: errors || {},
      firstErrorTabIndex,
      errorFields,
      shouldRedirect,
    };
  }

  /**
   * Tab-wise validation for right-sidebar forms. Validates, and if invalid: sets
   * firstErrorTabIndex + rightSidebarValidationErrors in Redux and shows error toast.
   * When currentTabIndex is passed: redirect only if current tab has no errors.
   * @param {object} formData - form values
   * @param {Array} rightSidebarFormData - tab/field config
   * @param {number|null} [currentTabIndex] - active tab when Save clicked
   * @returns {boolean} true if valid, false if invalid (caller should return early).
   */
  static validateRightSidebarForm(formData, rightSidebarFormData, currentTabIndex = null) {
    const result = this.ValidateFormWithTabs(formData, rightSidebarFormData, 'form', currentTabIndex);
    if (result.hasErrors) {
      setProps({
        ...(result.shouldRedirect && { firstErrorTabIndex: result.firstErrorTabIndex }),
        rightSidebarValidationErrors: result.errors,
      });
      const msg =
        result.errorFields.length > 1
          ? Config.MESSAGES.fillAllFields
          : Object.values(result.errors)[0];
      toast.error(msg, { position: 'top-right', autoClose: 5000 });
      return false;
    }
    setProps({ rightSidebarValidationErrors: {} });
    return true;
  }

  static validateField(value, field, allFormData = {}) {
    if (field.required && this.isEmpty(value)) {
      return field.errormessage || `${field.text} ${Config.MESSAGES.required}`;
    }

    if (this.isEmpty(value)) return null;

    if (field.type === 'text') {
      if (field.minLength && value.length < field.minLength) {
        return field.errormessage || `Minimum length is ${field.minLength} characters`;
      }
      if (field.maxLength && value.length > field.maxLength) {
        return field.errormessage || `Maximum length is ${field.maxLength} characters`;
      }
      if (field.regex) {
        try {
          const regex = new RegExp(field.regex);
          if (!regex.test(value)) {
            return field.errormessage || field.regexMessage || Config.MESSAGES.invalidFormat;
          }
        } catch (error) {
          console.error('Invalid regex pattern:', field.regex);
          return field.errormessage || 'Invalid validation pattern';
        }
      }
    } else if (field.type === 'password') {
      // Password minimum length validation
      if (field.minlength && value.length < field.minlength) {
        return field.errormessage || `Password must be at least ${field.minlength} characters long`;
      }
      
      // Password regex validation (optional)
      if (field.regex) {
        try {
          const regex = new RegExp(field.regex);
          if (!regex.test(value)) {
            return field.errormessage || field.regexMessage || 'Password must meet the required criteria';
          }
        } catch (error) {
          console.error('Invalid regex pattern:', field.regex);
          return field.errormessage || 'Invalid validation pattern';
        }
      }
      
      // Match field validation (for confirm password)
      if (field.matchfield && allFormData) {
        const matchValue = allFormData[field.matchfield];
        if (matchValue && value !== matchValue) {
          return field.errormessage || 'Passwords do not match';
        }
      }
    } else {
      if (field.regex) {
        try {
          const regex = new RegExp(field.regex);
          if (!regex.test(value)) {
            return field.errormessage || field.regexMessage || Config.MESSAGES.invalidFormat;
          }
        } catch (error) {
          console.error('Invalid regex pattern:', field.regex);
          return field.errormessage || 'Invalid validation pattern';
        }
      }
    }

    return null;
  }

  static hasError(fieldName, errors, formName = 'form') {
    const fieldId = `${formName}-${fieldName}`;
    const hasFieldError = errors && errors[fieldName];
    const element = document.getElementById(fieldId);

    if (element) {
      // Input/field styling
      if (hasFieldError) {
        element.style.borderColor = Config.THEME.error;
        element.style.borderWidth = '2px';
        element.style.borderStyle = 'solid';
        element.style.borderRadius = '4px';
      } else {
        element.style.borderColor = '';
        element.style.borderWidth = '';
        element.style.borderStyle = '';
        element.style.borderRadius = '';
      }

      const parent = element.closest('.validate-input');
      if (parent) {
        const label = parent.querySelector('.label-form-control');
        if (label) {
          label.style.color = hasFieldError ? Config.THEME.error : '';
        }
      }
    }

    return hasFieldError;
  }

  static isEmpty(value) {
    if (value === null || value === undefined) return true;
    if (typeof value === 'string') return value.trim() === '';
    if (Array.isArray(value)) return value.length === 0;
    if (typeof value === 'object') return Object.keys(value).length === 0;
    return false;
  }
}

export default JsCall;
