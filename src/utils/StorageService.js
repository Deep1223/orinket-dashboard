import { getCookie, setCookie, removeCookie } from './cookieUtils';

const LOGIN_INFO_COOKIE_KEY = 'loginInfo';

let _reduxStore = null;

// Store inject karo — index.js mein call karo
export const injectStore = (store) => {
    _reduxStore = store;
};

const StorageService = {

    setAuth(token, userid, userrole, email) {
        // Token is no longer stored in localStorage for security (HttpOnly Cookies).
        // All auth data is now managed via cookies and Redux store
    },

    getRememberedEmail() {
        // localStorage removed - email should be managed via backend
        return null;
    },

    clearAuth() {
        // Token cookie will be cleared by backend if we have a logout endpoint, 
        // or we can manually clear a non-HttpOnly login flag here.
        // localStorage items removed - using cookies instead
        this.clearLoginInfoCookie();
    },

    clearRememberedEmail() {
        // localStorage removed - email should be managed via backend
    },

    setLoginInfoCookie(loginInfo) {
        if (loginInfo && typeof document !== 'undefined') {
            setCookie(LOGIN_INFO_COOKIE_KEY, loginInfo);
        }
    },

    getLoginInfoFromCookie() {
        if (typeof document === 'undefined') return null;
        return getCookie(LOGIN_INFO_COOKIE_KEY);
    },

    clearLoginInfoCookie() {
        if (typeof document !== 'undefined') {
            removeCookie(LOGIN_INFO_COOKIE_KEY);
        }
    },

    getToken() {
        // getToken() is now mostly legacy since browser handles cookies.
        // It will only return the token if it's available in Redux (which we'll also update)
        // or if it's stored in a non-HttpOnly cookie (not recommended).
        const reduxToken = _reduxStore?.getState()?.logininfo?.token;
        if (reduxToken) return reduxToken;
        const fromCookie = this.getLoginInfoFromCookie();
        if (fromCookie?.token) return fromCookie.token;
        return null;
    },

    getUserRole() {
        const reduxRole = _reduxStore?.getState()?.logininfo?.user?.role;
        if (reduxRole) return reduxRole;
        const fromCookie = this.getLoginInfoFromCookie();
        if (fromCookie?.user?.role) return fromCookie.user.role;
        return null;
    },

    getUserId() {
        const reduxId = _reduxStore?.getState()?.logininfo?.user?.id;
        if (reduxId) return reduxId;
        const fromCookie = this.getLoginInfoFromCookie();
        if (fromCookie?.user?.id) return fromCookie.user.id;
        return null;
    },

    getLoginInfo() {
        const redux = _reduxStore?.getState()?.logininfo;
        if (redux && redux.user && redux.isAuthenticated) return redux;
        const fromCookie = this.getLoginInfoFromCookie();
        if (fromCookie?.user && fromCookie?.isAuthenticated) return fromCookie;
        return null;
    },

    isLoggedIn() {
        // Since we can't read HttpOnly cookies, we check for loginInfo flag or user object.
        const info = this.getLoginInfo();
        return !!(info && info.user && info.isAuthenticated);
    },
};

export default StorageService;
