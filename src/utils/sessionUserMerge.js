import { setLoginInfo } from '../store/reducer';
import StorageService from './StorageService';

/** Merge `/auth/me` or `/auth/profile` response into Redux + login cookie. */
export function mergeUserIntoLoginSession(dispatch, apiUser) {
    if (!dispatch || !apiUser) return;
    const base = StorageService.getLoginInfo();
    if (!base?.user) return;
    const mergedUser = {
        ...base.user,
        ...apiUser,
        id: apiUser.id || apiUser._id || base.user.id,
        firstName: apiUser.firstname ?? base.user.firstName,
        firstname: apiUser.firstname ?? base.user.firstname,
        lastname: apiUser.lastname ?? base.user.lastname,
        is2FAEnabled: Boolean(apiUser.twofactorenabled),
    };
    const next = { ...base, user: mergedUser };
    dispatch(setLoginInfo(next));
    StorageService.setLoginInfoCookie(next);
}
