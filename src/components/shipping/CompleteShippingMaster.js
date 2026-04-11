'use client';

import { useState, useEffect } from 'react';
import { useAppSelector } from '../../store/hooks';
import SearchBar from '../../components/SearchBar';
import Config from '../../config/config';
import GridList from '../../app/common/GridList';
import RightSidebar from '../../components/RightSidebar';
import DeleteModal from '../../components/DeleteModal';
import { BiFilterAlt, BiTrash, BiEdit, BiEye, BiInfoCircle } from 'react-icons/bi';
import { IoClose } from 'react-icons/io5';
import IISMethods from '../../utils/IISMethods';
import { setProps } from '../../utils/reduxUtils';
import FilterRightSidebar from '../../components/FilterRightSidebar';
import InfoModal from '../../components/InfoModal';
import FilteredDataBadge from '../../components/FilteredDataBadge';
import NotificationCenter from './NotificationCenter';

const CompleteShippingMaster = (props) => {
    const rightSidebarData = useAppSelector((state) => state.rightsidebarformdata);
    const filterData = useAppSelector((state) => state.filterdata);
    const data = useAppSelector((state) => state.data);
    const loading = useAppSelector((state) => state.loading);
    const pagelimit = useAppSelector((state) => state.pagelimit);
    const totalcount = useAppSelector((state) => state.totalcount);
    const bulkaction = useAppSelector((state) => state.bulkaction);
    const bulkids = useAppSelector((state) => state.bulkids);
    const selectall = useAppSelector((state) => state.selectall);
    const isReadOnly = Boolean(rightSidebarData?.[0]?.readonly);

    const [viewDetails, setViewDetails] = useState({});
    const [deleteDetails, setDeleteDetails] = useState({});
    const [viewInfoData, setViewInfoData] = useState({});
    const [searchTerm, setSearchTerm] = useState(filterData?.searchbar || '');

    // Calculate statistics from data
    const stats = {
        totalShipments: data?.length || 0,
        pendingShipments: data?.filter(s => ['assigned', 'pickup_scheduled'].includes(s.status))?.length || 0,
        inTransitShipments: data?.filter(s => ['in_transit', 'out_for_delivery'].includes(s.status))?.length || 0,
        deliveredShipments: data?.filter(s => s.status === 'delivered')?.length || 0,
        exceptionShipments: data?.filter(s => s.status === 'exception')?.length || 0,
    };

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

    const getStatusBadge = (status) => {
        const statusConfig = {
            assigned: { color: 'blue', label: 'Assigned' },
            pickup_scheduled: { color: 'purple', label: 'Pickup Scheduled' },
            picked_up: { color: 'orange', label: 'Picked Up' },
            in_transit: { color: 'indigo', label: 'In Transit' },
            out_for_delivery: { color: 'teal', label: 'Out for Delivery' },
            delivered: { color: 'green', label: 'Delivered' },
            exception: { color: 'red', label: 'Exception' },
        };

        const config = statusConfig[status] || { color: 'gray', label: status };
        return (
            <span className={`badge bg-${config.color}-100 text-${config.color}-800 px-2 py-1 text-xs font-medium`}>
                {config.label}
            </span>
        );
    };

    const getPriorityBadge = (priority) => {
        const priorityConfig = {
            high: { color: 'red', label: 'High' },
            medium: { color: 'yellow', label: 'Medium' },
            low: { color: 'green', label: 'Low' },
        };

        const config = priorityConfig[priority] || { color: 'gray', label: 'Normal' };
        return (
            <span className={`badge bg-${config.color}-100 text-${config.color}-800 px-2 py-1 text-xs font-medium`}>
                {config.label}
            </span>
        );
    };

    return (
        <div className="master-view d-flex flex-column h-100">
            {/* Header Section */}
            <div className="d-flex align-items-center justify-content-between pb-2">
                <div className="d-flex flex-column">
                    <div className="d-flex align-items-center gap-3">
                        <h1 className="h4 fw-medium text-dark mb-0">{rightSidebarData?.[0]?.pagename || 'Shipping Management'}</h1>
                        <div className="d-flex align-items-center gap-2">
                            <span className="badge bg-primary text-white px-3 py-2">
                                <BiFilterAlt className="me-1" />
                                {stats.totalShipments} Total
                            </span>
                            <span className="badge bg-warning text-white px-3 py-2">
                                <BiFilterAlt className="me-1" />
                                {stats.pendingShipments} Pending
                            </span>
                            <span className="badge bg-info text-white px-3 py-2">
                                <BiFilterAlt className="me-1" />
                                {stats.inTransitShipments} In Transit
                            </span>
                            <span className="badge bg-success text-white px-3 py-2">
                                <BiFilterAlt className="me-1" />
                                {stats.deliveredShipments} Delivered
                            </span>
                            {stats.exceptionShipments > 0 && (
                                <span className="badge bg-danger text-white px-3 py-2">
                                    <BiFilterAlt className="me-1" />
                                    {stats.exceptionShipments} Exception
                                </span>
                            )}
                        </div>
                    </div>
                    <p className="text-muted-foreground mb-0 mt-1">Manage all shipping operations and tracking</p>
                </div>
                <div className="d-flex align-items-center gap-2">
                    {/* Bulk Actions */}
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
                                className="btn btn-outline-primary h-38p text-14 fw-medium shadow-sm px-3 text-nowrap"
                                onClick={() => setProps({ bulkaction: 'deleteaction' })}
                            >
                                <BiTrash className="me-2" />
                                Bulk Action
                            </button>
                        )}
                    </div>
                    
                    {/* Search Bar */}
                    <SearchBar
                        handleSearch={handleSearch}
                        searchTerm={searchTerm}
                        setSearchTerm={handleSetSearchTerm}
                    />
                    
                    {/* Create Button */}
                    {!isReadOnly && (
                        <button
                            className="btn btn-primary shadow-sm"
                            onClick={async () => {
                                await props.setFormData();
                            }}
                        >
                            <BiEdit className="me-2" />
                            {Config.createbtn}
                        </button>
                    )}
                    
                    {/* Filter Button */}
                    <div>
                        <button
                            className="btn btn-primary py-4p px-9p d-flex align-items-center shadow-sm"
                            onClick={() => IISMethods.handleGrid(true, 'filterdrawer', 1)}
                        >
                            <BiFilterAlt className="text-white text-20" />
                        </button>
                    </div>
                    
                    {/* Notification Center */}
                    <NotificationCenter />
                </div>
            </div>

            {/* Filtered Data Badge */}
            <FilteredDataBadge getlist={props.getlist} />

            {/* Main Content Area */}
            <div className="flex-grow-1 d-flex flex-column min-h-0">
                {/* Enhanced Grid List */}
                <div className="bg-white position-relative overflow-hidden mt-2 flex-grow-1 d-flex flex-column min-h-0 h-100 rounded-lg shadow-sm">
                    {/* Table Header */}
                    <div className="bg-light border-bottom p-3">
                        <div className="d-flex align-items-center justify-content-between">
                            <div className="d-flex align-items-center gap-3">
                                <h5 className="mb-0 fw-medium">Shipping Records</h5>
                                <span className="text-muted-foreground text-14">
                                    {totalcount} total records
                                </span>
                            </div>
                            <div className="d-flex align-items-center gap-2">
                                <span className="text-muted-foreground text-14">
                                    Page {Math.ceil(totalcount / pagelimit)} of {Math.ceil(totalcount / pagelimit)}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Table Content */}
                    <div className="overflow-auto flex-grow-1 min-h-0">
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
                </div>
            </div>

            {/* Right Sidebar */}
            <RightSidebar
                handleAddButtonClick={props.handleAddButtonClick}
                handleFormData={props.handleFormData}
                viewDetails={viewDetails}
            />

            {/* Delete Modal */}
            <DeleteModal handleDeleteData={props.handleDeleteData} deleteDetails={deleteDetails} />

            {/* Filter Sidebar */}
            <FilterRightSidebar getlist={props.getlist} />

            {/* Info Modal */}
            <InfoModal viewInfoData={viewInfoData} />
        </div>
    );
};

export default CompleteShippingMaster;
