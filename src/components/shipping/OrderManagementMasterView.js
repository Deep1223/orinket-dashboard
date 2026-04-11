'use client';

import { useState, useEffect } from 'react';
import { useAppSelector } from '../../store/hooks';
import SearchBar from '../../components/SearchBar';
import Config from '../../config/config';
import GridList from '../../app/common/GridList';
import RightSidebar from '../../components/RightSidebar';
import DeleteModal from '../../components/DeleteModal';
import { BiFilterAlt, BiTrash } from 'react-icons/bi';
import { IoClose } from 'react-icons/io5';
import IISMethods from '../../utils/IISMethods';
import { setProps } from '../../utils/reduxUtils';
import FilterRightSidebar from '../../components/FilterRightSidebar';
import InfoModal from '../../components/InfoModal';
import FilteredDataBadge from '../../components/FilteredDataBadge';
import NotificationCenter from './NotificationCenter';

const OrderManagementMasterView = (props) => {
  const rightSidebarData = useAppSelector((state) => state.rightsidebarformdata);
  const filterData = useAppSelector((state) => state.filterdata);
  const isReadOnly = Boolean(rightSidebarData?.[0]?.readonly);

  const [viewDetails, setViewDetails] = useState({});
  const [deleteDetails, setDeleteDetails] = useState({});
  const [viewInfoData, setViewInfoData] = useState({});
  const [searchTerm, setSearchTerm] = useState(filterData?.searchbar || '');

  const bulkaction = useAppSelector((state) => state.bulkaction);
  const bulkids = useAppSelector((state) => state.bulkids);
  const selectall = useAppSelector((state) => state.selectall);

  useEffect(() => {
    setSearchTerm(filterData?.searchbar || '');
  }, [filterData?.searchbar]);

  const handleSearch = (term) => {
    setSearchTerm(term);
    props.handleSearch(term);
  };

  const handleSetSearchTerm = (term) => {
    setSearchTerm(term);
  };

  return (
    <div className="master-view d-flex flex-column h-100">
      <div className="d-flex align-items-center justify-content-between pb-2">
        <div className="d-flex align-items-center gap-3">
          <h1 className="h4 fw-medium text-dark">{rightSidebarData?.[0]?.pagename || 'Order Management'}</h1>
          <div className="d-flex align-items-center gap-2">
            <span className="badge bg-primary text-white px-2 py-1">
              {props.stats?.totalOrders || 0} Total Orders
            </span>
            <span className="badge bg-warning text-white px-2 py-1">
              {props.stats?.pendingOrders || 0} Pending
            </span>
            <span className="badge bg-info text-white px-2 py-1">
              {props.stats?.confirmedOrders || 0} Confirmed
            </span>
            <span className="badge bg-success text-white px-2 py-1">
              {props.stats?.deliveredOrders || 0} Delivered
            </span>
          </div>
        </div>
        <div className="d-flex align-items-center gap-2">
          <div className="d-flex align-items-center gap-1">
            {isReadOnly ? null : bulkaction === 'deleteaction' ? (
              <>
                <button
                  className="btn btn-danger py-4p px-9p d-flex align-items-center h-38p shadow-sm"
                  onClick={() => {
                    const hasSelection = (bulkids?.length > 0) || selectall;
                    if (hasSelection) {
                      IISMethods.handleGrid(true, 'deletemodal', 1);
                    } else {
                      IISMethods.errormsg('Please select at least one record to delete.', 1);
                    }
                  }}
                  title="Confirm Bulk Delete"
                >
                  <BiTrash className="text-white text-20" />
                </button>
                <button
                  className="btn btn-outline-secondary py-4p px-9p d-flex align-items-center h-38p border-radius-4 shadow-sm bg-white border-light"
                  onClick={() => setProps({ bulkaction: '', bulkids: [] })}
                  title="Cancel Bulk Action"
                >
                  <IoClose className="text-secondary text-20" />
                </button>
              </>
            ) : (
              <button
                className="btn btn-primary h-38p text-14 fw-medium shadow-sm px-3 text-nowrap"
                onClick={() => setProps({ bulkaction: 'deleteaction' })}
              >
                Bulk Action
              </button>
            )}
          </div>
          <SearchBar
            handleSearch={handleSearch}
            searchTerm={searchTerm}
            setSearchTerm={handleSetSearchTerm}
          />
          {!isReadOnly && (
            <button
              className="btn btn-primary"
              onClick={async () => {
                await props.setFormData();
              }}
            >
              {Config.createbtn}
            </button>
          )}
          <div>
            <button
              className="btn btn-primary py-4p px-9p d-flex align-items-center"
              onClick={() => IISMethods.handleGrid(true, 'filterdrawer', 1)}
            >
              <BiFilterAlt className="text-white text-20" />
            </button>
          </div>
          <NotificationCenter />
        </div>
      </div>

      <FilteredDataBadge getlist={props.getlist} />

      <div className="flex-grow-1 d-flex flex-column min-h-0">
        <GridList
          setViewDetails={setViewDetails}
          handleSortChange={props.handleSortChange}
          setFormData={props.setFormData}
          handleDeleteData={props.handleDeleteData}
          setDeleteDetails={setDeleteDetails}
          setViewInfoData={setViewInfoData}
          handleFormData={props.handleFormData}
          updateData={props.updateData}
          handlePageChange={props.handlePageChange}
          handlePageSizeChange={props.handlePageSizeChange}
          handleScroll={props.handlescroll}
        />
      </div>

      <RightSidebar
        handleAddButtonClick={props.handleAddButtonClick}
        handleFormData={props.handleFormData}
        viewDetails={viewDetails}
      />

      <DeleteModal handleDeleteData={props.handleDeleteData} deleteDetails={deleteDetails} />

      <FilterRightSidebar getlist={props.getlist} />

      <InfoModal viewInfoData={viewInfoData} />
    </div>
  );
};

export default OrderManagementMasterView;
