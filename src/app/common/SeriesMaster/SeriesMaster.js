'use client';

import { useEffect } from 'react';
import MasterJson from '../../../config/masterJSON';
import IISMethods from '../../../utils/IISMethods';
import { setProps } from '../../../utils/reduxUtils';
import SeriesMasterController from '../../controller/SeriesMasterController';

const SeriesMaster = () => {
  useEffect(() => {
    const data = MasterJson('seriesmaster');
    setProps({ rightsidebarformdata: IISMethods.getcopy(data) });
  }, []);

  return <SeriesMasterController />;
};

export default SeriesMaster;

