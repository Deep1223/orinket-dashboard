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
import StorefrontHomepageMasterJson from '../common/StorefrontHomepageMaster/StorefrontHomepageMasterJson';
import GeneralSettingView from '../common/GeneralSetting/GeneralSettingView';

const ALIAS = 'generalsetting';

/** Row keys match hero slide schema; these are only UI scratch fields on form root — never send to API. */
const HERO_TABLE_SCRATCH_KEYS = ['image', 'title', 'subtitle', 'caption', 'cta', 'href'];

function sanitizePayload(formData) {
    const o = IISMethods.getcopy(formData);
    HERO_TABLE_SCRATCH_KEYS.forEach((k) => {
        delete o[k];
    });
    return o;
}

const StorefrontHomepageController = () => {
    const rightSidebarData = useAppSelector((state) => state.rightsidebarformdata);
    const formdata = useAppSelector((s) => s.formdata);
    const isMounted = useRef(false);
    const formKey = formdata?._id ? String(formdata._id) : 'new';

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
        return formData;
    };

    const applyLoadedRecord = (row) => {
        const formData = IISMethods.getcopy(row);
        IISMethods.normalizeMultiImageFieldsInForm(formData, getCurrentState().rightsidebarformdata);
        HERO_TABLE_SCRATCH_KEYS.forEach((k) => {
            if (formData[k] === undefined) {
                formData[k] = '';
            }
        });
        store.dispatch(clearFormData());
        setProps({ formdata: formData });
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
            }
        } catch (error) {
            console.error('Storefront homepage load failed:', error);
            if (isMounted.current) {
                IISMethods.errormsg(error.message || 'Failed to load settings', 1);
                const empty = buildEmptyFormFromConfig();
                store.dispatch(clearFormData());
                setProps({ formdata: empty });
            }
        } finally {
            if (isMounted.current) {
                setProps({ loading: { showgridlistshimmer: false } });
            }
        }
    };

    useEffect(() => {
        isMounted.current = true;
        const data = IISMethods.getcopy(StorefrontHomepageMasterJson);
        setProps({
            rightsidebarformdata: data,
            formdata: {},
            masterdata: {},
            masterdatalist: {},
            rightSidebarValidationErrors: {},
            pagename: data?.[0]?.pagename || 'Storefront homepage',
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
        // eslint-disable-next-line react-hooks/exhaustive-deps -- mount-only; loadSingleSetting is not stable across renders
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

        const payload = sanitizePayload(formData);
        if (payload._id) {
            updateData(payload._id, payload);
        } else {
            addData(payload);
        }
    };

    const handleFormData = (type, key, value, fieldtype, fieldvalue) => {
        const currentState = getCurrentState();
        const formData = { ...currentState.formdata };
        if (type === 'checkbox') {
            formData[key] = value ? 1 : 0;
        } else if (type === 'tbl-add-button') {
            const tableData = [...(formData[key] || [])];
            if (value === -1) {
                tableData.push({ ...fieldvalue });
            } else if (fieldtype === 'delete') {
                tableData.splice(value, 1);
            } else if (fieldtype === null) {
                if (tableData[value]) {
                    tableData[value] = { ...fieldvalue };
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

    const updateData = async (id, payload) => {
        try {
            const responseData = await ApiService.update(ALIAS, id, payload);
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

export default StorefrontHomepageController;
