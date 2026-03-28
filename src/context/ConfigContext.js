
import React, { createContext, useContext, useState, useEffect } from 'react';
import apiService from '../utils/apiService'; // Assuming you have a configured apiService
import { store } from '../store/store';
import { setLoginInfo } from '../store/reducer';
// IISMethods import removed - localStorage mode disabled
import Config from '../config/config';
import { getCookie } from '../utils/cookieUtils';

const ConfigContext = createContext();

export const useConfig = () => useContext(ConfigContext);

export const ConfigProvider = ({ children }) => {
    const [config, setConfig] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // localStorage mode removed - always fetch config from backend
        const fetchConfig = async () => {
            try {
                // Check if user is logged in (from store or cookies)
                const logininfo = store.getState().logininfo;
                const isAuthenticated = !!(logininfo?.token || logininfo?.isAuthenticated);
                
                // Also check if email cookie exists (backup authentication check)
                const userEmail = getCookie(Config.emailCookieKey);
                
                if (!isAuthenticated && !userEmail) {
                    setLoading(false);
                    return;
                }
                
                let response;
                if (userEmail) {
                    // Send user data in POST request
                    response = await apiService.makeApiRequest(`${Config.localApiUrl}/config`, {
                        method: 'POST',
                        body: JSON.stringify({ email: userEmail })
                    });
                } else {
                    // Fallback to GET request for basic config
                    response = await apiService.get('/config');
                }
                
                if (response.data && response.success) {
                    setConfig(response.data.data);

                    // Store config data in loginInfo state by merging with existing data
                    const currentLoginInfo = store.getState().logininfo;
                    
                    store.dispatch(setLoginInfo({
                        ...currentLoginInfo,
                        ...response.data
                    }));
                } else if (response.status === 401) {
                } else {
                    throw new Error('Failed to fetch config');
                }
            } catch (err) {
                setError(err);
                console.error('Error fetching remote config:', err);
            }
            finally {
                setLoading(false);
            }
        };

        fetchConfig();
    }, []);

    return (
        <ConfigContext.Provider value={{ config, loading, error }}>
            {children}
        </ConfigContext.Provider>
    );
};
