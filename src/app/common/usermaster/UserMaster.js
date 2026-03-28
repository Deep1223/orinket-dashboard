'use client';

import { useEffect } from 'react';
import MasterJson from '../../../config/masterJSON';
import IISMethods from '../../../utils/IISMethods';
import { setProps } from '../../../utils/reduxUtils';
import UserMasterController from '../../controller/UserMasterController';

const UserMaster = () => {
  useEffect(() => {
    const data = MasterJson('usermaster');
    setProps({ rightsidebarformdata: IISMethods.getcopy(data) });
  }, []);

  return (
    <div className="h-100 d-flex flex-column min-h-0 overflow-hidden">
      <UserMasterController />
    </div>
  );
};

export default UserMaster;
