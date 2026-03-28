// src/config/RouteConfig.jsx
import Login from '../pages/Login';
import Signup from '../pages/Signup';
import Dashboard from '../pages/Dashboard';
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

/* ── Auth routes (no layout) ── */
export const AUTH_ROUTES = [
    { path: '/', component: Login },
    { path: '/login', component: Login },
    { path: '/signup', component: Signup },
];

/* ── Flat app routes ── */
export const FLAT_ROUTES = [
    { path: '/dashboard', pageKey: null, label: 'Home', showInSidebar: true, component: Dashboard },
    { path: '/allmaster', pageKey: null, label: 'All Masters', showInSidebar: false, component: AllMaster },
    { path: '/menumaster', pageKey: 'menumaster', label: 'Menu Master', component: MenuMaster },
    { path: '/iconmaster', pageKey: 'iconmaster', label: 'Icon Master', component: IconMaster },
    { path: '/modulemaster', pageKey: 'modulemaster', label: 'Module Master', component: ModuleMaster },
    { path: '/menuassignmaster', pageKey: 'menuassignmaster', label: 'Menu Assign', component: MenuAssign },
    { path: '/seriesassignmaster', pageKey: 'seriesassignmaster', label: 'Series Assign', component: SeriesAssignMaster },
    { path: '/category', pageKey: 'category', label: 'Category', component: Category },
    { path: '/usermaster', pageKey: 'usermaster', label: 'User Master', component: UserMaster },
    { path: '/userrole', pageKey: 'userrole', label: 'User Role', component: UserRoleMaster },
    { path: '/seriesmaster', pageKey: 'seriesmaster', label: 'Series Master', component: SeriesMaster },
    { path: '/countrymaster', pageKey: 'countrymaster', label: 'Country Master', component: CountryMaster },
    { path: '/citymaster', pageKey: 'citymaster', label: 'City Master', component: CityMaster },
    { path: '/statemaster', pageKey: 'statemaster', label: 'State Master', component: StateMaster },
    { path: '/productmaster', pageKey: 'productmaster', label: 'Product Master', component: ProductMaster },
    { path: '/subcategorymaster', pageKey: 'subcategorymaster', label: 'Sub Category Master', component: SubCategoryMaster },
];