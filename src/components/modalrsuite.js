'use client';

import { Modal } from 'rsuite';

const CommonModal = (props) => {
  return (
    <Modal
      open={props.open}
      onClose={props.onClose}
      size={props.size}
      backdrop={props.backdrop}
      keyboard={props.keyboard}
      closable={props.closable}
      className={props.className}
    >
      <Modal.Header className={props.headerClassName}>
        <Modal.Title>{props.title}</Modal.Title>
      </Modal.Header>
      <Modal.Body className={props.bodyClassName}>{props.body}</Modal.Body>
      <Modal.Footer className={props.footerClassName}>{props.footer}</Modal.Footer>
    </Modal>
  );
};

export default CommonModal;

