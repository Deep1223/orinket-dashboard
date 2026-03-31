import { toast } from 'react-toastify';
import { getCurrentState, setProps } from './reduxUtils';
import Config from '../config/config';

class IISMethods {

  // ==================== STORAGE CONFIG ====================
  // localStorage mode removed - always using API
  static get STORAGE_MODE() {
    return 'api';
  }

  static get API_BASE_URL() {
    if (this.isApi()) {
      return Config.localApiUrl;
    }
    return process.env.REACT_APP_API_BASE_URL;
  }

  static getBaseUrl() {
    return this.API_BASE_URL;
  }

  static isLocalStorage() {
    // localStorage mode removed - always return false
    return false;
  }

  static isApi() {
    // Always return true - localStorage mode removed
    return true;
  }

  // ==================== TOAST METHODS ====================
  static errormsg(message, type = 1, options = {}) {
    const defaultOptions = {
      position: 'top-right',
      autoClose: type === 1 ? Config.toastErrorDuration : Config.toastSuccessDuration,
      toastId: message, // Prevent duplicate toasts with same message
    };
    const toastOptions = { ...defaultOptions, ...options };
    if (type === 2) {
      return toast.success(message, toastOptions);
    }
    else if (type === 3) {
      return toast.warning(message, toastOptions);
    }
    else if (type === 4) {
      return toast.info(message, toastOptions);
    }
    else {
      return toast.error(message, toastOptions);
    }
  }

  static successmsg(message, options = {}) {
    this.errormsg(message, 2, options);
  }

  // ==================== UTILITY METHODS ====================
  static getcopy(data) {
    return JSON.parse(JSON.stringify(data));
  }

  static getGridFieldOrder(data) {
    const fieldOrder = [];
    data?.forEach((item) => {
      if (item.fields && Array.isArray(item.fields)) {
        item.fields.forEach((field) => {
          if (field.showingrid) {
            fieldOrder.push(field);
          }
        });
      }
    });
    return fieldOrder;
  }

  /** Coerce API/string values into a clean URL list for `multipleimage` fields. */
  static normalizeImageList(val) {
    if (val == null || val === '') return [];
    if (Array.isArray(val)) {
      return val.filter((u) => u != null && String(u).trim() !== '');
    }
    if (typeof val === 'string') {
      try {
        const parsed = JSON.parse(val);
        if (Array.isArray(parsed)) {
          return parsed.filter((u) => u != null && String(u).trim() !== '');
        }
      } catch {
        /* single URL string */
      }
      const t = val.trim();
      return t ? [t] : [];
    }
    return [];
  }

  static normalizeMultiImageFieldsInForm(formData, rightSidebarData) {
    if (!formData || !rightSidebarData) return;
    rightSidebarData.forEach((tab) => {
      tab.fields?.forEach((field) => {
        if (field.type === 'multipleimage') {
          formData[field.field] = IISMethods.normalizeImageList(formData[field.field]);
        }
      });
    });
  }

  static getFilterFormData(rightSidebarFormData) {
    const updatedFilterFormData = [];
    rightSidebarFormData?.forEach((item) => {
      if (item.fields && Array.isArray(item.fields)) {
        item.fields.forEach((field) => {
          if (field.filter === 1) {
            updatedFilterFormData.push(field);
          }
        });
      }
    });
    return updatedFilterFormData;
  }

  static getFilteredData(filterdata, filterRightSidebar) {
    const filteredList = [];
    filterRightSidebar?.forEach((tab) => {
      if (tab.fields && Array.isArray(tab.fields)) {
        tab.fields.forEach((field) => {
          const key = field.field;
          if (
            field.filter === 1 &&
            filterdata[key] &&
            filterdata[key].toString().trim() !== ''
          ) {
            filteredList.push({
              field: field.field,
              text: field.text,
              value: filterdata[key],
            });
          }
        });
      }
    });
    return filteredList;
  }

  static getDateFormate(date) {
    const d = new Date(date);
    return d.toLocaleDateString(Config.dateLocale || 'en-IN', Config.dateOptions || {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  }

  static getDateTimeFormate(dateandtime) {
    const d = new Date(dateandtime);
    const dateStr = d.toLocaleDateString(Config.dateLocale || 'en-IN', Config.dateOptions || {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    const timeStr = d
      .toLocaleTimeString(Config.dateLocale || 'en-IN', Config.timeOptions || {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      })
      .replace('am', 'AM')
      .replace('pm', 'PM');
    return `${dateStr} ${timeStr}`;
  }

  static createRightSidebarData(key, rightSidebarData) {
    const updatedRightSidebarData = [];
    rightSidebarData?.forEach((item) => {
      if (item.fields && Array.isArray(item.fields)) {
        item.fields.forEach((field) => {
          if (field.field === key) {
            updatedRightSidebarData.push(field);
          }
        });
      }
    });
    return [{ fields: updatedRightSidebarData }];
  }

  static createFormData(key, value) {
    return { [key]: value };
  }

  static getObjectfromArray(array, key, value) {
    return array?.find((item) => item?.[key] === value);
  }

  static getObjectfromRightsidebar(array, key, value) {
    /**
     * Finds an object from a tabs array by matching a specific key-value pair.
     * Flattens all tab fields into a single array and searches for the match.
     *
     * @param {Array}  array  - Tabs array : [{ tabname: "Basic Information", fields: [...] }, ...]
     * @param {String} key    - Key to search by         (e.g. "field")
     * @param {String} value  - Value to match against   (e.g. "countryid")
     * @returns {Object|undefined} - Matched object or undefined if not found
     */

    // Flatten all tab fields into a single array
    // [{ tabname: "Basic Information", fields: [...] }, { tabname: "Address", fields: [...] }]
    // → [{ field: "username", ... }, { field: "countryid", ... }, ...]
    const flatArray = array?.flatMap((tab) => tab.fields || []);

    // Find and return the first object where item[key] === value
    // Returns undefined if no match is found
    return flatArray?.find((item) => item?.[key] === value);
  }

  static getIndexFromArray(array, key, value) {
    return array?.findIndex((item) => item?.[key] === value) ?? -1;
  }

  static handleGrid(value, modalName, status) {
    try {
      const currentState = getCurrentState();
      const currentModal = { ...(currentState?.modal || {}) };
      if (status === 1) {
        currentModal[modalName] = value;
      } else if (status === 0) {
        currentModal[modalName] = false;
        // localStorage image clearing removed - using backend
      }
      setProps({ modal: this.getcopy(currentModal) });
    } catch (error) {
      console.error('IISMethods.handleGrid error:', error);
    }
  }
}

export default IISMethods;