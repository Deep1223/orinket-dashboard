import { createSlice } from '@reduxjs/toolkit';

const dataSlice = createSlice({
  name: 'data',
  initialState: {
    data: [],
    rightsidebarformdata: [],
    formdata: {},
    filterdata: {},
    oldfilterdata: {},
    masterdata: [],
    masterdatalist: [],
    pageno: 1,
    pagename: '',
    nextpage: 0,
    logininfo: {},
    loading: {},
    error: null,
    modal: {},
    totalcount: 0,
    pagelimit: 10,
    sortdata: { field: 'recordinfo.createat', order: -1 },
    firstErrorTabIndex: null,
    rightSidebarValidationErrors: {},
    bulkaction: '',
    bulkids: [],
    selectall: false,
    lastEditedDataIndex: -1,
  },
  reducers: {
    setBulkAction: (state, action) => { state.bulkaction = action.payload; },
    setBulkIds: (state, action) => { state.bulkids = action.payload; },
    setSelectAll: (state, action) => { state.selectall = action.payload; },
    setData: (state, action) => {
      const incomingData = Array.isArray(action.payload) ? action.payload : [];

      if (state.pageno > 1) {
        if (incomingData.length === 0) {
          return;
        }
        state.data = [...(Array.isArray(state.data) ? state.data : []), ...incomingData];
        return;
      }

      state.data = incomingData;
    },
    setRightSidebarFormData: (state, action) => { state.rightsidebarformdata = action.payload; },
    setDataFormData: (state, action) => { state.formdata = { ...state.formdata, ...action.payload }; },
    setFilterData: (state, action) => { state.filterdata = { ...state.filterdata, ...action.payload }; },
    setOldFilterData: (state, action) => { state.oldfilterdata = { ...state.oldfilterdata, ...action.payload }; },
    setMasterData: (state, action) => { state.masterdata = { ...state.masterdata, ...action.payload }; },
    setMasterDataList: (state, action) => { state.masterdatalist = { ...state.masterdatalist, ...action.payload }; },
    setPageNo: (state, action) => { state.pageno = action.payload; },
    setPageName: (state, action) => { state.pagename = action.payload; },
    setNextPage: (state, action) => { state.nextpage = action.payload; },
    setLoginInfo: (state, action) => { 
      state.logininfo = { ...state.logininfo, ...action.payload }; 
    },
    clearData: (state) => {
      state.data = []; state.formdata = {}; state.filterdata = {};
    },
    clearFormData: (state) => { state.formdata = {}; },
    clearFilterData: (state) => { state.filterdata = {}; },
    clearOldFilterData: (state) => { state.oldfilterdata = {}; },
    setDataLoading: (state, action) => { state.loading = { ...state.loading, ...action.payload }; },
    setDataError: (state, action) => { state.error = action.payload; },
    clearDataError: (state) => { state.error = null; },
    setModal: (state, action) => { state.modal = { ...state.modal, ...action.payload }; },
    setTotalCount: (state, action) => { state.totalcount = action.payload; },
    setPageLimit: (state, action) => { state.pagelimit = action.payload; },
    setSortData: (state, action) => { state.sortdata = action.payload; },
    clearSortData: (state) => { state.sortdata = { field: 'recordinfo.createat', order: -1 }; },
    setFirstErrorTabIndex: (state, action) => { state.firstErrorTabIndex = action.payload; },
    setRightSidebarValidationErrors: (state, action) => { state.rightSidebarValidationErrors = action.payload || {}; },
    setLastEditedDataIndex: (state, action) => { state.lastEditedDataIndex = action.payload; },
    setEditeDataIndex: (state, action) => { state.editeDataIndex = action.payload; },
    setGridListData: (state, action) => {
      if (action.payload?.data) {
        state.data = action.payload.data;
      }
    },
  },
});

const rootReducer = dataSlice.reducer;

export const {
  setData, setRightSidebarFormData, setDataFormData, setFilterData,
  setOldFilterData, setMasterData, setMasterDataList, setPageNo,
  setPageName, setNextPage, setLoginInfo, clearData, clearFormData,
  clearFilterData, clearOldFilterData, setDataLoading, setDataError,
  clearDataError, setModal, setTotalCount, setPageLimit, setSortData,
  clearSortData, setFirstErrorTabIndex, setRightSidebarValidationErrors,
  setBulkAction, setBulkIds, setSelectAll, setLastEditedDataIndex,
  setEditeDataIndex, setGridListData,
} = dataSlice.actions;

export default rootReducer;
