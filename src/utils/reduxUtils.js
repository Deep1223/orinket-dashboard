import { store } from '../store/store';

// Basic Redux helpers, adapted from stock-dashboard

export const getCurrentState = () => store.getState();

export const getSortData = () => {
  const state = getCurrentState();
  return state?.sortdata
};

export const setProps = (props) => {
  const { 
    setData, setRightSidebarFormData, setDataFormData, setFilterData, 
    setOldFilterData, setMasterData, setMasterDataList, setPageNo, 
    setPageName, setNextPage, setLoginInfo, setDataLoading, setDataError, 
    setModal, setTotalCount, setPageLimit, setSortData, setFirstErrorTabIndex, 
    setRightSidebarValidationErrors, setBulkAction, setBulkIds, setSelectAll,
    setLastEditedDataIndex, setGridListData
  } = require('../store/reducer');

  if (props.pageno !== undefined) store.dispatch(setPageNo(props.pageno));
  if (props.rightsidebarformdata !== undefined) store.dispatch(setRightSidebarFormData(props.rightsidebarformdata));
  if (props.formdata !== undefined) store.dispatch(setDataFormData(props.formdata));
  if (props.filterdata !== undefined) store.dispatch(setFilterData(props.filterdata));
  if (props.oldfilterdata !== undefined) store.dispatch(setOldFilterData(props.oldfilterdata));
  if (props.masterdata !== undefined) store.dispatch(setMasterData(props.masterdata));
  if (props.masterdatalist !== undefined) store.dispatch(setMasterDataList(props.masterdatalist));
  if (props.data !== undefined) store.dispatch(setData(props.data));
  if (props.pagename !== undefined) store.dispatch(setPageName(props.pagename));
  if (props.nextpage !== undefined) store.dispatch(setNextPage(props.nextpage));
  if (props.logininfo !== undefined) store.dispatch(setLoginInfo(props.logininfo));
  if (props.loading !== undefined) store.dispatch(setDataLoading(props.loading));
  if (props.error !== undefined) store.dispatch(setDataError(props.error));
  if (props.modal !== undefined) store.dispatch(setModal(props.modal));
  if (props.totalcount !== undefined) store.dispatch(setTotalCount(props.totalcount));
  if (props.pagelimit !== undefined) store.dispatch(setPageLimit(props.pagelimit));
  if (props.sortdata !== undefined) store.dispatch(setSortData(props.sortdata));
  if (props.firstErrorTabIndex !== undefined) store.dispatch(setFirstErrorTabIndex(props.firstErrorTabIndex));
  if (props.rightSidebarValidationErrors !== undefined) store.dispatch(setRightSidebarValidationErrors(props.rightSidebarValidationErrors));
  if (props.bulkaction !== undefined) store.dispatch(setBulkAction(props.bulkaction));
  if (props.bulkids !== undefined) store.dispatch(setBulkIds(props.bulkids));
  if (props.selectall !== undefined) store.dispatch(setSelectAll(props.selectall));
  if (props.lastEditedDataIndex !== undefined) store.dispatch(setLastEditedDataIndex(props.lastEditedDataIndex));
  if (props.setGridListData !== undefined) store.dispatch(setGridListData(props.setGridListData));
};

export const clearData = () => {
  const { clearData: clearDataAction } = require('../store/reducer');
  store.dispatch(clearDataAction());
};
