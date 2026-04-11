'use client';

import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import IISMethods from '../../utils/IISMethods';
import { setProps, getCurrentState, getSortData } from '../../utils/reduxUtils';
import { store } from '../../store/store';
import {
    clearFormData,
    clearFilterData,
    clearOldFilterData,
    setGridListData,
    clearPendingShippingSearch,
} from '../../store/reducer';
import MasterView from '../common/MasterView';
import { useAppSelector } from '../../store/hooks';
import JsCall from '../../utils/JsCall';
import Config from '../../config/config';
import ApiService from '../../utils/apiService';
import { SHIPPING_ROUTES } from '../../config/RouteConfig';

const ShippingMasterController = () => {
    const rightSidebarData = useAppSelector((state) => state.rightsidebarformdata);
    const isMounted = useRef(false);
    const abortControllerRef = useRef(null);
    const lastAliasRef = useRef(null);
    const getlistRef = useRef(null);
    const location = useLocation();

    const pendingShippingSearch = useAppSelector((s) => s.pendingShippingSearch);

    const masterdatalist = useAppSelector((s) => s.masterdatalist);
    const masterdata = useAppSelector((s) => s.masterdata);

    const currentRoute = SHIPPING_ROUTES.find((r) => r.path === location.pathname);
    const expectedAlias = currentRoute?.pageKey;
    const sidebarAlias = rightSidebarData?.[0]?.aliasname;

    useEffect(() => {
        isMounted.current = true;

        store.dispatch(clearFilterData());
        store.dispatch(clearOldFilterData());

        setProps({
            data: [],
            formdata: {},
            filterdata: {},
            masterdata: {},
            masterdatalist: {},
            modal: {},
            pageno: 1,
            pagename: '',
            nextpage: 0,
            totalcount: 0,
            pagelimit: 20,
            sortdata: { field: 'createdAt', order: -1 },
            rightSidebarValidationErrors: {},
            loading: { showgridlistshimmer: true },
            bulkaction: '',
            bulkids: [],
            selectall: false,
        });

        return () => {
            isMounted.current = false;
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
            store.dispatch(clearFilterData());
            store.dispatch(clearOldFilterData());
            setProps({
                data: [],
                formdata: {},
                filterdata: {},
                masterdata: {},
                masterdatalist: {},
                modal: {},
                pageno: 1,
                pagename: '',
                nextpage: 0,
                totalcount: 0,
                pagelimit: 20,
                sortdata: { field: 'createdAt', order: -1 },
                rightSidebarValidationErrors: {},
                loading: {},
                rightsidebarformdata: [],
                bulkaction: '',
                bulkids: [],
                selectall: false,
            });
        };
    }, []);

    useEffect(() => {
        const aliasName = sidebarAlias;

        if (aliasName && aliasName !== lastAliasRef.current) {
            lastAliasRef.current = aliasName;
            getlistRef.current = new AbortController();
            abortControllerRef.current = getlistRef.current;

            const getlist = async () => {
                try {
                    setProps({ loading: { showgridlistshimmer: true } });
                    store.dispatch(clearPendingShippingSearch());

                    const response = await JsCall({
                        url: `/api/shipping/${aliasName}`,
                        method: 'GET',
                        signal: getlistRef.current.signal,
                        data: {
                            pageno: getCurrentState().pageno,
                            pagelimit: getCurrentState().pagelimit,
                            searchbar: getCurrentState().filterdata?.searchbar || '',
                            sortdata: getSortData(),
                            filterdata: getCurrentState().filterdata,
                        },
                    });

                    if (response.success) {
                        const { data, pagination } = response;
                        setProps({
                            data: data || [],
                            pageno: pagination?.page || 1,
                            nextpage: pagination?.nextPage || 0,
                            totalcount: pagination?.total || 0,
                            loading: { showgridlistshimmer: false },
                        });
                    } else {
                        setProps({
                            data: [],
                            loading: { showgridlistshimmer: false },
                        });
                        IISMethods.errormsg(response.message || 'Failed to load shipping data', 1);
                    }
                } catch (error) {
                    console.error('Error in getlist:', error);
                    setProps({
                        data: [],
                        loading: { showgridlistshimmer: false },
                    });
                    IISMethods.errormsg('Network error. Please try again.', 1);
                }
            };

            getlist();
        }
    }, [sidebarAlias]);

    const handleSearch = (term) => {
        if (term !== getCurrentState().filterdata?.searchbar) {
            setProps({
                filterdata: { ...getCurrentState().filterdata, searchbar: term },
                pageno: 1,
                nextpage: 0,
            });
        }
    };

    const handleSortChange = (field, order) => {
        setProps({
            sortdata: { field, order },
            pageno: 1,
            nextpage: 0,
        });
    };

    const handlePageChange = (page) => {
        setProps({
            pageno: page,
            nextpage: page < getCurrentState().totalcount / getCurrentState().pagelimit ? page + 1 : 0,
        });
    };

    const handlePageSizeChange = (limit) => {
        setProps({
            pagelimit: limit,
            pageno: 1,
            nextpage: 0,
        });
    };

    const handlescroll = (e) => {
        const element = e.target;
        if (element.scrollHeight - element.scrollTop <= element.clientHeight + 5) {
            const nextPage = getCurrentState().nextpage;
            if (nextPage && !getCurrentState().loading?.showgridlistshimmer) {
                handlePageChange(nextPage);
            }
        }
    };

    const setFormData = async () => {
        setProps({
            formdata: {},
            modal: { addoredit: true },
        });
    };

    const handleFormData = (type, field, value) => {
        setProps({
            formdata: {
                ...getCurrentState().formdata,
                [field]: value,
            },
        });
    };

    const handleDeleteData = async (deleteDetails) => {
        try {
            setProps({ loading: { showdeleteshimmer: true } });

            const response = await JsCall({
                url: `/api/shipping/${sidebarAlias}/${deleteDetails._id}`,
                method: 'DELETE',
            });

            if (response.success) {
                IISMethods.successmsg('Shipping record deleted successfully', 1);
                setProps({
                    modal: {},
                    loading: { showdeleteshimmer: false },
                });
                
                // Refresh list
                const currentEvent = new CustomEvent('refreshList');
                window.dispatchEvent(currentEvent);
            } else {
                setProps({
                    modal: {},
                    loading: { showdeleteshimmer: false },
                });
                IISMethods.errormsg(response.message || 'Failed to delete shipping record', 1);
            }
        } catch (error) {
            console.error('Error in handleDeleteData:', error);
            setProps({
                modal: {},
                loading: { showdeleteshimmer: false },
            });
            IISMethods.errormsg('Network error. Please try again.', 1);
        }
    };

    const handleAddButtonClick = () => {
        setProps({
            formdata: {},
            modal: { addoredit: true },
        });
    };

    const getlist = async () => {
        const currentEvent = new CustomEvent('refreshList');
        window.dispatchEvent(currentEvent);
    };

    // Calculate stats for display
    const stats = {
        totalShipments: masterdatalist?.length || 0,
        pendingShipments: masterdatalist?.filter(s => ['assigned', 'pickup_scheduled'].includes(s.status))?.length || 0,
        inTransitShipments: masterdatalist?.filter(s => ['in_transit', 'out_for_delivery'].includes(s.status))?.length || 0,
        deliveredShipments: masterdatalist?.filter(s => s.status === 'delivered')?.length || 0,
        exceptionShipments: masterdatalist?.filter(s => s.status === 'exception')?.length || 0,
    };

    return (
        <MasterView
            stats={stats}
            handleSearch={handleSearch}
            handleSortChange={handleSortChange}
            setFormData={setFormData}
            handleDeleteData={handleDeleteData}
            getlist={getlist}
            updateData={handleFormData}
            handlePageChange={handlePageChange}
            handlePageSizeChange={handlePageSizeChange}
            handlescroll={handlescroll}
        />
    );
};

export default ShippingMasterController;
