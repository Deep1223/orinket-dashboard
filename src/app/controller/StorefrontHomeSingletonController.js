'use client';

import { useEffect, useRef } from 'react';
import MasterJson from '../../config/masterJSON';
import IISMethods from '../../utils/IISMethods';
import { setProps, getCurrentState } from '../../utils/reduxUtils';
import { store } from '../../store/store';
import { clearFormData } from '../../store/reducer';
import { useAppSelector } from '../../store/hooks';
import JsCall from '../../utils/JsCall';
import Config from '../../config/config';
import ApiService from '../../utils/apiService';
import GeneralSettingView from '../common/GeneralSetting/GeneralSettingView';

function buildEmptyFormFromConfig(rightsidebarformdata) {
    const formData = {};
    rightsidebarformdata?.forEach((item) => {
        item.fields?.forEach((fields) => {
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
                formData[fields.field] = fields.defaultvalue ? new Date(fields.defaultvalue.toString()).toISOString() : '';
            } else if (fields.type === 'tbl-add-button') {
                formData[fields.field] = fields.defaultvalue || [];
            } else {
                formData[fields.field] = fields.defaultvalue;
            }
        });
    });
    return formData;
}

const StorefrontHomeSingletonController = ({ alias }) => {
    const rightSidebarData = useAppSelector((state) => state.rightsidebarformdata);
    const formdata = useAppSelector((s) => s.formdata);
    const isMounted = useRef(false);
    const formKey = formdata?._id ? String(formdata._id) : 'singleton';

    const applyLoadedRecord = (row) => {
        const base = IISMethods.getcopy(row || {});
        delete base.alias;
        IISMethods.normalizeMultiImageFieldsInForm(base, getCurrentState().rightsidebarformdata);
        store.dispatch(clearFormData());
        setProps({ formdata: base });
    };

    const loadSingle = async () => {
        setProps({ loading: { showgridlistshimmer: true } });
        try {
            const result = await ApiService.read(alias, {
                pagination: { page: 1, limit: 5 },
                sort: { field: 'createdAt', order: -1 },
                filters: {},
            });
            if (!isMounted.current) return;
            if (result.success && result.data?.length) {
                applyLoadedRecord(result.data[0]);
            } else {
                const empty = buildEmptyFormFromConfig(getCurrentState().rightsidebarformdata);
                store.dispatch(clearFormData());
                setProps({ formdata: empty });
            }
        } catch (error) {
            console.error('Storefront singleton load failed:', error);
            if (isMounted.current) {
                IISMethods.errormsg(error.message || 'Failed to load', 1);
            }
        } finally {
            if (isMounted.current) setProps({ loading: { showgridlistshimmer: false } });
        }
    };

    useEffect(() => {
        isMounted.current = true;
        const data = IISMethods.getcopy(MasterJson(alias));
        setProps({
            rightsidebarformdata: data,
            formdata: {},
            masterdata: {},
            masterdatalist: {},
            rightSidebarValidationErrors: {},
            pagename: data?.[0]?.pagename || '',
            data: [],
            loading: { showgridlistshimmer: true },
        });
        loadSingle();
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
        // eslint-disable-next-line react-hooks/exhaustive-deps -- loadSingle is recreated each render; effect keyed by alias
    }, [alias]);

    const saveData = async (raw) => {
        const payload = IISMethods.getcopy(raw);
        delete payload.alias;
        try {
            const res = payload._id
                ? await ApiService.update(alias, payload._id, payload)
                : await ApiService.create(alias, payload);
            if (res.status === 200) {
                IISMethods.successmsg(payload._id ? Config.dataupdated : Config.dataaddedsuccessfully, 2);
                if (res.data) applyLoadedRecord(res.data);
                else await loadSingle();
            } else {
                IISMethods.errormsg(res.message || Config.dataaddedfailed, 1);
            }
        } catch (error) {
            const msg = error.response?.data?.message || error.message || Config.dataaddedfailed;
            IISMethods.errormsg(msg, 1);
        }
    };

    const handleAddButtonClick = (currentTabIndex) => {
        if (!JsCall.validateRightSidebarForm(getCurrentState().formdata, rightSidebarData, currentTabIndex)) return;
        saveData({ ...getCurrentState().formdata });
    };

    const handleFormData = (type, key, value, fieldtype, fieldvalue) => {
        const currentState = getCurrentState();
        const formData = { ...currentState.formdata };
        if (type === 'checkbox') {
            formData[key] = value ? 1 : 0;
        } else if (type === 'multipleimage') {
            formData[key] = IISMethods.normalizeImageList(value);
        } else if (type === 'tbl-add-button') {
            const tableData = [...(formData[key] || [])];
            if (value === -1) {
                tableData.push(fieldvalue);
            } else if (fieldtype === 'delete') {
                tableData.splice(value, 1);
            } else if (fieldtype === null) {
                if (tableData[value]) tableData[value] = fieldvalue;
            } else if (tableData[value]) {
                const fieldName = Object.keys(fieldvalue)[0];
                let finalVal = fieldvalue[fieldName];
                if (fieldtype === 'checkbox') finalVal = finalVal ? 1 : 0;
                tableData[value] = { ...tableData[value], [fieldName]: finalVal };
            }
            formData[key] = tableData;
        } else if (type === 'colorpicker') {
            formData[key] = value;
        } else if (type === 'datepicker') {
            formData[key] = value ? new Date(value.toString()).toISOString() : '';
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

    return (
        <GeneralSettingView
            formKey={`${alias}-${formKey}`}
            handleAddButtonClick={handleAddButtonClick}
            handleFormData={handleFormData}
            onReloadEmbed={loadSingle}
        />
    );
};

export default StorefrontHomeSingletonController;
