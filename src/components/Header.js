// src/components/Header.jsx
import { useCallback, useEffect, useRef, useState } from 'react';
import { BiSearch, BiBell } from 'react-icons/bi';
import { IoClose } from 'react-icons/io5';
import { useNavigate, useLocation } from 'react-router-dom';
import IISMethods from '../utils/IISMethods';
import Config from '../config/config';
import ProfileDrawer from './ProfileDrawer';
import InfoBox from './InfoBox';
import NotificationDrawer from './NotificationDrawer';
import { MdApps } from 'react-icons/md';
import useAuth from '../hooks/useAuth';
import { useAppSelector } from '../store/hooks';
import StorageService from '../utils/StorageService';
import { navigateFromNotification } from '../utils/notificationNavigation';

function notificationFetchHeaders() {
    const headers = { Accept: 'application/json' };
    const token = StorageService.getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
    return headers;
}

// ── Build flat searchable menu list ─────────────────────────────────────────
const buildSearchList = (loginInfo) => {
    if (!loginInfo?.modules) return [];
    
    const searchList = [];
    
    loginInfo.modules.forEach((module) => {
        if (module.menus && Array.isArray(module.menus)) {
            module.menus.forEach((menu) => {
                if (menu.aliasname && menu.pagename) {
                    searchList.push({
                        path: menu.aliasname,
                        label: menu.menuname,
                        pageKey: menu.pagename,
                        groupLabel: module.module,
                        icon: menu.icon,
                    });
                }
            });
        }
    });
    
    return searchList;
};

const Highlight = ({ text, query }) => {
    if (!query) return <span>{text}</span>;
    const idx = text.toLowerCase().indexOf(query.toLowerCase());
    if (idx === -1) return <span>{text}</span>;
    return (
        <span>
            {text.slice(0, idx)}
            <span className="header-search-highlight">{text.slice(idx, idx + query.length)}</span>
            {text.slice(idx + query.length)}
        </span>
    );
};

// ── SVG icons ────────────────────────────────────────────────────────────────
const CheckIcon = () => (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
    </svg>
);

const OpenIcon = () => (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
        <polyline points="15 3 21 3 21 9" />
        <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
);

// ── Notification InfoBox header (title + chip + All/Unread filter) ───────────
const NotificationHeader = (props) => (
    <div className="notif-ib-header-inner">
        <div className="notif-ib-title-wrap">
            <span>{Config.notificationsTitle}</span>
            {props.unreadCount > 0 && (
                <span className="badge badge-primary">{props.unreadCount} {Config.newNotifications}</span>
            )}
        </div>
        <div className="notif-ib-filter-wrap">
            <button
                className={`notif-ib-filter-btn ${props.filter === 'all' ? 'notif-ib-filter-btn--active' : 'notif-ib-filter-btn--inactive'}`}
                onClick={() => props.onFilter('all')}
            >{Config.allFilter}</button>
            <button
                className={`notif-ib-filter-btn ${props.filter === 'unread' ? 'notif-ib-filter-btn--active' : 'notif-ib-filter-btn--inactive'}`}
                onClick={() => props.onFilter('unread')}
            >{Config.unreadFilter}</button>
        </div>
    </div>
);

// ── Notification body ────────────────────────────────────────────────────────
const NotificationBody = (props) => {
    const visible = props.filter === 'unread'
        ? props.notifications.filter((n) => n.unread)
        : props.notifications;

    if (visible.length === 0) {
        return (
            <div className="notif-ib-empty">
                <span style={{ fontSize: 28 }}>🔕</span>
                <p>{props.filter === 'unread' ? Config.noUnreadNotifications : Config.noNotifications}</p>
            </div>
        );
    }

    return (
        <div className="notif-ib-list">
            {visible.map((n) => {
                const line =
                    n.boldName && n.text && n.text.startsWith(n.boldName)
                        ? (
                            <>
                                <strong>{n.boldName}</strong>
                                {n.text.slice(n.boldName.length)}
                            </>
                        )
                        : (
                            <span>{n.text || n.name || n.boldName}</span>
                        );
                return (
                    <div key={n.id} className={`notif-ib-item${n.unread ? ' notif-ib-item--unread' : ''}`}>

                        {/* Blue dot for unread */}
                        {n.unread && <span className="notif-ib-unread-dot" />}

                        {/* Avatar with initials + U badge */}
                        <div className="notif-ib-avatar-wrap">
                            <div
                                className={`notif-ib-avatar${!n.unread ? ' notif-ib-avatar--read' : ''}`}
                                style={{ background: n.unread ? n.color : undefined }}
                            >
                                {n.initials}
                            </div>
                            <span className="notif-ib-role-badge">U</span>
                        </div>

                        {/* Text + meta */}
                        <div className="notif-ib-content">
                            <p className={`notif-ib-text${!n.unread ? ' notif-ib-text--read' : ''}`}>
                                {line}
                            </p>
                            <div className="notif-ib-meta">
                                {n.sender}&nbsp;·&nbsp;{n.time}
                            </div>
                        </div>

                        {/* Action buttons */}
                        <div className="notif-ib-actions">
                            {n.unread ? (
                                <button
                                    type="button"
                                    className="notif-ib-action-btn"
                                    title="Mark as read"
                                    onClick={(e) => { e.stopPropagation(); props.onRead(n.id); }}
                                ><CheckIcon /></button>
                            ) : (
                                <button type="button" className="notif-ib-action-btn notif-ib-action-btn--done" title="Read">
                                    <CheckIcon />
                                </button>
                            )}
                            <button
                                type="button"
                                className="notif-ib-action-btn"
                                title="Open linked screen"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    props.onOpen?.(n);
                                }}
                            >
                                <OpenIcon />
                            </button>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

// ── Notification footer ──────────────────────────────────────────────────────
const NotificationFooter = (props) => (
    <div className="notif-ib-footer-inner">
        <button className="notif-ib-markall-btn" onClick={props.onMarkAll}>
            <CheckIcon /> {Config.markAllAsRead}
        </button>
        <button className="notif-ib-showall-btn" onClick={props.onShowAll}>
            {Config.showAll}
        </button>
    </div>
);

// ── Header Component ─────────────────────────────────────────────────────────
const Header = () => {
    const { logout } = useAuth();
    const loginInfo = useAppSelector((state) => state.logininfo);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeIndex, setActiveIndex] = useState(-1);
    const [notifOpen, setNotifOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [notifFilter, setNotifFilter] = useState('all');

    const searchRef = useRef(null);
    const inputRef = useRef(null);
    const bellRef = useRef(null);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => { setActiveIndex(-1); }, [searchQuery]);
    useEffect(() => { setIsSearchOpen(false); setSearchQuery(''); setActiveIndex(-1); setNotifOpen(false); }, [location.pathname]);

    useEffect(() => {
        const handler = (e) => {
            if (searchRef.current && !searchRef.current.contains(e.target)) {
                setIsSearchOpen(false); setSearchQuery('');
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    useEffect(() => {
        if (isSearchOpen && inputRef.current) setTimeout(() => inputRef.current?.focus(), 50);
    }, [isSearchOpen]);

    useEffect(() => {
        if (activeIndex >= 0 && isSearchOpen) {
            const activeItem = document.querySelector('.header-search-item.keyboard-active');
            if (activeItem) {
                activeItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        }
    }, [activeIndex, isSearchOpen]);

    const allMenuItems = buildSearchList(loginInfo);

    const results = searchQuery.trim()
        ? allMenuItems.filter((item) => {
            return item.label.toLowerCase().includes(searchQuery.toLowerCase());
        })
        : [];

    const handleSelect = (path) => { navigate(path); setIsSearchOpen(false); setSearchQuery(''); };

    const loadNotifications = useCallback(async () => {
        try {
            const res = await fetch(`${Config.apiBaseUrl}/notifications`, {
                credentials: 'include',
                headers: notificationFetchHeaders(),
            });
            const json = await res.json();
            if (json?.success && Array.isArray(json.data)) {
                setNotifications(json.data);
            }
        } catch (_err) {
            /* keep list as-is on failure */
        }
    }, []);

    useEffect(() => {
        loadNotifications();
    }, [loadNotifications]);

    useEffect(() => {
        if (notifOpen) loadNotifications();
    }, [notifOpen, loadNotifications]);

    const unreadCount = notifications.filter((n) => n.unread).length;

    const handleMarkRead = async (id) => {
        try {
            const res = await fetch(`${Config.apiBaseUrl}/notifications/${id}/read`, {
                method: 'PATCH',
                credentials: 'include',
                headers: notificationFetchHeaders(),
            });
            if (res.ok) {
                setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, unread: false } : n)));
            }
        } catch (_err) {
            setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, unread: false } : n)));
        }
    };

    const handleMarkAll = async () => {
        try {
            const res = await fetch(`${Config.apiBaseUrl}/notifications/mark-all-read`, {
                method: 'POST',
                credentials: 'include',
                headers: notificationFetchHeaders(),
            });
            if (res.ok) {
                setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
            }
        } catch (_err) {
            setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
        }
    };

    const userName = loginInfo?.user?.firstName || loginInfo?.user?.firstname || loginInfo?.user?.email || Config.guestUser;
    const userInitial = userName.charAt(0).toUpperCase();

    return (
        <>
            <header className="app-header">
                <div className="app-title py-2">{Config.projectName}</div>

                <div className="d-flex align-items-center gap-8">

                    {/* ── Search ── */}
                    <div className="header-search-wrapper" ref={searchRef}>
                        <div className={`header-search-input-box ${isSearchOpen ? 'open' : ''}`}>
                            <input
                                ref={inputRef}
                                type="text"
                                className="header-search-input"
                                placeholder={Config.headerSearchPlaceholder}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Escape') { setIsSearchOpen(false); return; }
                                    if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIndex((p) => Math.min(p + 1, results.length - 1)); }
                                    if (e.key === 'ArrowUp') { e.preventDefault(); setActiveIndex((p) => Math.max(p - 1, 0)); }
                                    if (e.key === 'Enter' && activeIndex >= 0 && results[activeIndex]) handleSelect(results[activeIndex].path);
                                }}
                                style={{ paddingRight: searchQuery ? '28px' : '14px' }}
                            />
                            {searchQuery && (
                                <span className="header-search-clear" onClick={(e) => { e.stopPropagation(); setSearchQuery(''); }}>
                                    <IoClose />
                                </span>
                            )}
                            {isSearchOpen && searchQuery.trim() && (
                                <div className="header-search-dropdown">
                                    {results.length > 0 ? results.map((item, idx) => {
                                        return (
                                            <div
                                                key={item.path}
                                                className={`header-search-item ${idx === activeIndex ? 'keyboard-active' : ''} ${location.pathname === item.path ? 'current-page' : ''}`}
                                                onMouseEnter={() => setActiveIndex(idx)}
                                                onClick={() => handleSelect(item.path)}
                                            >
                                                <span className="header-search-item-icon">{item.icon && <i className={item.icon}></i>}</span>
                                                <span className="header-search-item-info">
                                                    <span className="header-search-item-label"><Highlight text={item.label} query={searchQuery} /></span>
                                                    {item.groupLabel && <span className="header-search-item-group">{item.groupLabel}</span>}
                                                </span>
                                            </div>
                                        );
                                    }) : <div className="header-search-empty">{Config.noResultsFound} "{searchQuery}"</div>}
                                </div>
                            )}
                        </div>
                        <span
                            className={`header-search-icon ${isSearchOpen ? 'active' : ''}`}
                            onClick={() => { if (isSearchOpen) { setIsSearchOpen(false); setSearchQuery(''); setActiveIndex(-1); } else setIsSearchOpen(true); }}
                        >
                            <BiSearch size={16} />
                        </span>
                    </div>

                    {/* ── All Masters Icon ── */}
                    <button
                        className={`header-allmaster-btn`}
                        onClick={() => navigate('/allmaster')}
                        title={Config.allMastersTitle}
                    >
                        <MdApps size={18} />
                    </button>

                    {/* ── Notification Bell ── */}
                    <div
                        ref={bellRef}
                        className="header-notif-btn"
                        style={{ cursor: 'pointer' }}
                        onClick={() => setNotifOpen((v) => !v)}
                    >
                        <BiBell size={18} />
                        {unreadCount > 0 && (
                            <span className="header-notif-dot"></span>
                        )}
                    </div>

                    {/* ── Vertical divider ── */}
                    <div className="header-divider" />

                    {/* ── User name ── */}
                    <span className="header-user-name cursor-pointer" onClick={() => navigate('/dashboard')}>
                        {userName}
                    </span>

                    {/* ── Avatar → opens ProfileDrawer ── */}
                    <div className="header-avatar-wrap" onClick={() => IISMethods.handleGrid(true, 'profiledrawer', 1)}>
                        <div className="header-avatar">{userInitial}</div>
                        <span className="header-online-dot" />
                    </div>

                </div>
            </header>

            {/* ── Profile Drawer ── */}
            <ProfileDrawer
                loginInfo={loginInfo}
                onSignOut={() => {
                    logout();
                    IISMethods.handleGrid(false, 'profiledrawer', 0);
                }}
            />

            {/* ── All Notifications Drawer ── */}
            <NotificationDrawer
                notifications={notifications}
                onRead={handleMarkRead}
                onMarkAll={handleMarkAll}
                onNavigateFromNotification={(n) => {
                    navigateFromNotification(navigate, n, {
                        onClose: () => IISMethods.handleGrid(false, 'notificationdrawer', 0),
                    });
                }}
            />

            {/* ── Notification InfoBox ── */}
            <InfoBox
                open={notifOpen}
                onClose={() => setNotifOpen(false)}
                anchorEl={bellRef}
                placement="bottomEnd"
                width={400}
                closable={false}
                backdrop={true}
                title={
                    <NotificationHeader
                        unreadCount={unreadCount}
                        filter={notifFilter}
                        onFilter={setNotifFilter}
                    />
                }
                body={
                    <NotificationBody
                        notifications={notifications}
                        filter={notifFilter}
                        onRead={handleMarkRead}
                        onOpen={(n) => navigateFromNotification(navigate, n, { onClose: () => setNotifOpen(false) })}
                    />
                }
                footer={
                    <NotificationFooter
                        onMarkAll={handleMarkAll}
                        onShowAll={() => { setNotifOpen(false); IISMethods.handleGrid(true, 'notificationdrawer', 1); }}
                    />
                }
            />
        </>
    );
};

export default Header;