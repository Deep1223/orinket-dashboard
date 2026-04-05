import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../store/hooks';
import { setProps } from '../utils/reduxUtils';
import StorageService from '../utils/StorageService';
import IISMethods from '../utils/IISMethods';
import apiService from '../utils/apiService';
import { setCookie } from '../utils/cookieUtils';
import Config from '../config/config';

/**
 * A hook that provides authentication state and utility functions.
 */
const useAuth = () => {
  const navigate = useNavigate();
  const loginInfo = useAppSelector((state) => state.logininfo);

  const login = useCallback(async (authData) => {
    const { user, rememberMe, token } = authData;

    // Set email cookie for config API
    setCookie(Config.emailCookieKey, user.email);

    const loginData = {
      user: {
        ...user,
        isAuthenticated: true,
      },
      isAuthenticated: true,
      loginTime: new Date().toISOString(),
      ...(token ? { token } : {}),
    };

    if (rememberMe) {
      StorageService.setAuth(null, user.id || user._id, user.role, user.email);
    } else {
      StorageService.clearRememberedEmail();
    }

    const { token: _omitToken, ...loginInfoForCookie } = loginData;
    StorageService.setLoginInfoCookie(loginInfoForCookie);
    setProps({ logininfo: loginData });
    
    // Call config API immediately after login
    try {
      const configResponse = await apiService.makeApiRequest(`${Config.localApiUrl}/config`, {
        method: 'POST',
        body: JSON.stringify({ email: user.email })
      });
      
      if (configResponse.data && configResponse.success) {
        const updatedLoginInfo = {
          ...loginData,
          ...configResponse.data,
        };
        if (token) {
          updatedLoginInfo.token = token;
        }

        setProps({ logininfo: updatedLoginInfo });
        const { token: _t, ...forCookie } = updatedLoginInfo;
        StorageService.setLoginInfoCookie(forCookie);
      }
    } catch (error) {
      console.error('Error fetching config after login:', error);
    }
    
    IISMethods.successmsg('Login successful', 2);
    navigate('/dashboard');
  }, [navigate]);

  const logout = useCallback(async () => {
    try {
      await apiService.get('/auth/logout');
    } catch (e) {
      console.error('Logout error:', e);
    }
    StorageService.clearAuth();
    setProps({ logininfo: null });
    IISMethods.successmsg('Logged out successfully', 2);
    navigate('/');
  }, [navigate]);

  return {
    isAuthenticated: !!loginInfo?.isAuthenticated,
    user: loginInfo?.user,
    token: loginInfo?.token,
    login,
    logout,
  };
};

export default useAuth;
