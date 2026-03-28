"use client";

import { useState, useEffect } from 'react';
import { FiAlertTriangle } from 'react-icons/fi';
import Modal from './modalrsuite';
import IISMethods from '../utils/IISMethods';
import Config from '../config/config';
import { useAppSelector } from '../store/hooks';
import { getCurrentState } from '../utils/reduxUtils';

const DeleteModal = (props) => {
  const modalData = useAppSelector((s) => s.modal);
  const [stage, setStage] = useState(1);
  const [confirmText, setConfirmText] = useState('');
  const [isButtonEnabled, setIsButtonEnabled] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const confirmPhrase = 'DELETE';

  const bulkaction = useAppSelector((state) => state.bulkaction);
  const bulkids = useAppSelector((state) => state.bulkids);

  const isBulkDelete = Array.isArray(props.deleteDetails) || (bulkaction === 'deleteaction' && (bulkids?.length > 0));

  useEffect(() => {
    if (stage === 2) {
      setIsButtonEnabled(confirmText.toUpperCase() === confirmPhrase);
    }
  }, [confirmText, stage]);

  const handleDeleteClose = () => {
    IISMethods.handleGrid(false, 'deletemodal', 0);
    setStage(1);
    setConfirmText('');
    setIsButtonEnabled(false);
  };

  const handleNextStage = () => setStage(2);

  const handleInputChange = (e) => {
    setConfirmText(e.target.value.toUpperCase());
  };

  return (
    <Modal
      open={getCurrentState().modal?.deletemodal}
      onClose={handleDeleteClose}
      title={
        <div className="d-flex align-items-center">
          <FiAlertTriangle className="me-2 text-danger" size={22} />
          <h3 className="fs-5 fw-semibold text-dark mb-0">
            {stage === 1 ? 'Confirm Deletion' : 'Final Confirmation Required'}
          </h3>
        </div>
      }
      body={
        stage === 1 ? (
          <p className="text-secondary mb-0">
            {isBulkDelete
              ? `Are you sure you want to delete ${
                  Array.isArray(props.deleteDetails)
                    ? props.deleteDetails.length
                    : (bulkids?.length || 0)
                } items? This action cannot be undone.`
              : 'Are you sure you want to delete this item? This action cannot be undone.'}
          </p>
        ) : (
          <div className="mb-3">
            <p className="text-secondary">
              To confirm, type <strong>{confirmPhrase}</strong> below:
            </p>
            <input
              type="text"
              value={confirmText}
              onChange={handleInputChange}
              className="form-control text-uppercase"
              placeholder="Type confirmation phrase"
              autoFocus
            />
          </div>
        )
      }
      footer={
        <div className="d-flex justify-content-end gap-2">
          <button onClick={handleDeleteClose} className="btn btn-light text-dark">
            {Config.cancelbtn}
          </button>
          {stage === 1 ? (
            <button onClick={handleNextStage} className="btn btn-danger text-white">
              {Config.continuebtn}
            </button>
          ) : (
            <button
              onClick={() => {
                if (isBulkDelete) {
                  props.handleDeleteData(bulkids);
                } else {
                  props.handleDeleteData(props.deleteDetails._id);
                }
                setStage(1);
                setConfirmText('');
              }}
              disabled={!isButtonEnabled || isDeleting}
              className={`btn ${
                isButtonEnabled ? 'btn-danger text-white' : 'btn-secondary text-light disabled'
              }`}
            >
              {isDeleting ? 'Deleting...' : Config.deletebtn}
            </button>
          )}
        </div>
      }
    />
  );
};

export default DeleteModal;

