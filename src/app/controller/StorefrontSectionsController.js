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
import StorefrontSectionsMasterJson from '../common/StorefrontSectionsMaster/StorefrontSectionsMasterJson';
import GeneralSettingView from '../common/GeneralSetting/GeneralSettingView';

const ALIAS = 'generalsetting';
const CMS_KEYS = [
    'demifineSection',
    'topStylesSection',
    'discountBanner',
    'shopByRecipient',
    'forEveryYou',
    'fineGoldSection',
    'deserveToShine',
    'founderMessage',
    'blogSection',
    'shopWithConfidence',
    'brandStory',
    'reviews',
    'ctaBanner',
    'visitStores',
    'aboutPage',
    'storyPage',
    'careersPage',
    'jobOpenings',
    'blogPosts',
    'storeLocations',
    'supportPages',
];

const MAP = {
    demifineSectionJson: 'demifineSection',
    topStylesSectionJson: 'topStylesSection',
    discountBannerJson: 'discountBanner',
    shopByRecipientJson: 'shopByRecipient',
    forEveryYouJson: 'forEveryYou',
    fineGoldSectionJson: 'fineGoldSection',
    deserveToShineJson: 'deserveToShine',
    founderMessageJson: 'founderMessage',
    blogSectionJson: 'blogSection',
    shopWithConfidenceJson: 'shopWithConfidence',
    brandStoryJson: 'brandStory',
    reviewsJson: 'reviews',
    ctaBannerJson: 'ctaBanner',
    visitStoresJson: 'visitStores',
    aboutPageJson: 'aboutPage',
    storyPageJson: 'storyPage',
    careersPageJson: 'careersPage',
    jobOpeningsJson: 'jobOpenings',
    blogPostsJson: 'blogPosts',
    storeLocationsJson: 'storeLocations',
    supportPagesJson: 'supportPages',
};

function parseCms(raw) {
    if (!raw || typeof raw !== 'string' || !raw.trim()) return {};
    try {
        const j = JSON.parse(raw);
        return j && typeof j === 'object' && !Array.isArray(j) ? j : {};
    } catch {
        return {};
    }
}

function stringify(v) {
    if (v === undefined) return '';
    try {
        return JSON.stringify(v, null, 2);
    } catch {
        return '';
    }
}

const StorefrontSectionsController = () => {
    const rightSidebarData = useAppSelector((state) => state.rightsidebarformdata);
    const formdata = useAppSelector((s) => s.formdata);
    const isMounted = useRef(false);
    const formKey = formdata?._id ? String(formdata._id) : 'new';

    const buildEmptyFormFromConfig = () => {
        const out = {};
        getCurrentState().rightsidebarformdata?.forEach((tab) => {
            tab.fields?.forEach((f) => {
                out[f.field] = f.defaultvalue || '';
            });
        });
        return out;
    };

    const applyLoadedRecord = (row) => {
        const base = IISMethods.getcopy(row || {});
        const cms = parseCms(base.storefrontContentJson);
        Object.entries(MAP).forEach(([formField, cmsKey]) => {
            base[formField] = stringify(cms[cmsKey]);
        });
        store.dispatch(clearFormData());
        setProps({ formdata: base });
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
            console.error('Storefront sections load failed:', error);
            if (isMounted.current) {
                IISMethods.errormsg(error.message || 'Failed to load settings', 1);
            }
        } finally {
            if (isMounted.current) setProps({ loading: { showgridlistshimmer: false } });
        }
    };

    useEffect(() => {
        isMounted.current = true;
        const data = IISMethods.getcopy(StorefrontSectionsMasterJson);
        setProps({
            rightsidebarformdata: data,
            formdata: {},
            masterdata: {},
            masterdatalist: {},
            rightSidebarValidationErrors: {},
            pagename: data?.[0]?.pagename || 'Storefront sections',
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
    }, []);

    const buildPayload = (formData) => {
        const payload = IISMethods.getcopy(formData);
        const cms = parseCms(payload.storefrontContentJson);
        Object.entries(MAP).forEach(([formField, cmsKey]) => {
            const raw = String(payload[formField] || '').trim();
            delete payload[formField];
            if (!raw) {
                delete cms[cmsKey];
                return;
            }
            try {
                cms[cmsKey] = JSON.parse(raw);
            } catch {
                throw new Error(`Invalid JSON in ${formField}`);
            }
        });
        payload.storefrontContentJson = JSON.stringify(cms, null, 2);
        return payload;
    };

    const saveData = async (formData) => {
        let payload;
        try {
            payload = buildPayload(formData);
        } catch (e) {
            IISMethods.errormsg(e.message || 'Invalid JSON', 1);
            return;
        }
        try {
            const res = payload._id
                ? await ApiService.update(ALIAS, payload._id, payload)
                : await ApiService.create(ALIAS, payload);
            if (res.status === 200) {
                IISMethods.successmsg(payload._id ? Config.dataupdated : Config.dataaddedsuccessfully, 2);
                if (res.data) applyLoadedRecord(res.data);
                else await loadSingleSetting();
            } else {
                IISMethods.errormsg(res.message || Config.dataaddedfailed, 1);
            }
        } catch (error) {
            console.error('Error saving storefront sections:', error);
            const msg = error.response?.data?.message || error.message || Config.dataaddedfailed;
            IISMethods.errormsg(msg, 1);
        }
    };

    const handleAddButtonClick = (currentTabIndex) => {
        if (!JsCall.validateRightSidebarForm(getCurrentState().formdata, rightSidebarData, currentTabIndex)) return;
        saveData({ ...getCurrentState().formdata });
    };

    const handleFormData = (type, key, value) => {
        const currentState = getCurrentState();
        const next = { ...currentState.formdata, [key]: value };
        const errors = { ...(currentState.rightSidebarValidationErrors || {}) };
        delete errors[key];
        setProps({
            formdata: IISMethods.getcopy(next),
            rightSidebarValidationErrors: Object.keys(errors).length ? errors : {},
        });
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

export default StorefrontSectionsController;
