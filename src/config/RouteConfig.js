// src/config/RouteConfig.jsx
import Login from '../pages/Login';
import Signup from '../pages/Signup';
import Dashboard from '../pages/Dashboard';
import { FLAT_ROUTES_META } from './flatRoutesMeta';
import AllMaster from '../app/common/AllMaster/AllMaster';
import Category from '../pages/Category';
import UserMaster from '../app/common/usermaster/UserMaster';
import UserRoleMaster from '../app/common/UserRole/UserRoleMaster';
import ModuleMaster from '../app/common/ModuleMaster/ModuleMaster';
import SeriesMaster from '../app/common/SeriesMaster/SeriesMaster';
import CountryMaster from '../app/common/CountryMaster/CountryMaster';
import CityMaster from '../app/common/CityMaster/CityMaster';
import StateMaster from '../app/common/StateMaster/StateMaster';
import IconMaster from '../app/common/IconMaster/IconMaster';
import MenuMaster from '../app/common/MenuMaster/MenuMaster';
import MenuAssign from '../app/common/MenuAssign/MenuAssign';
import SeriesAssignMaster from '../app/common/SeriesAssignMaster/SeriesAssignMaster';
import ProductMaster from '../app/common/ProductMaster/ProductMaster';
import SubCategoryMaster from '../app/common/SubCategoryMaster/SubCategoryMaster';
import GeneralSetting from '../app/common/GeneralSetting/GeneralSetting';
import StorefrontHomepageMaster from '../app/common/StorefrontHomepageMaster/StorefrontHomepageMaster';
import StorefrontSectionsMaster from '../app/common/StorefrontSectionsMaster/StorefrontSectionsMaster';
import StorefrontDemifineMaster from '../app/common/StorefrontDemifineMaster/StorefrontDemifineMaster';
import StorefrontTopStylesMaster from '../app/common/StorefrontTopStylesMaster/StorefrontTopStylesMaster';
import StorefrontDiscountBannerMaster from '../app/common/StorefrontDiscountBannerMaster/StorefrontDiscountBannerMaster';
import StorefrontShopByRecipientMaster from '../app/common/StorefrontShopByRecipientMaster/StorefrontShopByRecipientMaster';
import StorefrontForEveryYouMaster from '../app/common/StorefrontForEveryYouMaster/StorefrontForEveryYouMaster';
import StorefrontFineGoldMaster from '../app/common/StorefrontFineGoldMaster/StorefrontFineGoldMaster';
import StorefrontDeserveToShineMaster from '../app/common/StorefrontDeserveToShineMaster/StorefrontDeserveToShineMaster';
import StorefrontFounderMessageMaster from '../app/common/StorefrontFounderMessageMaster/StorefrontFounderMessageMaster';
import StorefrontBlogSectionMaster from '../app/common/StorefrontBlogSectionMaster/StorefrontBlogSectionMaster';
import StorefrontShopWithConfidenceMaster from '../app/common/StorefrontShopWithConfidenceMaster/StorefrontShopWithConfidenceMaster';
import StorefrontBrandStoryMaster from '../app/common/StorefrontBrandStoryMaster/StorefrontBrandStoryMaster';
import StorefrontReviewsMaster from '../app/common/StorefrontReviewsMaster/StorefrontReviewsMaster';
import StorefrontCtaBannerMaster from '../app/common/StorefrontCtaBannerMaster/StorefrontCtaBannerMaster';
import StorefrontVisitStoresMaster from '../app/common/StorefrontVisitStoresMaster/StorefrontVisitStoresMaster';

/* ── Auth routes (no layout) ── */
export const AUTH_ROUTES = [
    { path: '/', component: Login },
    { path: '/login', component: Login },
    { path: '/signup', component: Signup },
];

const COMPONENT_BY_PATH = {
    '/dashboard': Dashboard,
    '/allmaster': AllMaster,
    '/menumaster': MenuMaster,
    '/iconmaster': IconMaster,
    '/modulemaster': ModuleMaster,
    '/menuassignmaster': MenuAssign,
    '/seriesassignmaster': SeriesAssignMaster,
    '/category': Category,
    '/usermaster': UserMaster,
    '/userrole': UserRoleMaster,
    '/seriesmaster': SeriesMaster,
    '/countrymaster': CountryMaster,
    '/citymaster': CityMaster,
    '/statemaster': StateMaster,
    '/productmaster': ProductMaster,
    '/subcategorymaster': SubCategoryMaster,
    '/generalsetting': GeneralSetting,
    '/storefronthomepage': StorefrontHomepageMaster,
    '/storefrontsections': StorefrontSectionsMaster,
    '/demifinemaster': StorefrontDemifineMaster,
    '/top-styles-master': StorefrontTopStylesMaster,
    '/discount-banner-master': StorefrontDiscountBannerMaster,
    '/shop-by-recipient-master': StorefrontShopByRecipientMaster,
    '/for-every-you-master': StorefrontForEveryYouMaster,
    '/fine-gold-master': StorefrontFineGoldMaster,
    '/deserve-to-shine-master': StorefrontDeserveToShineMaster,
    '/founder-message-master': StorefrontFounderMessageMaster,
    '/blog-section-master': StorefrontBlogSectionMaster,
    '/shop-with-confidence-master': StorefrontShopWithConfidenceMaster,
    '/brand-story-master': StorefrontBrandStoryMaster,
    '/reviews-master': StorefrontReviewsMaster,
    '/cta-banner-master': StorefrontCtaBannerMaster,
    '/visit-stores-master': StorefrontVisitStoresMaster,
};

/* ── Flat app routes ── */
export const FLAT_ROUTES = FLAT_ROUTES_META.map((r) => ({
    ...r,
    component: COMPONENT_BY_PATH[r.path],
}));
