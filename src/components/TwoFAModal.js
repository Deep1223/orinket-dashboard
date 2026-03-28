"use client";

import { FaLock, FaUnlock, FaExclamationTriangle } from 'react-icons/fa';
import Modal from './modalrsuite';

const TwoFAModal = ({ isOpen, type, onConfirm, onCancel }) => {
  const isEnable = type === 'enable';

  return (
    <Modal
      open={isOpen}
      onClose={onCancel}
      size="sm"
      backdrop="static"
      keyboard={false}
      title={
        <div className="d-flex align-items-center">
          <div className={`me-3 p-2 rounded-2 ${isEnable ? 'bg-success bg-opacity-10' : 'bg-danger bg-opacity-10'}`}>
            {isEnable ? (
              <FaLock className="text-success" size={20} />
            ) : (
              <FaUnlock className="text-danger" size={20} />
            )}
          </div>
          <div>
            <h5 className="mb-0 fw-semibold">
              {isEnable ? 'Enable two-factor authentication' : 'Disable two-factor authentication'}
            </h5>
          </div>
        </div>
      }
      body={
        <div>
          <p className="text-secondary mb-3">
            {isEnable
              ? 'Add an extra layer of security to your account by requiring a code from your authenticator app on every login.'
              : 'Removing 2FA will make your account less secure. You will only need your password to sign in.'}
          </p>
          
          {isEnable && (
            <div className="alert alert-warning d-flex align-items-start" role="alert">
              <FaExclamationTriangle className="me-2 mt-1 flex-shrink-0" size={16} />
              <div>
                <strong>Important:</strong> You will need an authenticator app like Google Authenticator or Authy. A QR code will be shown after confirmation.
              </div>
            </div>
          )}
          
          {!isEnable && (
            <div className="alert alert-danger d-flex align-items-start" role="alert">
              <FaExclamationTriangle className="me-2 mt-1 flex-shrink-0" size={16} />
              <div>
                <strong>Warning:</strong> Your account will be less secure without 2FA. Consider this carefully before disabling.
              </div>
            </div>
          )}
        </div>
      }
      footer={
        <div className="d-flex justify-content-end gap-2">
          <button 
            onClick={onCancel} 
            className="btn btn-light text-dark"
          >
            Cancel
          </button>
          <button 
            onClick={onConfirm}
            className={`btn ${isEnable ? 'btn-success' : 'btn-danger'} text-white`}
          >
            {isEnable ? 'Enable 2FA' : 'Disable 2FA'}
          </button>
        </div>
      }
    />
  );
};

export default TwoFAModal;
