import './App.css';
import { useState, useEffect } from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Footer from './components/Footer';
import TileLoader from './components/TileLoader';
import StorageService from './utils/StorageService';
// IISMethods import removed - localStorage mode disabled
import { setProps } from './utils/reduxUtils';
import { AUTH_ROUTES, FLAT_ROUTES } from './config/RouteConfig';
import PageNotFound from './components/PageNotFound';
import ProtectedRoute from './components/ProtectedRoute';
import ServerGuard from './components/ServerGuard';
import { ConfigProvider, useConfig } from './context/ConfigContext';
import Config from './config/config';

const PageGuard = ({ pageKey, children }) => {
    return children;
};

function App() {
    return (
        <ConfigProvider>
            <MainApp />
        </ConfigProvider>
    );
}

function MainApp() {
    const { config, loading: configLoading } = useConfig();
    const [isFixed, setIsFixed] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const logininfo = useSelector((state) => state.logininfo);
    const configData = logininfo;
    const isAuthPage = AUTH_ROUTES.some((r) => r.path === location.pathname);
    const isLoggedIn = !!(logininfo?.token || StorageService.isLoggedIn());
    const showLayout = !isAuthPage && isLoggedIn;

    useEffect(() => {
        if (!isAuthPage && location.pathname === '/') {
            navigate('/login');
        }
    }, [isAuthPage, location.pathname, navigate]);

    useEffect(() => {
        if (config || configData) {
            const configToUse = config || configData;
            Config.systemAdminRoleId = configToUse.systemAdminRoleId;
            Config.defaultUserId = configToUse.defaultUserId;
            Config.defaultUserEmail = configToUse.defaultUserEmail;
        } else {
            // localStorage mode removed - using backend config only
            // Set defaults from backend config or fallback values
            Config.systemAdminRoleId = '69ac79c8afeebd98e398c0ff';
            Config.defaultUserId = '69ac78170e3c74bc59b89a4a';
            Config.defaultUserEmail = 'admin@gmail.com';
        }
    }, [config, configData]);

    useEffect(() => {
        document.title = Config.projectName;
        const loginInfo = StorageService.getLoginInfoFromCookie();
        if (loginInfo?.user && loginInfo?.token) setProps({ logininfo: loginInfo });
    }, []);

    useEffect(() => {
        if (isAuthPage) return;
        let lastActivity = Date.now();
        const reset = () => { lastActivity = Date.now(); };
        const check = () => {
            if (Date.now() - lastActivity > Config.autoLogoutTime) {
                toast.warning('Session expired. Logging out...');
                StorageService.clearAuth();
                navigate('/login');
            }
        };
        window.addEventListener('mousemove', reset);
        window.addEventListener('keydown', reset);
        window.addEventListener('click', reset);
        const interval = setInterval(check, 60 * 1000);
        return () => {
            clearInterval(interval);
            window.removeEventListener('mousemove', reset);
            window.removeEventListener('keydown', reset);
            window.removeEventListener('click', reset);
        };
    }, [isAuthPage, navigate]);

    // localStorage mode removed - always wait for backend config
    if (configLoading) {
        return (
            <div className="d-flex justify-content-center align-items-center vh-100 bg-white">
                <TileLoader />
            </div>
        );
    }

    return (
        <div className="d-flex vh-100">
            <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false}
                newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable
                pauseOnHover theme="light" limit={5} />

            {!isAuthPage && showLayout && <Sidebar isFixed={isFixed} setIsFixed={setIsFixed} />}

            <div className={`d-flex flex-column main-content-transition main-content-wrapper ${!showLayout ? 'main-content-auth' : isFixed ? 'main-content-expanded' : 'main-content-collapsed'
                }`}>
                {!isAuthPage && showLayout && <Header />}

                <main className={`flex-grow-1 d-flex flex-column min-h-0 min-w-0 overflow-hidden overflow-x-hidden ${showLayout ? 'p-3' : ''}`}>
                    {/* overflow-y-auto: dashboard + long pages scroll inside main (sidebar/header stay fixed) */}
                    <div className="app-main-scroll flex-grow-1 min-h-0 min-w-0 d-flex flex-column overflow-y-auto overflow-x-hidden">
                        <Routes>
                            {AUTH_ROUTES.map(({ path, component: Component }) => (
                                <Route key={path} path={path} element={
                                    path === '/' ? <Component /> : (
                                        <ServerGuard>
                                            <Component />
                                        </ServerGuard>
                                    )
                                } />
                            ))}

                            {/* FLAT_ROUTES — accordion children bhi include hain */}
                            {FLAT_ROUTES.map(({ path, pageKey, component: Component }) => (
                                <Route key={path} path={path} element={
                                    <ServerGuard>
                                        <ProtectedRoute>
                                            <PageGuard pageKey={pageKey}>
                                                <Component />
                                            </PageGuard>
                                        </ProtectedRoute>
                                    </ServerGuard>
                                } />
                            ))}

                            <Route path="*" element={
                    <ServerGuard>
                        <ProtectedRoute>
                            <PageNotFound />
                        </ProtectedRoute>
                    </ServerGuard>
                } />
                        </Routes>
                    </div>
                </main>

                {!isAuthPage && showLayout && <Footer />}
            </div>
        </div>
    );
}

export default App;