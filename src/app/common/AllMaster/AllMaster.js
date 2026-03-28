// src/pages/AllMasters.jsx
import { useState, useMemo, useEffect } from 'react';
import SearchBar from '../../../components/SearchBar';
import { useNavigate, useLocation } from 'react-router-dom';
import { FLAT_ROUTES } from '../../../config/RouteConfig';
import MasterController from '../../controller/MasterController';
import { setProps, getCurrentState } from '../../../utils/reduxUtils';
import MasterJson from '../../../config/masterJSON';

/* ─── Convert hex to rgba with opacity ─── */
const hexToRgba = (hex, opacity) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (result) {
        const r = parseInt(result[1], 16);
        const g = parseInt(result[2], 16);
        const b = parseInt(result[3], 16);
        return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    }
    return hex;
};

/* ─── Get theme colors from module data ─── */
const getThemeColors = (bgcolor) => {
    const color = bgcolor;
    const bg = hexToRgba(bgcolor, 0.15);
    const border = hexToRgba(bgcolor, 0.3);
    return { color, bg, border };
};

/* ─── Highlight matching text ─── */
const Highlight = ({ text, query }) => {
    if (!query) return <>{text}</>;
    const i = text.toLowerCase().indexOf(query.toLowerCase());
    if (i === -1) return <>{text}</>;
    return (
        <>
            {text.slice(0, i)}
            <mark className="am-highlight">{text.slice(i, i + query.length)}</mark>
            {text.slice(i + query.length)}
        </>
    );
};

const AllMaster = () => {
    const navigate    = useNavigate();
    const location    = useLocation();
    const [search,    setSearch]    = useState('');
    const [activeTab, setActiveTab] = useState('all'); // Default to 'all' tab

    // Get modules from Redux store and make it reactive
    const ALL_MODULES = useMemo(() => {
        const state = getCurrentState();
        const configData = state?.logininfo;
        
        if (!configData || !configData.modules) {
            return [];
        }

        return configData.modules.map((module) => ({
            name: module.module,
            icon: module.icon,
            bgcolor: module.bgcolor,
            masters: module.menus.map((menu) => ({
                name: menu.menuname,
                path: `/${menu.aliasname}`,
                pageKey: menu.aliasname,
            })),
        }));
    }, []);

    // Check if current path is a master route (not /allmaster)
    const isMasterRoute = location.pathname !== '/allmaster';

    // Find current route's pageKey and set rightsidebarformdata
    useEffect(() => {
        if (isMasterRoute) {
            const currentRoute = FLAT_ROUTES.find(r => r.path === location.pathname);
            if (currentRoute && currentRoute.pageKey) {
                setProps({ rightsidebarformdata: MasterJson(currentRoute.pageKey) });
            }
        }
    }, [location.pathname, isMasterRoute]);

    const handleSearch       = (term) => setSearch(term);
    const handleSetSearchTerm = (term) => setSearch(term);

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        
        // If no active tab selected or 'all' is selected, show all modules
        let source = !activeTab || activeTab === 'all'
            ? ALL_MODULES
            : ALL_MODULES.filter((m) => m.name === activeTab);

        return source
            .map((mod) => ({
                ...mod,
                masters: mod.masters.filter(
                    (m) =>
                        (m.name.toLowerCase().includes(q) || mod.name.toLowerCase().includes(q))
                ),
            }))
            .filter((mod) => mod.masters.length > 0);
    }, [search, activeTab, ALL_MODULES]);

    if (isMasterRoute) {
        return <MasterController />;
    }

    return (
        <div className="am-page">

            {/* ── Static top: title + search + tabs — scroll pe nahi jayega ── */}
            <div className="am-page-top">

                {/* Page header */}
                <div className="d-flex align-items-center justify-content-between pb-2">
                    <h1 className="h4 fw-medium text-dark mb-0">All Masters</h1>
                    <SearchBar
                        handleSearch={handleSearch}
                        searchTerm={search}
                        setSearchTerm={handleSetSearchTerm}
                    />
                </div>

                {/* Filter tabs */}
                <div className="am-tabs">
                    <button
                        className={`am-tab ${activeTab === 'all' ? 'am-tab-active' : ''}`}
                        style={activeTab === 'all' ? { '--am-tab-color': '#334155' } : {}}
                        onClick={() => setActiveTab('all')}
                    >
                        <span className="am-tab-dot" />
                        All
                        <span className="am-tab-count">{ALL_MODULES.reduce((sum, mod) => sum + mod.masters.length, 0)}</span>
                    </button>
                    {ALL_MODULES.map((mod) => {
                        const theme = getThemeColors(mod.bgcolor);
                        const isActive = activeTab === mod.name;
                        return (
                            <button
                                key={mod.name}
                                className={`am-tab ${isActive ? 'am-tab-active' : ''}`}
                                style={isActive ? { '--am-tab-color': theme.color } : {}}
                                onClick={() => setActiveTab(mod.name)}
                            >
                                <i className={mod.icon} style={{ fontSize: '13px' }}></i>
                                {mod.name}
                                <span className="am-tab-count">{mod.masters.length}</span>
                            </button>
                        );
                    })}
                </div>

            </div>
            {/* ── end am-page-top ── */}

            {/* ── Scrollable area — sirf cards scroll honge ── */}
            <div className="am-grid-wrapper pb-0">
                {filtered.length === 0 ? (
                    <div className="am-empty">
                        <span className="am-empty-icon">🔍</span>
                        <p>No masters found{search ? ` for "${search}"` : '.'}</p>
                    </div>
                ) : (
                    <div className="am-grid">
                        {filtered.map((mod, idx) => {
                            const theme = getThemeColors(mod.bgcolor);

                            return (
                                <div
                                    key={mod.name}
                                    className="am-card"
                                    style={{ animationDelay: `${idx * 0.04}s` }}
                                >
                                    {/* Card header */}
                                    <div className="am-card-head">
                                        <div className="am-card-head-left">
                                            <div
                                                className="am-card-icon"
                                                style={{ background: theme.bg, border: `1px solid ${theme.border}` }}
                                            >
                                                <i className={mod.icon} style={{ fontSize: '18px', color: theme.color }}></i>
                                            </div>
                                            <div>
                                                <div className="am-card-mod-name">
                                                    <Highlight text={mod.name} query={search.trim()} />
                                                </div>
                                            </div>
                                        </div>
                                        <span
                                            className="badge"
                                            style={{ color: theme.color, background: theme.bg, border: `1px solid ${theme.border}` }}
                                        >
                                            {mod.masters.length} masters
                                        </span>
                                    </div>

                                    {/* Master items */}
                                    <div className="am-card-body">
                                        <div className="am-masters-grid">
                                            {mod.masters.map((m) => (
                                                <button
                                                    key={m.path}
                                                    className="am-master-btn"
                                                    style={{
                                                        '--am-item-color':  theme.color,
                                                        '--am-item-bg':     theme.bg,
                                                        '--am-item-border': theme.border,
                                                    }}
                                                    onClick={() => navigate(m.path)}
                                                >
                                                    <span className="am-master-lbl">
                                                        <Highlight text={m.name} query={search.trim()} />
                                                    </span>
                                                    <svg className="am-master-arrow" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <path d="M2 6h8M6 2l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
                                                    </svg>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
            {/* ── end am-grid-wrapper ── */}

        </div>
    );
};

export default AllMaster;