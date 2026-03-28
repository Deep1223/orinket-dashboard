// src/components/DrawerRsuite.jsx
'use client';

import { Drawer } from 'rsuite';
import IISMethods from '../utils/IISMethods';
import { useAppSelector } from '../store/hooks';

const DrawerRsuite = (props) => {
  const modal = useAppSelector((state) => state.modal);

  // props.modalname se custom key lo, fallback 'filterdrawer'
  const modalname = props.modalname || 'filterdrawer';
  const isOpen = !!modal[modalname];

  return (
    <Drawer
      open={isOpen}
      onClose={() => IISMethods.handleGrid(false, modalname, 0)}
      size={props.size || 'xs'}
    >
      {
        props.removeheader ?
          <></>
          :
          <Drawer.Header>
            <Drawer.Title>{props.title}</Drawer.Title>
          </Drawer.Header>
      }
      <Drawer.Body className={`${props.bodyClassName}`}>{props.body}</Drawer.Body>
    </Drawer>
  );
};

export default DrawerRsuite;