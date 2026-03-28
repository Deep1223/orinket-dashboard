'use client';

import React, { useEffect, useState } from 'react';
import ModalRsuite from './modalrsuite';
import { useAppSelector } from '../store/hooks';
import IISMethods from '../utils/IISMethods';
import { FiChevronLeft, FiChevronRight, FiExternalLink, FiX } from 'react-icons/fi';
import { Tooltip, Whisper } from 'rsuite';

const DocumentPreviewModal = (props) => {
  const modalOpen = useAppSelector((state) => state.modal?.[props.modalname]);
  const galleryUrls = Array.isArray(props.galleryUrls) ? props.galleryUrls.filter(Boolean) : [];
  const isGallery = galleryUrls.length > 0;
  const [galleryIndex, setGalleryIndex] = useState(0);

  useEffect(() => {
    if (modalOpen) {
      setGalleryIndex(0);
    }
  }, [modalOpen]);

  const displayUrl = isGallery ? galleryUrls[galleryIndex] : props.fileUrl;
  const isMultiGallery = isGallery && galleryUrls.length > 1;
  const showPrev = isMultiGallery && galleryIndex > 0;
  const showNext = isMultiGallery && galleryIndex < galleryUrls.length - 1;
  const titleBase = props.title || 'Document Preview';
  const titleText =
    isMultiGallery ? `${titleBase} (${galleryIndex + 1} / ${galleryUrls.length})` : titleBase;

  const TooltipWhisper = ({ children, tooltip }) => (
    <Whisper placement="top" controlId="control-id-hover" trigger="hover" speaker={<Tooltip>{tooltip}</Tooltip>}>
      {children}
    </Whisper>
  );

  return (
    <ModalRsuite
      open={modalOpen}
      onClose={() => IISMethods.handleGrid(false, props.modalname, 0)}
      closable={false}
      className="hide-default-close"
      title={
        <div className="d-flex align-items-center justify-content-between w-100 pr-10p">
          <span className="fw-semibold text-16p">{titleText}</span>
          <div className="d-flex align-items-center gap-2">
            {displayUrl && (
              <TooltipWhisper tooltip="Open in New Tab">
                <a 
                  href={displayUrl} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="text-primary d-flex align-items-center justify-content-center"
                  style={{ 
                    textDecoration: 'none', 
                    width: '32px', 
                    height: '32px', 
                    borderRadius: '6px',
                    backgroundColor: '#f8f9fa',
                    border: '1px solid #dee2e6',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = '#e9ecef';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = '#f8f9fa';
                  }}
                >
                  <FiExternalLink style={{ fontSize: '16px' }} />
                </a>
              </TooltipWhisper>
            )}
            <TooltipWhisper tooltip="Close">
              <button
                onClick={() => IISMethods.handleGrid(false, props.modalname, 0)}
                className="d-flex align-items-center justify-content-center border-0 text-white"
                style={{ 
                  width: '32px', 
                  height: '32px', 
                  borderRadius: '6px',
                  backgroundColor: '#dc3545', // bg-danger color
                  transition: 'all 0.2s ease',
                  boxShadow: '0 2px 4px rgba(220, 53, 69, 0.2)'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = '#c82333';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = '#dc3545';
                }}
              >
                <FiX style={{ fontSize: '20px', strokeWidth: '3' }} />
              </button>
            </TooltipWhisper>
          </div>
        </div>
      }
      size="md"
      body={
        <div
          className="text-center position-relative"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#fdfdfd',
            minHeight: '200px',
          }}
        >
          {displayUrl ? (
            isMultiGallery ? (
              <div className="d-flex align-items-center justify-content-center w-100" style={{ gap: 12 }}>
                <div
                  className="d-flex align-items-center justify-content-center flex-shrink-0"
                  style={{ width: 48, height: 48 }}
                >
                  {showPrev ? (
                    <button
                      type="button"
                      onClick={() => setGalleryIndex((i) => Math.max(0, i - 1))}
                      aria-label="Previous image"
                      className="d-flex align-items-center justify-content-center flex-shrink-0"
                      style={{
                        width: 48,
                        height: 48,
                        minWidth: 48,
                        minHeight: 48,
                        padding: 0,
                        borderRadius: '50%',
                        backgroundColor: '#fff',
                        border: '1px solid #dee2e6',
                        boxShadow: '0 1px 4px rgba(0, 0, 0, 0.1)',
                        color: '#212529',
                        cursor: 'pointer',
                      }}
                    >
                      <FiChevronLeft size={24} strokeWidth={2.25} />
                    </button>
                  ) : null}
                </div>
                <div
                  style={{
                    borderRadius: '8px',
                    overflow: 'hidden',
                    border: '1px solid #eee',
                    flex: '1 1 auto',
                    minWidth: 0,
                  }}
                >
                  <img
                    src={displayUrl}
                    alt="Preview"
                    style={{ maxWidth: '100%', maxHeight: '70vh', objectFit: 'contain', display: 'block', margin: '0 auto' }}
                  />
                </div>
                <div
                  className="d-flex align-items-center justify-content-center flex-shrink-0"
                  style={{ width: 48, height: 48 }}
                >
                  {showNext ? (
                    <button
                      type="button"
                      onClick={() => setGalleryIndex((i) => Math.min(galleryUrls.length - 1, i + 1))}
                      aria-label="Next image"
                      className="d-flex align-items-center justify-content-center flex-shrink-0"
                      style={{
                        width: 48,
                        height: 48,
                        minWidth: 48,
                        minHeight: 48,
                        padding: 0,
                        borderRadius: '50%',
                        backgroundColor: '#fff',
                        border: '1px solid #dee2e6',
                        boxShadow: '0 1px 4px rgba(0, 0, 0, 0.1)',
                        color: '#212529',
                        cursor: 'pointer',
                      }}
                    >
                      <FiChevronRight size={24} strokeWidth={2.25} />
                    </button>
                  ) : null}
                </div>
              </div>
            ) : (
              <div
                style={{
                  borderRadius: '8px',
                  overflow: 'hidden',
                  border: '1px solid #eee',
                  maxWidth: '100%',
                }}
              >
                <img
                  src={displayUrl}
                  alt="Preview"
                  style={{ maxWidth: '100%', maxHeight: '70vh', objectFit: 'contain', display: 'block', margin: '0 auto' }}
                />
              </div>
            )
          ) : (
            <div className="text-muted p-4">No preview available</div>
          )}
        </div>
      }
      footer={
        <button
          onClick={() => IISMethods.handleGrid(false, props.modalname, 0)}
          className="btn btn-danger btn-sm px-4"
        >
          Close
        </button>
      }
    />
  );
};

export default DocumentPreviewModal;
