'use client';

import { useAppSelector } from '../store/hooks';
import IISMethods from '../utils/IISMethods';
import ModalRsuite from './modalrsuite';
import { FaPlusCircle, FaEdit, FaClock, FaUserCircle } from 'react-icons/fa';

const InfoModal = (props) => {
  const pagename = useAppSelector((state) => state.pagename);
  const modalData = useAppSelector((state) => state.modal);

  const recordinfo = props.viewInfoData?.recordinfo;

  const InfoRow = ({ icon: Icon, label, user, time, colorClass }) => (
    <div className="d-flex align-items-center gap-3 mb-3 p-3 rounded border border-light-subtle bg-light shadow-sm">
      <div
        className={`p-2 rounded-circle ${colorClass} bg-opacity-10 d-flex align-items-center justify-content-center`}
        style={{ width: '45px', height: '45px', flexShrink: 0 }}
      >
        <Icon className={`${colorClass.replace('bg-', 'text-')}`} size={20} />
      </div>
      <div className="flex-grow-1 overflow-hidden">
        <span
          className="text-uppercase text-muted fw-bold mb-1 d-block"
          style={{ fontSize: '0.65rem', letterSpacing: '0.05em' }}
        >
          {label}
        </span>
        <div className="d-flex flex-column gap-1">
          <span className="fw-semibold text-dark text-14p d-flex align-items-center gap-2">
            <FaUserCircle className="text-secondary opacity-50" size={14} />
            {user || '-'}
          </span>
          {time && (
            <span
              className="text-muted d-flex align-items-center gap-1"
              style={{ fontSize: '0.8rem' }}
            >
              <FaClock className="opacity-50" size={12} />
              {IISMethods.getDateTimeFormate(time)}
            </span>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <ModalRsuite
      open={modalData.viewInfodatamodal}
      onClose={() => IISMethods.handleGrid(false, 'viewInfodatamodal', 0)}
      title={`Info ${pagename}`}
      body={
        <div className="px-1 py-2">
          <InfoRow
            icon={FaPlusCircle}
            label="Created By"
            user={recordinfo?.createby}
            time={recordinfo?.createat}
            colorClass="bg-success"
          />
          <InfoRow
            icon={FaEdit}
            label="Last Updated By"
            user={recordinfo?.updateby || '-'}
            time={recordinfo?.updateat}
            colorClass="bg-primary"
          />
        </div>
      }
      footer={
        <button
          onClick={() => IISMethods.handleGrid(false, 'viewInfodatamodal', 0)}
          className="btn btn-secondary px-4 fw-medium border-radius-4"
        >
          Close
        </button>
      }
    />
  );
};

export default InfoModal;

