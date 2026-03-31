'use client';

import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import IISMethods from '../../utils/IISMethods';
import { setProps, getCurrentState, getSortData } from '../../utils/reduxUtils';
import { useAppSelector } from '../../store/hooks';
import JsCall from '../../utils/JsCall';
import Config from '../../config/config';
import ApiService from '../../utils/apiService';
import { FLAT_ROUTES } from '../../config/RouteConfig';
import MasterView from '../common/MasterView';

const UserMasterController = () => {
  const rightSidebarData = useAppSelector((state) => state.rightsidebarformdata);
  const isMounted = useRef(false);
  const abortControllerRef = useRef(null);
  const lastAliasRef = useRef(null);
  const location = useLocation();

  const masterdata = useAppSelector((s) => s.masterdata); // Add masterdata selector

  console.log('FLAT_ROUTES => ', FLAT_ROUTES)
  const currentRoute = FLAT_ROUTES.find((r) => r.path === location.pathname);
  const expectedAlias = currentRoute?.pageKey;
  const sidebarAlias = rightSidebarData?.[0]?.aliasname;

  useEffect(() => {
    isMounted.current = true;

    // Initialize props only once on mount
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
      loading: { showgridlistshimmer: true, showgridlistspinner: true },
      bulkaction: '',
      bulkids: [],
      selectall: false,
    });

    return () => {
      isMounted.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      // Clear redux keys on unmount
      setProps({
        data: [],
        formdata: {},
        filterdata: {},
        masterdata: {},
        masterdatalist: {},
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

    // Only proceed if:
    // 1. We have a valid aliasname
    // 2. The component is still mounted
    // 3. The aliasName is different from the last one we processed
    // 4. The aliasName matches the current route (avoids stale Redux state calls)
    if (aliasName && isMounted.current && lastAliasRef.current !== aliasName) {
      if (expectedAlias && aliasName !== expectedAlias) {
        return;
      }

      lastAliasRef.current = aliasName;

      setProps({
        pagename: rightSidebarData?.[0]?.pagename || '',
      });

      getlist(aliasName);

      // Load master data for filter dropdowns/lookups
      rightSidebarData?.forEach((tab) => {
        tab.fields?.forEach((field) => {
          if (
            field.filter === 1 &&
            (field.filtertype === 'dropdown' || field.filtertype === 'lookup') &&
            field.masterdata &&
            !field.masterdataarray &&
            field.masterdata !== aliasName // Avoid duplicate call for the same master
          ) {
            getmasterdata(1, field);
          }
        });
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run when alias changes; getmasterdata/getlist omitted to avoid loops
  }, [sidebarAlias, expectedAlias]);

  const printSelectPicker = (item, fields) => item[fields.masterdatafield || 'name'] || item.name || item._id;

  const getmasterdata = async (page, fields, filter = {}) => {
    if (fields.masterdataarray && fields.masterdataarray.length > 0) {
      return;
    }

    if (fields.dependentfilter) {
      const keys = Object.keys(fields.dependentfilter);
      const filterdata = Object.keys(filter)

      // dependentfilter object empty hai to skip
      if (keys.length === 0 || filterdata.length === 0) {
        return;
      }

      // har key ki value filter me check karo
      const allDependenciesMet = keys.every((key) => {
        const value = filter[key];
        return value !== undefined && value !== null && value !== '';
      });

      if (!allDependenciesMet) {
        return;
      }
    }

    // 1. masterdatadependancy check: if true and no filter provided, skip API call
    if (fields.masterdatadependancy && Object.keys(filter).length === 0) {
      return;
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

    try {
      const result = await ApiService.read(fields.masterdata, {
        pagination: {
          page,
          limit: Number.MAX_SAFE_INTEGER,
        },
        sort: {},
        filters: staticfilter,
        projection,
      });

      if (result.status === 200 && isMounted.current) {
        const data = result.data.map((item) => ({
          label: printSelectPicker(item, fields),
          value: item._id,
        }));

        // 2. storemasterdatabyfield check: use fields.field as key if true, else fields.masterdata
        const masterKey = fields.storemasterdatabyfield ? fields.field : fields.masterdata;

        const currentState = getCurrentState();
        const masterdata = { ...currentState.masterdata, [masterKey]: data };
        const masterdatalist = { ...currentState.masterdatalist, [masterKey]: result.data };

        setProps({ masterdatalist, masterdata });
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

  const setformdata = async (id) => {
    setProps({ rightSidebarValidationErrors: {} });
    let formData = {};
    if (id) {
      const data = IISMethods.getObjectfromArray(getCurrentState().data, '_id', id);
      formData = IISMethods.getcopy(data);
      IISMethods.normalizeMultiImageFieldsInForm(formData, getCurrentState().rightsidebarformdata);
    } else {
      const currentState = getCurrentState();
      formData = { ...currentState.formdata };

      // Generate usercode for new user
      try {
        const usercodeResponse = await ApiService.generateUsercode();
        if (usercodeResponse.success && usercodeResponse.usercode) {
          formData.usercode = usercodeResponse.usercode;
        }
      } catch (error) {
        console.error('Error generating usercode:', error);
      }

      currentState.rightsidebarformdata?.forEach((item) => {
        if (item.fields && Array.isArray(item.fields)) {
          item.fields.forEach((fields) => {
            if (fields.type === 'checkbox') {
              formData[fields.field] = fields.defaultvalue ? 1 : 0;
            } else if (fields.type === 'image') {
              formData[fields.field] = fields.defaultvalue || '';
            } else if (fields.type === 'multipleimage') {
              formData[fields.field] = IISMethods.normalizeImageList(fields.defaultvalue);
            } else if (fields.type === 'tbl-add-button') {
              formData[fields.field] = fields.defaultvalue || [];
            } else if (fields.type === 'datepicker') {
              formData[fields.field] = fields.defaultvalue ? new Date(fields.defaultvalue.toString()).toISOString() : '';
            } else if (fields.field !== 'usercode') {
              formData[fields.field] = fields.defaultvalue;
            }
          });
        }
      });
    }
    setProps({ formdata: IISMethods.getcopy(formData) });

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

    IISMethods.handleGrid(true, 'rightsidebar', 1);
  };

  const handleAddButtonClick = (currentTabIndex) => {
    if (!JsCall.validateRightSidebarForm(getCurrentState().formdata, rightSidebarData, currentTabIndex)) {
      return;
    }

    const formData = { ...getCurrentState().formdata };
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
          const selectedOption = IISMethods.getObjectfromArray(formfield?.masterdataarray, 'value', value);
          formData[formfield?.formdatafield] = value ? (selectedOption?.enumValue || selectedOption?.label || '') : '';
        }
        else {
          formData[formfield?.formdatafield + 'id'] = value ? value : '';
          formData[formfield?.formdatafield] = value ? IISMethods.getObjectfromArray(masterdata[formfield?.storemasterdatabyfield ? formfield?.field : formfield?.masterdata], 'value', value)?.label : '';
        }

        console.log('formfield => ', formfield, 'formData => ', formData, 'key => ', key, 'rightSidebarData => ', rightSidebarData)
      }
      catch (e) {
        console.log('error', e)
      }
    } else if (type === 'tbl-add-button') {
      const tableData = [...(formData[key] || [])];
      if (value === -1) {
        // Add new row
        tableData.push(fieldvalue);
      } else if (fieldtype === 'delete') {
        // Remove row
        tableData.splice(value, 1);
      } else if (fieldtype === null) {
        // UPDATE entire row at index 'value' (used when Edit button clicked)
        if (tableData[value]) {
          tableData[value] = fieldvalue;
        }
      } else {
        // Update specific field in specific row with type-wise handling
        if (tableData[value]) {
          // fieldvalue is expected to be { fieldName: value }
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
      // Handle text, email, password, number, url, tel, color and other basic types
      formData[key] = value;
    }

    // Handle onchangefill and onchangedata
    const fieldConfig = getFieldConfig(key);
    if (fieldConfig) {
      // onchangefill: call dependent field's API
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

      // onchangedata: clear dependent field's value and data
      if (fieldConfig.onchangedata && Array.isArray(fieldConfig.onchangedata)) {
        fieldConfig.onchangedata.forEach((childKey) => {
          const childdata = IISMethods.getObjectfromRightsidebar(rightSidebarData, 'field', childKey);
          formData[childKey] = ''; // Clear value
          formData[childdata?.formdatafield] = '';

          const childConfig = getFieldConfig(childKey);
          if (childConfig) {
            const masterKey = childConfig.storemasterdatabyfield ? childConfig.field : childConfig.masterdata;
            const masterdata = { ...getCurrentState().masterdata, [masterKey]: [] };
            const masterdatalist = { ...getCurrentState().masterdatalist, [masterKey]: [] };
            setProps({ masterdata, masterdatalist });
          }

          if (!formData[fieldConfig.field]) {
            handleFormData(childdata.type, childdata.field, '');
          }
        });
      }
    }

    const nextErrors = { ...(currentState.rightSidebarValidationErrors || {}) };
    delete nextErrors[key];
    setProps({ formdata: IISMethods.getcopy(formData), rightSidebarValidationErrors: Object.keys(nextErrors).length ? nextErrors : {} });

    const newRightSidebarFormData = IISMethods.createRightSidebarData(key, rightSidebarData);
    const newFormData = IISMethods.createFormData(key, value);
    JsCall.ValidateForm(newFormData, newRightSidebarFormData);
  };


  const updateData = async (id, formData) => {
    try {
      const responseData = await ApiService.update(
        getCurrentState().rightsidebarformdata?.[0]?.aliasname,
        id,
        formData
      );

      if (responseData.status === 200 && isMounted.current) {
        IISMethods.successmsg(Config.dataupdated, 2);
        IISMethods.handleGrid(false, 'rightsidebar', 0);
        getlist();
      } else {
        IISMethods.errormsg(responseData.message || Config.dataaddedfailed, 1);
      }
    } catch (error) {
      console.error('Error updating:', error);
    }
  };

  const addData = async (reqData) => {
    try {
      const responseData = await ApiService.create(
        getCurrentState().rightsidebarformdata?.[0]?.aliasname,
        reqData
      );

      if (responseData.status === 200 && isMounted.current) {
        IISMethods.successmsg(Config.dataaddedsuccessfully, 1);
        IISMethods.handleGrid(false, 'rightsidebar', 0);
        getlist();
      } else {
        IISMethods.errormsg(responseData.message || Config.dataaddedfailed, 1);
      }
    } catch (error) {
      console.error('Error adding:', error);
    }
  };

  const getlist = async (forcedAliasName) => {
    if (!isMounted.current) return;

    // Cancel previous request if any
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    try {
      const aliasName = forcedAliasName || getCurrentState().rightsidebarformdata?.[0]?.aliasname;
      if (!aliasName) return;

      let filter = IISMethods.getcopy(getCurrentState().filterdata) || {};
      const sortData = getSortData();

      const searchTerm = filter?.searchbar || '';
      if (filter.hasOwnProperty('searchbar')) {
        delete filter.searchbar;
      }

      Object.keys(filter).forEach((key) => {
        if (filter[key] === '' || filter[key] === null || filter[key] === undefined) {
          delete filter[key];
        }
      });

      setProps({ loading: { showgridlistshimmer: true, showgridlistspinner: true } });

      const result = await ApiService.read(
        aliasName,
        {
          pagination: {
            page: getCurrentState().pageno,
            limit: getCurrentState().pagelimit,
          },
          sort: sortData,
          filters: filter,
          search: searchTerm,
        },
        { signal: abortControllerRef.current.signal }
      );

      if (result && result.data && isMounted.current) {
        const currentState = getCurrentState();
        let updatedBulkids = currentState.bulkids || [];

        if (currentState.selectall) {
          const incomingIds = (result.data || []).map((r) => r._id);
          updatedBulkids = [...new Set([...updatedBulkids, ...incomingIds])];
        }

        setProps({
          data: result.data,
          totalcount: result.totalCount || result.totalcount || 0,
          nextpage: result.hasNextPage ? 1 : 0,
          loading: { showgridlistshimmer: false, showgridlistspinner: false },
          bulkids: updatedBulkids,
        });
      } else if (isMounted.current) {
        setProps({
          data: [],
          totalcount: 0,
          nextpage: 0,
          loading: { showgridlistshimmer: false, showgridlistspinner: false },
        });
      }
    } catch (error) {
      if (error.name === 'AbortError') return;
      console.error('Error loading list:', error);
      if (isMounted.current) {
        setProps({
          loading: { showgridlistshimmer: false, showgridlistspinner: false },
        });
      }
    }
  };

  const handlesort = (field, order) => {
    setProps({
      sortdata: { field, order },
      pageno: 1,
    });
    getlist();
  };

  const handleDeleteData = async (id) => {
    try {
      const currentState = getCurrentState();
      const aliasName = currentState.rightsidebarformdata?.[0]?.aliasname;

      let payload = {};

      // If it's a single delete (from 3-dot menu)
      if (id && !Array.isArray(id)) {
        payload = {
          bulkactionids: [id],
          selectall: false,
          paginationinfo: { filter: {} },
          searchtext: ""
        };
      } else {
        // Bulk delete case
        const filter = IISMethods.getcopy(currentState.filterdata) || {};
        const searchTerm = filter?.searchbar || '';
        if (filter.hasOwnProperty('searchbar')) delete filter.searchbar;

        payload = {
          bulkactionids: currentState.bulkids || [],
          selectall: currentState.selectall || false,
          paginationinfo: { filter: filter },
          searchtext: searchTerm
        };
      }

      const result = await ApiService.delete(aliasName, payload);

      if (result.status === 200) {
        IISMethods.successmsg(Config.datadeleted, 1);
        IISMethods.handleGrid(false, 'deletemodal', 0);
        // Clear bulk actions after successful delete
        setProps({ bulkaction: '', bulkids: [], selectall: false });
        getlist();
      } else {
        IISMethods.errormsg(result.message || Config.dataaddedfailed, 1);
      }
    } catch (error) {
      console.error('Error deleting:', error);
    }
  };

  const handlegloblesearch = (searchTerm) => {
    setProps({ filterdata: { ...getCurrentState().filterdata, searchbar: searchTerm }, pageno: 1 });
    setProps({ oldfilterdata: { ...getCurrentState().filterdata, searchbar: searchTerm } });
    getlist();
  };

  const handlePageChange = (page) => {
    setProps({ pageno: page });
    getlist();
  };

  const handlePageSizeChange = (limit) => {
    setProps({ pagelimit: limit, pageno: 1 });
    getlist();
  };

  return (
    <MasterView
      setFormData={setformdata}
      handleAddButtonClick={handleAddButtonClick}
      handleFormData={handleFormData}
      handleSortChange={handlesort}
      getlist={getlist}
      handleDeleteData={handleDeleteData}
      handleSearch={handlegloblesearch}
      updateData={updateData}
      handlePageChange={handlePageChange}
      handlePageSizeChange={handlePageSizeChange}
    />
  );
};

export default UserMasterController;
