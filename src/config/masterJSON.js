import CategoryMasterJson from '../app/common/CategoryMaster/CategoryMasterJson';
import MenuMasterJson from '../app/common/MenuMaster/MenuMasterJson';
import UserMasterJson from '../app/common/usermaster/UserMasterJson';
import UserRoleJson from '../app/common/UserRole/UserRoleJson';
import SeriesMasterJson from '../app/common/SeriesMaster/SeriesMasterJson';
import CountryMasterJson from '../app/common/CountryMaster/CountryMasterJson';
import CityMasterJson from '../app/common/CityMaster/CityMasterJson';
import StateMasterJson from '../app/common/StateMaster/StateMasterJson';
import IconMasterJson from '../app/common/IconMaster/IconMasterJson';
import ModuleMasterJson from '../app/common/ModuleMaster/ModuleMasterJson';
import MenuAssignJson from '../app/common/MenuAssign/MenuAssignMasterJson';
import SeriesAssignJson from '../app/common/SeriesAssignMaster/SeriesAssignMasterJson';
import ProductMasterJson from '../app/common/ProductMaster/ProductMasterJson';
import SubCategoryMasterJson from '../app/common/SubCategoryMaster/SubCategoryMasterJson';

const MasterJson = (type) => {
  switch (type) {
    case 'category':
      return CategoryMasterJson;
    case 'menumaster':
      return MenuMasterJson;
    case 'usermaster':
      return UserMasterJson;
    case 'userrole':
      return UserRoleJson;
    case 'seriesmaster':
      return SeriesMasterJson;
    case 'countrymaster':
      return CountryMasterJson;
    case 'citymaster':
      return CityMasterJson;
    case 'statemaster':
      return StateMasterJson;
    case 'iconmaster':
      return IconMasterJson;
    case 'modulemaster':
      return ModuleMasterJson;
    case 'menuassignmaster':
      return MenuAssignJson;
    case 'seriesassignmaster':
      return SeriesAssignJson;
    case 'productmaster':
      return ProductMasterJson;
    case 'subcategorymaster':
      return SubCategoryMasterJson;
    default:
      return [];
  }
};

export default MasterJson;
