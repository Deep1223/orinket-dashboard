'use client';

import { useEffect } from 'react';
import MasterJson from '../../../config/masterJSON';
import IISMethods from '../../../utils/IISMethods';
import { setProps } from '../../../utils/reduxUtils';
import MasterController from '../../controller/MasterController';

const SeriesAssignMaster = () => {
  useEffect(() => {
    const data = MasterJson('seriesassignmaster');
    setProps({ rightsidebarformdata: IISMethods.getcopy(data) });
  }, []);

  return <MasterController />;
};

export default SeriesAssignMaster;

