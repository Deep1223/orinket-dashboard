import { useEffect } from 'react';
import MasterJson from '../../../config/masterJSON';
import IISMethods from '../../../utils/IISMethods';
import { setProps } from '../../../utils/reduxUtils';
import MasterController from '../../../app/controller/MasterController';

const UserRoleMaster = () => {
    useEffect(() => {
        const data = MasterJson('userrole');
        setProps({ rightsidebarformdata: IISMethods.getcopy(data) });
    }, []);

    return <MasterController />;
};

export default UserRoleMaster;

