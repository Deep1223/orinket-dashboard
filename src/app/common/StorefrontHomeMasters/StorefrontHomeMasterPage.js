import { useEffect } from 'react';
import MasterJson from '../../../config/masterJSON';
import IISMethods from '../../../utils/IISMethods';
import { setProps } from '../../../utils/reduxUtils';
import MasterController from '../../controller/MasterController';

const StorefrontHomeMasterPage = ({ alias }) => {
    useEffect(() => {
        const data = MasterJson(alias);
        setProps({ rightsidebarformdata: IISMethods.getcopy(data) });
    }, [alias]);

    return <MasterController />;
};

export default StorefrontHomeMasterPage;
