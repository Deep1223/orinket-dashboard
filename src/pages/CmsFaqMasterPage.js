import { useEffect } from 'react';
import MasterJson from '../config/masterJSON';
import IISMethods from '../utils/IISMethods';
import { setProps } from '../utils/reduxUtils';
import MasterController from '../app/controller/MasterController';

const CmsFaqMasterPage = () => {
    useEffect(() => {
        const data = MasterJson('cmsfaq');
        setProps({ rightsidebarformdata: IISMethods.getcopy(data) });
    }, []);

    return <MasterController />;
};

export default CmsFaqMasterPage;
