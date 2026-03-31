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
import GeneralSettingMasterJson from '../app/common/GeneralSetting/GeneralSettingMasterJson';
import StorefrontHomepageMasterJson from '../app/common/StorefrontHomepageMaster/StorefrontHomepageMasterJson';
import StorefrontDemifineMasterJson from '../app/common/StorefrontDemifineMaster/StorefrontDemifineMasterJson';
import StorefrontTopStylesMasterJson from '../app/common/StorefrontTopStylesMaster/StorefrontTopStylesMasterJson';
import StorefrontDiscountBannerMasterJson from '../app/common/StorefrontDiscountBannerMaster/StorefrontDiscountBannerMasterJson';
import StorefrontShopByRecipientMasterJson from '../app/common/StorefrontShopByRecipientMaster/StorefrontShopByRecipientMasterJson';
import StorefrontForEveryYouMasterJson from '../app/common/StorefrontForEveryYouMaster/StorefrontForEveryYouMasterJson';
import StorefrontFineGoldMasterJson from '../app/common/StorefrontFineGoldMaster/StorefrontFineGoldMasterJson';
import StorefrontDeserveToShineMasterJson from '../app/common/StorefrontDeserveToShineMaster/StorefrontDeserveToShineMasterJson';
import StorefrontFounderMessageMasterJson from '../app/common/StorefrontFounderMessageMaster/StorefrontFounderMessageMasterJson';
import StorefrontBlogSectionMasterJson from '../app/common/StorefrontBlogSectionMaster/StorefrontBlogSectionMasterJson';
import StorefrontShopWithConfidenceMasterJson from '../app/common/StorefrontShopWithConfidenceMaster/StorefrontShopWithConfidenceMasterJson';
import StorefrontBrandStoryMasterJson from '../app/common/StorefrontBrandStoryMaster/StorefrontBrandStoryMasterJson';
import StorefrontReviewsMasterJson from '../app/common/StorefrontReviewsMaster/StorefrontReviewsMasterJson';
import StorefrontCtaBannerMasterJson from '../app/common/StorefrontCtaBannerMaster/StorefrontCtaBannerMasterJson';
import StorefrontVisitStoresMasterJson from '../app/common/StorefrontVisitStoresMaster/StorefrontVisitStoresMasterJson';

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
    case 'generalsetting':
      return GeneralSettingMasterJson;
    case 'storefronthomepage':
      return StorefrontHomepageMasterJson;
    case 'storefrontdemifinemaster':
      return StorefrontDemifineMasterJson;
    case 'storefronttopstylesmaster':
      return StorefrontTopStylesMasterJson;
    case 'storefrontdiscountbannermaster':
      return StorefrontDiscountBannerMasterJson;
    case 'storefrontshopbyrecipientmaster':
      return StorefrontShopByRecipientMasterJson;
    case 'storefrontforeveryyoumaster':
      return StorefrontForEveryYouMasterJson;
    case 'storefrontfinegoldmaster':
      return StorefrontFineGoldMasterJson;
    case 'storefrontdeservetoshinemaster':
      return StorefrontDeserveToShineMasterJson;
    case 'storefrontfoundermessagemaster':
      return StorefrontFounderMessageMasterJson;
    case 'storefrontblogsectionmaster':
      return StorefrontBlogSectionMasterJson;
    case 'storefrontshopwithconfidencemaster':
      return StorefrontShopWithConfidenceMasterJson;
    case 'storefrontbrandstorymaster':
      return StorefrontBrandStoryMasterJson;
    case 'storefrontreviewsmaster':
      return StorefrontReviewsMasterJson;
    case 'storefrontctabannermaster':
      return StorefrontCtaBannerMasterJson;
    case 'storefrontvisitstoresmaster':
      return StorefrontVisitStoresMasterJson;
    default:
      return [];
  }
};

export default MasterJson;
