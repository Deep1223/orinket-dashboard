'use client';

import { useState, useEffect, useRef } from 'react';
import { BsThreeDotsVertical } from 'react-icons/bs';
import { FaRegEdit, FaInfoCircle } from 'react-icons/fa';
import { RiDeleteBin6Line } from 'react-icons/ri';
import { IoEyeOutline } from 'react-icons/io5';
import { TbGridDots } from 'react-icons/tb';
import { Placeholder } from 'rsuite';
import { setProps } from '../../utils/reduxUtils';
import NoDataFound from '../../components/NoDataFound';
import Pagination from '../../components/Pagination';
import { useAppSelector } from '../../store/hooks';
import IISMethods from '../../utils/IISMethods';
import { getCurrentState, getSortData } from '../../utils/reduxUtils';
import ModalRsuite from '../../components/modalrsuite';
import DocumentPreviewModal from '../../components/DocumentPreviewModal';
import { Tooltip, Whisper } from 'rsuite';
import { TextView, DropdownView, CheckBoxView, ColorPickerView, TextAreaView, DatePickerView, ImageView, RadioView, MultipleImageView } from '../../components';

const TooltipWhisper = ({ children, tooltip }) => (
  <Whisper placement="top" controlId="control-id-hover" trigger="hover" speaker={<Tooltip>{tooltip}</Tooltip>}>
    {children}
  </Whisper>
);

const ThreeDotMenu = (props) => {
  return (
    <div
      ref={props.dropdownRef}
      className="dropdown-menu show position-absolute shadow-lg border rounded-3 border-radius-4 top-32 w-200p"
      onMouseEnter={(e) => e.stopPropagation()}
      onMouseLeave={(e) => e.stopPropagation()}
    >
      {!props.readOnly && !props.data.defaultdata && (
        <>
          <button
            className="dropdown-item d-flex align-items-center gap-2 py-2 border-bottom"
            onClick={async () => {
              await props.setFormData(props.data._id);
              props.setDropdownOpen(null);
            }}
          >
            <FaRegEdit /> Edit
          </button>

          <button
            className="dropdown-item d-flex align-items-center gap-2 py-2 border-bottom"
            onClick={async () => {
              props.setDeleteDetails(props.data);
              IISMethods.handleGrid(true, 'deletemodal', 1);
              props.setDropdownOpen(null);
            }}
          >
            <RiDeleteBin6Line /> Delete
          </button>
        </>
      )}

      <button
        className="dropdown-item d-flex align-items-center gap-2 py-2 border-bottom"
          onClick={async () => {
            props.setViewDetails(props.data);
            props.setDropdownOpen(null);
            IISMethods.handleGrid(true, 'viewdetails', 1);
          }}
        >
          <IoEyeOutline /> View Details
        </button>

      <button
        className="dropdown-item d-flex align-items-center gap-2 py-2"
        onClick={async () => {
          props.setViewInfoData(props.data);
          props.setDropdownOpen(null);
          IISMethods.handleGrid(true, 'viewInfodatamodal', 1);
        }}
      >
        <FaInfoCircle /> Info
      </button>
    </div>
  );
};

const GridList = (props) => {
  const pagename = useAppSelector((state) => state.pagename);
  const rightSidebarData = useAppSelector((state) => state.rightsidebarformdata);
  const isReadOnly = Boolean(rightSidebarData?.[0]?.readonly);
  const data = useAppSelector((state) => state.data);
  const loading = useAppSelector((state) => state.loading);
  const pagelimit = useAppSelector((state) => state.pagelimit);
  const totalcount = useAppSelector((state) => state.totalcount);
  const bulkaction = useAppSelector((state) => state.bulkaction);
  const bulkids = useAppSelector((state) => state.bulkids);
  const selectall = useAppSelector((state) => state.selectall);

  const fieldOrder = IISMethods.getGridFieldOrder(rightSidebarData);
  const [dropdownOpen, setDropdownOpen] = useState(null);
  const dropdownRef = useRef(null);
  const [sortState, setSortState] = useState({});
  const [sortedData, setSortedData] = useState([]);
  const [textareaValue, setTextareaValue] = useState('');
  const [previewImage, setPreviewImage] = useState({ url: '', title: '' });

  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setDropdownOpen(null);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  });

  useEffect(() => {
    let updatedData = [];

    if (props.filtereddata && Array.isArray(props.filtereddata) && props.filtereddata.length > 0) {
      updatedData = [...props.filtereddata];
    } else if (
      props.filtereddata &&
      Array.isArray(props.filtereddata.data) &&
      props.filtereddata.data.length > 0
    ) {
      updatedData = [...props.filtereddata.data];
    } else if (Array.isArray(data) && data.length > 0) {
      updatedData = [...data];
    } else {
      updatedData = [];
    }

    const currentSortData = getSortData();

    if (
      updatedData.length > 0 &&
      currentSortData.field &&
      (currentSortData.order === 1 || currentSortData.order === -1)
    ) {
      updatedData.sort((a, b) => {
        const field = currentSortData.field;
        const order = currentSortData.order;
        let valA = a[field];
        let valB = b[field];

        if (valA == null && valB == null) return 0;
        if (valA == null) return order === 1 ? 1 : -1;
        if (valB == null) return order === 1 ? -1 : 1;

        if (field === 'createdAt' || field === 'updatedAt' || field === 'recordinfo.createat' || field === 'recordinfo.updateat') {
          valA = new Date(valA);
          valB = new Date(valB);
        } else if (typeof valA === 'string') {
          valA = valA.toLowerCase();
          valB = valB.toLowerCase();
        }

        if (valA < valB) return order === 1 ? -1 : 1;
        if (valA > valB) return order === 1 ? 1 : -1;
        return 0;
      });
    }

    setSortedData(updatedData);
  }, [props.filtereddata, data, loading]);

  useEffect(() => {
    const currentSortData = getSortData();
    if (!currentSortData.field) {
      setSortState({});
      return;
    }

    setSortState({
      [currentSortData.field]:
        currentSortData.order === 1
          ? 'asc'
          : currentSortData.order === -1
            ? 'desc'
            : 'none',
    });
  }, []);

  const toggleDropdown = (index) => {
    setDropdownOpen(dropdownOpen === index ? null : index);
  };

  const toggleSort = (fieldName) => {
    const currentSortData = getSortData();
    let newOrder;

    if (currentSortData.field === fieldName) {
      if (currentSortData.order === 1) {
        newOrder = -1;
      } else if (currentSortData.order === -1) {
        newOrder = 0;
      } else {
        newOrder = 1;
      }
    } else {
      newOrder = 1;
    }

    setSortState({
      [fieldName]: newOrder === 1 ? 'asc' : newOrder === -1 ? 'desc' : 'none',
    });

    if (props.handleSortChange) {
      props.handleSortChange(fieldName, newOrder);
    }
  };

  const onChangeCheckbox = (type, field, value, id, rowData, index) => {
    props.handleFormData(type, field, value);
    const updatedData = { ...rowData, [field]: value };
    props.updateData(id, updatedData, index);
  };

  const currentState = getCurrentState();
  const hasPageName = Boolean(pagename);
  const showInitialShimmer = !hasPageName;
  const showPaginationShimmer =
    (currentState.nextpage &&
      (currentState.pageno * currentState.pagelimit !== currentState.data?.length)) ||
    (props.showGridlistShimmer && hasPageName);
  const showNoData =
    currentState.data?.length === 0 &&
    hasPageName &&
    !showPaginationShimmer &&
    !showInitialShimmer;

  return (
    <div className="d-flex flex-column h-100">
      <section className="table-section flex-grow-1 d-flex flex-column min-h-0">
        <div className="bg-white position-relative table-custom overflow-hidden mt-2 flex-grow-1 d-flex flex-column min-h-0 h-100p">
          <div className="overflow-x-auto flex-grow-1 min-h-0">
            <div
              className="overflow-x-auto overflow-y-auto table-content grid-table-scroll bg-white shadow table-custom border h-100"
              onScroll={props.handleScroll}
            >
              <table className="table table-striped table-hover w-100">
                <thead className="table-light border-bottom position-sticky top-0 z-1 z-index-2">
                  <tr>
                    <th className="px-3 py-2 min-w-0 tbl-w-50p text-center">
                      {!Boolean(pagename) ? (
                        <Placeholder.Grid rows={1} columns={1} active={true} className='h-10p p-0 w-100' />
                      ) : (
                        <div className="d-flex justify-content-center align-items-center">
                          <TbGridDots className="text-secondary fs-5" />
                        </div>
                      )}
                    </th>
                    {bulkaction === 'deleteaction' && (
                      <th className="px-2 py-2 min-w-0 tbl-w-80p text-center">
                        {!Boolean(pagename) ? (
                          <Placeholder.Grid rows={1} columns={1} active={true} className='h-10p p-0 w-40p mx-auto' />
                        ) : (
                          <div className="d-flex justify-content-center align-items-center gap-2">
                            <input
                              type="checkbox"
                              className="form-check-input cursor-pointer m-0 w-16p h-16p"
                              checked={
                                currentState.data?.length > 0 &&
                                currentState.data.filter(r => !r.defaultdata).every((row) => bulkids.includes(row._id))
                              }
                              onChange={(e) => {
                                const checked = e.target.checked;
                                
                                if (checked) {
                                  // Add only non-default page IDs to bulkids and set selectall to true
                                  const nonDefaultIds = (currentState.data || []).filter(r => !r.defaultdata).map(r => r._id);
                                  const newBulkids = [...new Set([...bulkids, ...nonDefaultIds])];
                                  setProps({ selectall: true, bulkids: newBulkids });
                                } else {
                                  // If unchecking "Select All", remove only current page IDs from bulkids
                                  const currentPageIds = (currentState.data || []).map(r => r._id);
                                  const newBulkids = bulkids.filter(id => !currentPageIds.includes(id));
                                  setProps({ selectall: false, bulkids: newBulkids });
                                }
                              }}
                            />
                            <span className="text-14 fw-medium text-secondary">All</span>
                          </div>
                        )}
                      </th>
                    )}
                    {!Boolean(pagename) ? (
                      <th className="px-4 py-2">
                        <Placeholder.Grid rows={1} columns={1} active={true} className='h-10p p-0 w-100' />
                      </th>
                    ) : (
                      fieldOrder.map((field, index) => (
                        <th
                          key={index}
                          className={`px-4 pt-12p pb-12p ${field.tablesize} cursor-pointer`}
                          onClick={field.sorting ? () => toggleSort((field.type === 'dropdown' || field.type === 'multiselect') ? field.formdatafield : field.field) : undefined}
                        >
                          <div className="d-flex justify-content-between align-items-center w-100">
                            <span className="text-14">{field.text}</span>
                            {field.sorting && (
                              <TooltipWhisper
                                tooltip={
                                  sortState[(field.type === 'dropdown' || field.type === 'multiselect') ? field.formdatafield : field.field] === 'asc'
                                    ? 'Ascending'
                                    : sortState[(field.type === 'dropdown' || field.type === 'multiselect') ? field.formdatafield : field.field] === 'desc'
                                      ? 'Descending'
                                      : 'No Sort'
                                }
                              >
                                <span className="d-inline-flex align-items-center">
                                  {
                                  sortState[(field.type === 'dropdown' || field.type === 'multiselect') ? field.formdatafield : field.field] === 'asc' ? (
                                    <i className="fi fi-rr-sort-alpha-up text-primary text-14" />
                                  ) : sortState[(field.type === 'dropdown' || field.type === 'multiselect') ? field.formdatafield : field.field] === 'desc' ? (
                                    <i className="fi fi-rr-sort-alpha-down-alt text-primary text-14" />
                                  ) : (
                                    <i className="fi fi-rr-sort-alt text-secondary text-14" />
                                  )}
                                </span>
                              </TooltipWhisper>
                            )}
                          </div>
                        </th>
                      ))
                    )}
                  </tr>
                </thead>
                <tbody className="position-relative z-index-1">
                  {
                    currentState.data?.map((row, index) => {
                      return (
                        <tr
                          key={index}
                          className="border-bottom position-relative"
                          style={{ height: 'auto' }}
                        >
                          <td className="px-3 py-1 text-center position-relative">
                            <TooltipWhisper tooltip="Actions">
                              <button
                                onClick={() => toggleDropdown(index)}
                                className="btn btn-outline-secondary btn-sm p-1 d-flex align-items-center justify-content-center h-30p w-30p"
                              >
                                <BsThreeDotsVertical />
                              </button>
                            </TooltipWhisper>

                            {dropdownOpen === index && (
                              <ThreeDotMenu
                                dropdownRef={dropdownRef}
                                setDropdownOpen={setDropdownOpen}
                                setModalDeleteOpen={props.setModalDeleteOpen}
                                setModalViewOpen={props.setModalViewOpen}
                                setViewDetails={props.setViewDetails}
                                handleDeleteData={props.handleDeleteData}
                                setFormData={props.setFormData}
                                data={row}
                                setDeleteDetails={props.setDeleteDetails}
                                setViewInfoData={props.setViewInfoData}
                                pageKey={rightSidebarData?.[0]?.aliasname}
                                readOnly={isReadOnly}
                              />
                            )}
                          </td>

                          {bulkaction === 'deleteaction' && (
                            <td className="px-3 py-1 text-center tbl-w-80p">
                              {!Boolean(pagename) ? (
                                <Placeholder.Grid rows={1} columns={1} active={true} className='h-10p p-0 w-40p mx-auto' />
                              ) : row.defaultdata ? (
                                <div className="h-100"></div>
                              ) : (
                                <div className="d-flex justify-content-center align-items-center h-100">
                                  <input
                                    type="checkbox"
                                    className="form-check-input cursor-pointer m-0 w-16p h-16p"
                                    checked={bulkids.includes(row._id)}
                                    onChange={(e) => {
                                      const checked = e.target.checked;
                                      
                                      if (selectall) {
                                        // If global select all is on, and we uncheck one, 
                                        // turn off selectall and keep other items in bulkids
                                        const otherCurrentPageIds = (currentState.data || [])
                                          .filter(r => r._id !== row._id && !r.defaultdata)
                                          .map(r => r._id);
                                        const newBulkids = [...new Set([...bulkids, ...otherCurrentPageIds])];
                                        setProps({ selectall: false, bulkids: newBulkids });
                                        return;
                                      }

                                      let newSelectedIds = [...bulkids];
                                      if (checked) {
                                        if (!newSelectedIds.includes(row._id)) {
                                          newSelectedIds.push(row._id);
                                        }
                                      } else {
                                        newSelectedIds = newSelectedIds.filter((id) => id !== row._id);
                                      }
                                      setProps({ bulkids: newSelectedIds });
                                    }}
                                  />
                                </div>
                              )}
                            </td>
                          )}

                          {fieldOrder.map((field, idx) => (
                            <td key={idx} className={`px-3 py-1 align-middle ${field.size}`}>
                              {(field.type === 'text' || field.type === 'number') && (
                                <TextView 
                                  row={row}
                                  field={field}
                                  idx={idx}
                                />
                              )}
                              {field.type === 'dropdown' && (
                                <DropdownView 
                                  row={row}
                                  field={field}
                                />
                              )}
                              {field.type === 'checkbox' && (
                                <CheckBoxView 
                                  row={row}
                                  field={field}
                                  onChangeCheckbox={onChangeCheckbox}
                                  index={index}
                                />
                              )}
                              {field.type === 'colorpicker' && (
                                <ColorPickerView 
                                  row={row}
                                  field={field}
                                />
                              )}
                              {field.type === 'textarea' && (
                                <TextAreaView 
                                  row={row}
                                  field={field}
                                  setTextareaValue={setTextareaValue}
                                />
                              )}
                              {field.type === 'datepicker' && (
                                <DatePickerView 
                                  row={row}
                                  field={field}
                                />
                              )}
                              {field.type === 'image' && (
                                <ImageView 
                                  row={row}
                                  field={field}
                                  setPreviewImage={setPreviewImage}
                                />
                              )}
                              {field.type === 'radio' && (
                                <RadioView row={row} field={field} />
                              )}
                              {field.type === 'multipleimage' && (
                                <MultipleImageView
                                  row={row}
                                  field={field}
                                  setPreviewImage={setPreviewImage}
                                />
                              )}
                            </td>
                          ))}
                        </tr>
                      )
                    })
                  }

                  {/* when page name is empty */}
                  <tr className={showInitialShimmer ? "shimmer-effect-row" : "d-none"}>
                    <td className="px-3 py-1 min-w-0 tbl-w-50p text-center"><Placeholder.Grid rows={1} columns={1} active={true} className='h-10p p-0 w-30p mx-auto' /></td>
                    {bulkaction === 'deleteaction' && (
                      <td className="px-3 py-1 min-w-0 tbl-w-80p text-center"><Placeholder.Grid rows={1} columns={1} active={true} className='h-10p p-0 w-40p mx-auto' /></td>
                    )}
                    <td><Placeholder.Graph active={true} className='h-10p p-0 w-100' /></td>
                  </tr>
                  <tr className={showInitialShimmer ? "shimmer-effect-row" : "d-none"}>
                    <td className="px-3 py-1 min-w-0 tbl-w-50p text-center"><Placeholder.Grid rows={1} columns={1} active={true} className='h-10p p-0 w-30p mx-auto' /></td>
                    {bulkaction === 'deleteaction' && (
                      <td className="px-3 py-1 min-w-0 tbl-w-80p text-center"><Placeholder.Grid rows={1} columns={1} active={true} className='h-10p p-0 w-40p mx-auto' /></td>
                    )}
                    <td><Placeholder.Graph active={true} className='h-10p p-0 w-100' /></td>
                  </tr>
                  {/* when page name is empty */}

                  {/* pagination shimmer */}
                  {/* when getlist called showGridlistShimmer will be true to show shimmer */}
                  <tr className={showPaginationShimmer ? "shimmer-effect-row" : "d-none"}>
                    <td className="px-3 py-1 min-w-0 tbl-w-50p text-center"><Placeholder.Grid rows={1} columns={1} active={true} className='h-10p p-0 w-30p mx-auto' /></td>
                    {bulkaction === 'deleteaction' && (
                      <td className="px-3 py-1 min-w-0 tbl-w-80p text-center"><Placeholder.Grid rows={1} columns={1} active={true} className='h-10p p-0 w-40p mx-auto' /></td>
                    )}
                    {fieldOrder.map((field, index) => (
                      <td key={index} className={field.tablesize}><Placeholder.Grid rows={1} columns={1} active={true} className='h-10p p-0 w-100' /></td>
                    ))}
                  </tr>

                  <tr className={showPaginationShimmer ? "shimmer-effect-row" : "d-none"}>
                    <td className="px-3 py-1 min-w-0 tbl-w-50p text-center"><Placeholder.Grid rows={1} columns={1} active={true} className='h-10p p-0 w-30p mx-auto' /></td>
                    {bulkaction === 'deleteaction' && (
                      <td className="px-3 py-1 min-w-0 tbl-w-80p text-center"><Placeholder.Grid rows={1} columns={1} active={true} className='h-10p p-0 w-40p mx-auto' /></td>
                    )}
                    {fieldOrder.map((field, index) => (
                      <td key={index} className={field.tablesize}><Placeholder.Grid rows={1} columns={1} active={true} className='h-10p p-0 w-100' /></td>
                    ))}
                  </tr>

                  <tr className={showPaginationShimmer ? "shimmer-effect-row" : "d-none"}>
                    <td className="px-3 py-1 min-w-0 tbl-w-50p text-center"><Placeholder.Grid rows={1} columns={1} active={true} className='h-10p p-0 w-30p mx-auto' /></td>
                    {bulkaction === 'deleteaction' && (
                      <td className="px-3 py-1 min-w-0 tbl-w-80p text-center"><Placeholder.Grid rows={1} columns={1} active={true} className='h-10p p-0 w-40p mx-auto' /></td>
                    )}
                    {fieldOrder.map((field, index) => (
                      <td key={index} className={field.tablesize}><Placeholder.Grid rows={1} columns={1} active={true} className='h-10p p-0 w-100' /></td>
                    ))}
                  </tr>
                  {/* pagination shimmer */}


                  {/* if get list already called && shimmer is not showing && there is no data && pagename is there */}
                  {
                    showNoData ?
                      <tr>
                        <td colSpan={50}>
                          <NoDataFound />
                        </td>
                      </tr>
                      :
                      <></>
                  }
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <Pagination
          totalCount={totalcount}
          showingCount={sortedData.length}
          pageSize={pagelimit}
          onPageSizeChange={props.handlePageSizeChange}
          loading={loading?.showgridlistspinner}
        />
      </section>

      <ModalRsuite
        open={getCurrentState().modal?.viewtextareamodal}
        onClose={() => {
          IISMethods.handleGrid(false, 'viewtextareamodal', 0);
          setTextareaValue('');
        }}
        title="View Textarea"
        body={
          <div className="col-12">
            {textareaValue}
          </div>
        }
        footer={
          <div className="d-flex justify-content-end">
            <button
              className="btn btn-secondary"
              onClick={() => {
                IISMethods.handleGrid(false, 'viewtextareamodal', 0);
                setTextareaValue('');
              }}
            >
              Close
            </button>
          </div>
        }
      />

      <DocumentPreviewModal
        modalname="previewimage"
        fileUrl={previewImage.url}
        title={previewImage.title}
      />
    </div>
  );
};

export default GridList;
