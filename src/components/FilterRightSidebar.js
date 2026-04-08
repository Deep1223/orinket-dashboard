'use client';

import { useAppSelector } from '../store/hooks';
import DrawerRsuite from './DrawerRsuite';
import IISMethods from '../utils/IISMethods';
import { getCurrentState, setProps } from '../utils/reduxUtils';
import { DatePicker, AutoComplete } from 'rsuite';
import SelectPickerRsuite from './SelectPickerRsuite';

const FilterRightSidebar = (props) => {
  const pagename = useAppSelector((state) => state.pagename);
  const filterdata = useAppSelector((state) => state.filterdata);
  const masterdata = useAppSelector((state) => state.masterdata);
  const FilterRightSidebarData = useAppSelector((state) => state.rightsidebarformdata);
  const FilterFormData = IISMethods.getFilterFormData(FilterRightSidebarData);

  const handleFilterData = (type, field, value) => {
    const currentState = getCurrentState();
    const fd = { ...currentState.filterdata };

    if (type === 'datepicker') {
      fd[field] = value ? new Date(value).toISOString() : '';
    } else if (type === 'dropdown') {
      fd[field] = value || '';
    } else {
      fd[field] = value;
    }

    setProps({ filterdata: IISMethods.getcopy(fd) });
  };

  const handleApplyFilter = () => {
    setProps({ oldfilterdata: IISMethods.getcopy(getCurrentState().filterdata), pageno: 1 });
    props.getlist();
    IISMethods.handleGrid(false, 'filterdrawer', 0);
  };

  return (
    <DrawerRsuite
      title={`Filter ${pagename}`}
      body={
        <form
          onSubmit={(e) => e.preventDefault()}
          className="d-flex flex-column h-100 p-3"
        >
          {/* scrollable filter content */}
          <div
            className="border rounded-3 bg-white mb-3"
            style={{
              padding: '12px 12px 8px',
              flex: 1,
              overflowY: 'auto',
            }}
          >
            <div className="row gap-10">
              {FilterFormData.map((item, index) => {
                if (item.filtertype === 'datepicker') {
                  return (
                    <div className="col-12" key={index}>
                      <div className="d-flex flex-column row-gap-1">
                        <label className="label-form-control">{item.label || item.text}</label>
                        <DatePicker
                          defaultValue={
                            filterdata[item.field] ? new Date(filterdata[item.field]) : null
                          }
                          onChange={(value) =>
                            handleFilterData('datepicker', item.field, value)
                          }
                          id={`filter-${item.field}`}
                          name={item.field}
                          placeholder={item.filterplaceholder || `Select ${item.label || item.text}`}
                          style={{ width: '100%' }}
                          size="md"
                          format="yyyy-MM-dd"
                          cleanable
                        />
                      </div>
                    </div>
                  );
                } else if (item.filtertype === 'lookup') {
                  const masterKey = item.storemasterdatabyfield ? item.field : item.masterdata;
                  const suggestions = (masterdata?.[masterKey] || []).map((m) => m.label);
                  return (
                    <div className="col-12" key={index}>
                      <div className="d-flex flex-column row-gap-1">
                        <label className="label-form-control">{item.label || item.text}</label>
                        <AutoComplete
                          data={suggestions}
                          placeholder={item.filterplaceholder || `Enter ${item.label || item.text}`}
                          defaultValue={filterdata[item.field] || ''}
                          onSelect={(value) => handleFilterData('text', item.field, value)}
                          onChange={(value) => handleFilterData('text', item.field, value)}
                          id={`filter-${item.field}`}
                          name={item.field}
                          autoComplete="on"
                        />
                      </div>
                    </div>
                  );
                } else if (item.filtertype === 'dropdown') {
                  return (
                    <div className="col-12" key={index}>
                      <div className="d-flex flex-column row-gap-1">
                        <label className="label-form-control">{item.label || item.text}</label>
                        <SelectPickerRsuite
                          data={
                            item.masterdataarray ||
                            masterdata?.[item.storemasterdatabyfield ? item.field : item.masterdata] ||
                            []
                          }
                          placeholder={item.filterplaceholder || `Select ${item.label || item.text}`}
                          onChange={(value) => handleFilterData('dropdown', item.field, value)}
                          value={filterdata[item.field]}
                          className="col-12 h-35p"
                          id={`filter-${item.field}`}
                          name={item.field}
                        />
                      </div>
                    </div>
                  );
                } else {
                  return (
                    <div className="col-12" key={index}>
                      <div className="d-flex flex-column row-gap-1">
                        <label className="label-form-control">{item.label || item.text}</label>
                        <div className="form-control p-0 rs-auto-complete">
                          <input
                            name={item.field}
                            id={`filter-${item.field}`}
                            type="text"
                            className="rs-input"
                            placeholder={item.placeholder || `Enter ${item.label || item.text}`}
                            defaultValue={filterdata[item.field]}
                            onBlur={(e) =>
                              handleFilterData('text', item.field, e.target.value)
                            }
                            autoComplete="on"
                          />
                        </div>
                      </div>
                    </div>
                  );
                }
              })}
            </div>
          </div>

          {/* footer buttons fixed at bottom of drawer */}
          <div className="d-flex gap-2 justify-content-end">
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => {
                handleApplyFilter();
              }}
            >
              Apply
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => IISMethods.handleGrid(false, 'filterdrawer', 0)}
            >
              Close
            </button>
          </div>
        </form>
      }
    />
  );
};

export default FilterRightSidebar;

