'use client';

import { IoIosClose } from 'react-icons/io';
import { useAppSelector } from '../store/hooks';
import IISMethods from '../utils/IISMethods';
import { getCurrentState, setProps } from '../utils/reduxUtils';

const FilteredDataBadge = (props) => {
  const oldfilterdata = useAppSelector((state) => state.oldfilterdata);
  const rightSidebarData = useAppSelector((state) => state.rightsidebarformdata);

  const handleRemoveFilter = (item) => {
    const currentState = getCurrentState();
    const filterData = { ...currentState.filterdata };
    filterData[item.field] = '';
    setProps({ filterdata: IISMethods.getcopy(filterData) });
    setProps({ oldfilterdata: IISMethods.getcopy(filterData) });
    props.getlist();
  };

  const applied = IISMethods.getFilteredData(oldfilterdata, rightSidebarData);

  return (
    <div className="filter-display d-flex flex-wrap gap-2 mb-2 px-1">
      {applied.length > 0 &&
        applied.map((item, index) => (
          <div 
            key={index}
            className="d-flex align-items-center bg-primary bg-opacity-10 border border-primary border-opacity-25 px-2 py-1 shadow-sm"
            style={{ 
              transition: 'all 0.2s ease',
              borderRadius: '4px',
              gap: '6px'
            }}
          >
            <span 
              className="text-uppercase text-primary fw-bold fw-bold text-12 text-primary text-12">
              {item.text} :
            </span>
            <span className="text-dark fw-medium text-12">
              {item.value}
            </span>
            <span 
              className="d-flex align-items-center justify-content-center cursor-pointer rounded-circle"
              style={{ 
                width: '16px', 
                height: '16px', 
                backgroundColor: 'rgba(220, 53, 69, 0.1)',
                color: '#dc3545',
                transition: 'all 0.2s ease',
                marginLeft: '2px'
              }}
              onClick={() => handleRemoveFilter(item)}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = '#dc3545';
                e.currentTarget.style.color = '#fff';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(220, 53, 69, 0.1)';
                e.currentTarget.style.color = '#dc3545';
              }}
            >
              <IoIosClose size={16} />
            </span>
          </div>
        ))}
    </div>
  );
};

export default FilteredDataBadge;

