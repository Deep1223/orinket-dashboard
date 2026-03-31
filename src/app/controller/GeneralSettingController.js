'use client';

import { useEffect, useRef } from 'react';
import IISMethods from '../../utils/IISMethods';
import { setProps, getCurrentState } from '../../utils/reduxUtils';
import { store } from '../../store/store';
import { clearFormData } from '../../store/reducer';
import { useAppSelector } from '../../store/hooks';
import JsCall from '../../utils/JsCall';
import Config from '../../config/config';
import ApiService from '../../utils/apiService';
import MasterJson from '../../config/masterJSON';
import GeneralSettingView from '../common/GeneralSetting/GeneralSettingView';

const ALIAS = 'generalsetting';

/** Footer shop link URL: `/category/{slug}` — same rules as backend `slugifyLabel` / Header (strip `'` first). */
function slugifyCategoryHref(categoryName) {
  const s = String(categoryName ?? '')
    .trim()
    .toLowerCase()
    .replace(/['\u2019]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return s ? `/category/${s}` : '/category/all';
}

function enrichShopFooterLinkRow(row, categoryRows) {
  const cid = row?.categoryid;
  if (!cid) return row;
  const cat = IISMethods.getObjectfromArray(categoryRows || [], '_id', cid);
  if (!cat) return row;
  const name = (cat.categoryname || '').trim();
  return {
    ...row,
    category: name,
    linklabel: name,
    linkhref: slugifyCategoryHref(name),
  };
}

const GeneralSettingController = () => {
  const rightSidebarData = useAppSelector((state) => state.rightsidebarformdata);
  const masterdatalist = useAppSelector((s) => s.masterdatalist);
  const masterdata = useAppSelector((s) => s.masterdata);
  const formdata = useAppSelector((s) => s.formdata);
  const isMounted = useRef(false);
  const formKey = formdata?._id ? String(formdata._id) : 'new';

  const printSelectPicker = (item, fields) => {
    if (fields.field === 'iconid') {
      return (
        <span className="d-flex align-items-center gap-2">
          <i className={`${item.iconclass || 'fi fi-rr-default-icon'} text-14`}></i>
          <span className="text-14">{item[fields.masterdatafield] || item.name || item._id}</span>
        </span>
      );
    }
    if (fields.showlableview && Array.isArray(fields.showlableview)) {
      const label = fields.showlableview
        ?.map((fieldobj, index) => {
          const value = item[fieldobj.field];
          if (!value) return null;
          const prefix = fieldobj.prefix || '';
          const suffix = fieldobj.suffix || '';
          const separator =
            index < fields.showlableview.length - 1 && fieldobj.separator ? fieldobj.separator : '';
          return `${prefix}${value}${suffix}${separator}`;
        })
        .filter(Boolean)
        .join('');
      return label || item[fields.masterdatafield] || item.name || item._id;
    }
    return item[fields.masterdatafield] || item.name || item._id;
  };

  const getmasterdata = async (page, fields, filter = {}) => {
    if (fields.masterdatadependancy && Object.keys(filter).length === 0) {
      return;
    }

    if (fields.dependentfilter) {
      const keys = Object.keys(fields.dependentfilter);
      const filterdata = Object.keys(filter);
      if (keys.length === 0 || filterdata.length === 0) {
        return;
      }
      const allDependenciesMet = keys.every((key) => {
        const value = filter[key];
        return value !== undefined && value !== null && value !== '';
      });
      if (!allDependenciesMet) {
        return;
      }
    }
    const staticfilter = { ...(fields.staticfilter || {}), ...filter };
    let projection = {};
    if (fields.projection) {
      Object.keys(fields.projection).forEach((key) => {
        if (fields.projection[key] === 1) {
          projection[key] = 1;
        }
      });
    }
    const sortData = fields.sort || {};

    try {
      const result = await ApiService.read(fields.masterdata, {
        pagination: {
          page,
          limit: Number.MAX_SAFE_INTEGER,
        },
        sort: sortData,
        filters: staticfilter,
        projection,
      });

      if (result.status === 200 && isMounted.current) {
        const data = result.data.map((item) => ({
          label: printSelectPicker(item, fields),
          value: item._id,
        }));
        const masterKey = fields.storemasterdatabyfield ? fields.field : fields.masterdata;
        const currentState = getCurrentState();
        const nextMasterdata = { ...currentState.masterdata, [masterKey]: data };
        const nextMasterdatalist = { ...currentState.masterdatalist, [masterKey]: result.data };
        setProps({ masterdata: nextMasterdata, masterdatalist: nextMasterdatalist });
      }
    } catch (error) {
      console.error('Error fetching master data:', error);
    }
  };

  const getFieldConfig = (key) => {
    let fieldConfig = null;
    rightSidebarData?.forEach((tab) => {
      tab.fields?.forEach((field) => {
        if (field.field === key) {
          fieldConfig = field;
        }
      });
    });
    return fieldConfig;
  };

  const buildEmptyFormFromConfig = () => {
    const formData = {};
    getCurrentState().rightsidebarformdata?.forEach((item) => {
      if (item.fields && Array.isArray(item.fields)) {
        item.fields.forEach((fields) => {
          if (fields.type === 'checkbox') {
            formData[fields.field] = fields.defaultvalue ? 1 : 0;
          } else if (fields.type === 'image') {
            formData[fields.field] = fields.defaultvalue || '';
            if (typeof window !== 'undefined') {
              localStorage.removeItem(`img_${fields.field}`);
            }
          } else if (fields.type === 'multipleimage') {
            formData[fields.field] = IISMethods.normalizeImageList(fields.defaultvalue);
          } else if (fields.type === 'colorpicker') {
            formData[fields.field] = fields.defaultvalue || Config.colorPicker.defaultColor;
          } else if (fields.type === 'datepicker') {
            formData[fields.field] = fields.defaultvalue
              ? new Date(fields.defaultvalue.toString()).toISOString()
              : '';
          } else if (fields.type === 'tbl-add-button') {
            formData[fields.field] = fields.defaultvalue || [];
          } else {
            formData[fields.field] = fields.defaultvalue;
          }
        });
      }
    });
    if (formData.defaultCurrency === undefined || formData.defaultCurrency === null || formData.defaultCurrency === '') {
      formData.defaultCurrency = 'INR';
    }
    if (formData.defaultCountry === undefined) {
      formData.defaultCountry = '';
    }
    return formData;
  };

  const loadDropdownMastersForForm = (formData) => {
    getCurrentState().rightsidebarformdata?.forEach((item) => {
      if (item.fields && Array.isArray(item.fields)) {
        item.fields.forEach((fields) => {
          if (fields.type === 'dropdown' && fields.masterdata && !fields.masterdataarray) {
            if (fields.dependentfilter) {
              const filter = {};
              Object.keys(fields.dependentfilter).forEach((fKey) => {
                const sourceKey = fields.dependentfilter[fKey];
                filter[fKey] = formData[sourceKey];
              });
              getmasterdata(1, fields, filter);
            } else {
              getmasterdata(1, fields);
            }
          }
        });
      }
    });
  };

  const applyLoadedRecord = (row) => {
    let formData = IISMethods.getcopy(row);
    IISMethods.normalizeMultiImageFieldsInForm(formData, getCurrentState().rightsidebarformdata);
    store.dispatch(clearFormData());
    setProps({ formdata: formData });
    loadDropdownMastersForForm(formData);
  };

  const loadSingleSetting = async () => {
    setProps({ loading: { showgridlistshimmer: true } });
    try {
      const result = await ApiService.read(ALIAS, {
        pagination: { page: 1, limit: 1 },
        sort: { field: 'createdAt', order: -1 },
        filters: {},
      });
      if (!isMounted.current) return;

      if (result.success && result.data?.length) {
        applyLoadedRecord(result.data[0]);
      } else {
        const empty = buildEmptyFormFromConfig();
        store.dispatch(clearFormData());
        setProps({ formdata: empty });
        loadDropdownMastersForForm(empty);
      }
    } catch (error) {
      console.error('General settings load failed:', error);
      if (isMounted.current) {
        IISMethods.errormsg(error.message || 'Failed to load settings', 1);
        const empty = buildEmptyFormFromConfig();
        store.dispatch(clearFormData());
        setProps({ formdata: empty });
        loadDropdownMastersForForm(empty);
      }
    } finally {
      if (isMounted.current) {
        setProps({ loading: { showgridlistshimmer: false } });
      }
    }
  };

  useEffect(() => {
    isMounted.current = true;
    const data = MasterJson('generalsetting');
    setProps({
      rightsidebarformdata: IISMethods.getcopy(data),
      formdata: {},
      masterdata: {},
      masterdatalist: {},
      rightSidebarValidationErrors: {},
      pagename: data?.[0]?.pagename || 'General Settings',
      data: [],
      loading: { showgridlistshimmer: true },
    });

    loadSingleSetting();

    return () => {
      isMounted.current = false;
      setProps({
        formdata: {},
        masterdata: {},
        masterdatalist: {},
        rightSidebarValidationErrors: {},
        rightsidebarformdata: [],
        loading: {},
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount-only init; loadSingleSetting is not stable across renders
  }, []);

  const handleAddButtonClick = (currentTabIndex) => {
    if (!JsCall.validateRightSidebarForm(getCurrentState().formdata, rightSidebarData, currentTabIndex)) {
      return;
    }

    let formData = { ...getCurrentState().formdata };
    rightSidebarData.forEach((item) => {
      if (item.fields && Array.isArray(item.fields)) {
        item.fields.forEach((field) => {
          const element = document.getElementById(`form-${field.field}`);
          if (!element && (formData[field.field] === undefined || formData[field.field] === null)) {
            if (field.type === 'checkbox') {
              formData[field.field] = 0;
            } else if (field.type === 'tbl-add-button') {
              formData[field.field] = [];
            } else if (field.type === 'multipleimage') {
              formData[field.field] = [];
            } else {
              formData[field.field] = '';
            }
          }
        });
      }
    });

    setProps({ formdata: IISMethods.getcopy(formData) });

    if (formData._id) {
      updateData(formData._id, formData);
    } else {
      addData(formData);
    }
  };

  const handleFormData = (type, key, value, fieldtype, fieldvalue) => {
    const currentState = getCurrentState();
    const formData = { ...currentState.formdata };
    if (type === 'checkbox') {
      formData[key] = value ? 1 : 0;
    } else if (type === 'dropdown') {
      try {
        const formfield = IISMethods.getObjectfromRightsidebar(rightSidebarData || [], 'field', key);
        if (formfield?.masterdataarray) {
          formData[formfield?.formdatafield + 'id'] = value ? value : '';
          formData[formfield?.formdatafield] = value
            ? IISMethods.getObjectfromArray(
                formfield?.masterdata[formfield?.storemasterdatabyfield ? formfield?.field : formfield?.masterdata],
                'value',
                value
              )?.name
            : '';
        } else if (formfield?.field === 'iconid') {
          formData[formfield?.formdatafield + 'id'] = value ? value : '';
          formData[formfield?.formdatafield] = value
            ? IISMethods.getObjectfromArray(masterdatalist?.['iconmaster'], '_id', value)?.iconclass
            : '';
        } else {
          formData[formfield?.formdatafield + 'id'] = value ? value : '';
          formData[formfield?.formdatafield] = value
            ? IISMethods.getObjectfromArray(
                masterdata[formfield?.storemasterdatabyfield ? formfield?.field : formfield?.masterdata],
                'value',
                value
              )?.label
            : '';
          if (formfield?.field === 'defaultCountryid') {
            if (value) {
              const row = IISMethods.getObjectfromArray(masterdatalist?.['countrymaster'] || [], '_id', value);
              formData.defaultCurrency = row?.currencycode
                ? String(row.currencycode).trim().toUpperCase()
                : '';
            } else {
              formData.defaultCurrency = '';
            }
          }
        }
      } catch (e) {
        console.log('error', e);
      }
    } else if (type === 'tbl-add-button') {
      const tableData = [...(formData[key] || [])];
      if (value === -1) {
        let row = { ...fieldvalue };
        if (key === 'shopFooterLinks') {
          row = enrichShopFooterLinkRow(row, masterdatalist?.['category']);
        }
        tableData.push(row);
      } else if (fieldtype === 'delete') {
        tableData.splice(value, 1);
      } else if (fieldtype === null) {
        if (tableData[value]) {
          let merged = { ...fieldvalue };
          if (key === 'shopFooterLinks') {
            merged = enrichShopFooterLinkRow(merged, masterdatalist?.['category']);
          }
          tableData[value] = merged;
        }
      } else {
        if (tableData[value]) {
          const fieldName = Object.keys(fieldvalue)[0];
          let finalVal = fieldvalue[fieldName];
          if (fieldtype === 'checkbox') {
            finalVal = finalVal ? 1 : 0;
          } else if (fieldtype === 'dropdown') {
            finalVal = finalVal ? finalVal : '';
          }
          tableData[value] = { ...tableData[value], [fieldName]: finalVal };
        }
      }
      formData[key] = tableData;
    } else if (type === 'colorpicker') {
      formData[key] = value;
    } else if (type === 'datepicker') {
      formData[key] = value ? new Date(value.toString()).toISOString() : '';
    } else if (type === 'multipleimage') {
      formData[key] = IISMethods.normalizeImageList(value);
    } else {
      formData[key] = value;
    }

    const fieldConfig = getFieldConfig(key);
    if (fieldConfig) {
      if (fieldConfig.onchangefill && Array.isArray(fieldConfig.onchangefill)) {
        fieldConfig.onchangefill.forEach((childKey) => {
          const childConfig = getFieldConfig(childKey);
          if (childConfig && childConfig.dependentfilter) {
            const filter = {};
            Object.keys(childConfig.dependentfilter).forEach((fKey) => {
              const sourceKey = childConfig.dependentfilter[fKey];
              filter[fKey] = formData[sourceKey];
            });
            getmasterdata(1, childConfig, filter);
          }
        });
      }
      if (fieldConfig.onchangedata && Array.isArray(fieldConfig.onchangedata)) {
        fieldConfig.onchangedata.forEach((childKey) => {
          formData[childKey] = '';
          const childConfig = getFieldConfig(childKey);
          if (childConfig) {
            const masterKey = childConfig.storemasterdatabyfield ? childConfig.field : childConfig.masterdata;
            const md = { ...getCurrentState().masterdata, [masterKey]: [] };
            const mdl = { ...getCurrentState().masterdatalist, [masterKey]: [] };
            setProps({ masterdata: md, masterdatalist: mdl });
          }
        });
      }
    }

    const nextErrors = { ...(currentState.rightSidebarValidationErrors || {}) };
    delete nextErrors[key];
    setProps({
      formdata: IISMethods.getcopy(formData),
      rightSidebarValidationErrors: Object.keys(nextErrors).length ? nextErrors : {},
    });

    const newRightSidebarFormData = IISMethods.createRightSidebarData(key, rightSidebarData);
    const newFormData = IISMethods.createFormData(key, value);
    JsCall.ValidateForm(newFormData, newRightSidebarFormData);
  };

  const mergeServerForm = async (id) => {
    if (!id) return;
    try {
      const fresh = await ApiService.getDataById(ALIAS, id);
      if (fresh && isMounted.current) {
        applyLoadedRecord(fresh);
      }
    } catch (e) {
      console.warn('Reload after save failed', e);
    }
  };

  const updateData = async (id, formData) => {
    try {
      const responseData = await ApiService.update(ALIAS, id, formData);
      if (responseData.status === 200) {
        IISMethods.successmsg(Config.dataupdated, 2);
        if (responseData.data) {
          applyLoadedRecord(responseData.data);
        } else {
          await mergeServerForm(id);
        }
      } else {
        IISMethods.errormsg(responseData.message || Config.dataaddedfailed, 1);
      }
    } catch (error) {
      console.error('Error updating:', error);
      const errorMessage = error.response?.data?.message || error.message || Config.dataaddedfailed;
      IISMethods.errormsg(errorMessage, 1);
    }
  };

  const addData = async (reqData) => {
    try {
      const responseData = await ApiService.create(ALIAS, reqData);
      if (responseData.status === 200) {
        IISMethods.successmsg(Config.dataaddedsuccessfully, 1);
        if (responseData.data?._id) {
          applyLoadedRecord(responseData.data);
        } else {
          await loadSingleSetting();
        }
      } else {
        IISMethods.errormsg(responseData.message || Config.dataaddedfailed, 1);
      }
    } catch (error) {
      console.error('Error adding:', error);
      const errorMessage = error.response?.data?.message || error.message || Config.dataaddedfailed;
      IISMethods.errormsg(errorMessage, 1);
    }
  };

  return (
    <GeneralSettingView
      formKey={formKey}
      handleAddButtonClick={handleAddButtonClick}
      handleFormData={handleFormData}
      onReloadEmbed={loadSingleSetting}
    />
  );
};

export default GeneralSettingController;
