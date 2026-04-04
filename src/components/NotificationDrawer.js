// src/components/NotificationDrawer.jsx
import { useState, useMemo } from 'react';
import { IoClose } from 'react-icons/io5';
import { useNavigate } from 'react-router-dom';
import DrawerRsuite from './DrawerRsuite';
import IISMethods from '../utils/IISMethods';

// ── Icons ────────────────────────────────────────────────────────────────────
const CheckIcon = ({ size = 11 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
    </svg>
);

const OpenIcon = ({ size = 11 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
        <polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" />
    </svg>
);

const SearchIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
);

// ── Group notifications by dateGroup field ───────────────────────────────────
const groupByDate = (items) => {
    const order = [];
    const groups = {};
    items.forEach((n) => {
        const key = n.dateGroup || 'Earlier';
        if (!groups[key]) { groups[key] = []; order.push(key); }
        groups[key].push(n);
    });
    return order.map((key) => ({ key, items: groups[key] }));
};

// ── Drawer Body (everything inside DrawerRsuite body) ────────────────────────
const NotificationDrawerBody = ({ notifications, onRead, onMarkAll, onNavigateFromNotification }) => {
    const [filter, setFilter] = useState('all');
    const [search, setSearch] = useState('');

    const navigate = useNavigate();
    const handleClose = () => IISMethods.handleGrid(false, 'notificationdrawer', 0);

    const filtered = useMemo(() => {
        let list = notifications;
        if (filter === 'unread') list = list.filter((n) => n.unread);
        if (filter === 'read') list = list.filter((n) => !n.unread);
        if (search.trim()) {
            const q = search.toLowerCase();
            list = list.filter((n) =>
                (n.name || '').toLowerCase().includes(q) ||
                (n.boldTag || '').toLowerCase().includes(q) ||
                (n.subDesc || '').toLowerCase().includes(q) ||
                (n.body || '').toLowerCase().includes(q) ||
                (n.text || '').toLowerCase().includes(q) ||
                (n.tag || '').toLowerCase().includes(q)
            );
        }
        return list;
    }, [notifications, filter, search]);

    const grouped = groupByDate(filtered);
    const unreadCount = notifications.filter((n) => n.unread).length;

    return (
        <div className="nd-root">

            {/* ── Dark Header ── */}
            <div className="nd-header">

                {/* Row 1: title + count badge + close btn */}
                <div className="nd-header-top">
                    <div className="nd-title-wrap">
                        <span className="nd-title">All Notifications</span>
                        <span className="nd-count-badge">{unreadCount}</span>
                    </div>
                    <button className="nd-close-btn" onClick={handleClose}>
                        <IoClose size={14} />
                    </button>
                </div>

                {/* Row 2: All / Unread / Read filter tabs */}
                <div className="nd-filter-row">
                    {['all', 'unread', 'read'].map((f) => (
                        <button
                            key={f}
                            className={`nd-filter-btn ${filter === f ? 'nd-filter-btn--active' : 'nd-filter-btn--inactive'}`}
                            onClick={() => setFilter(f)}
                        >
                            {f.charAt(0).toUpperCase() + f.slice(1)}
                        </button>
                    ))}
                </div>

                {/* Row 3: Search */}
                <div className="nd-search-box">
                    <span className="nd-search-icon"><SearchIcon /></span>
                    <input
                        className="nd-search-input"
                        type="text"
                        placeholder="Search notifications..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            {/* ── Light Scrollable Body ── */}
            <div className="nd-body">
                {grouped.length === 0 ? (
                    <div className="nd-empty">
                        <span className="nd-empty-icon">🔕</span>
                        <p>No notifications found</p>
                    </div>
                ) : (
                    grouped.map(({ key, items }) => (
                        <div key={key}>
                            <div className="nd-date-label">{key}</div>
                            {items.map((n) => (
                                <div key={n.id} className={`nd-item${n.unread ? ' nd-item--unread' : ''}`}>

                                    {/* Avatar + role badge */}
                                    <div className="nd-avatar-wrap">
                                        <div
                                            className="nd-avatar"
                                            style={{ background: n.unread ? n.color : 'linear-gradient(135deg,#d1d5db,#9ca3af)' }}
                                        >
                                            {n.initials}
                                        </div>
                                        <span className="nd-role-badge">U</span>
                                    </div>

                                    {/* Text content */}
                                    <div className="nd-content">
                                        <p className="nd-name">{n.name}</p>
                                        <p className="nd-desc">
                                            {n.body ? (
                                                n.body
                                            ) : (
                                                <>
                                                    Applied for <strong>{n.boldTag || 'update'}</strong>
                                                    {n.subDesc ? ` — ${n.subDesc}` : ''}.
                                                </>
                                            )}
                                        </p>
                                        <div className="nd-meta-row">
                                            <span className="badge badge-primary fw-500">{n.tag}</span>
                                            <span className="nd-time">· {n.time}</span>
                                        </div>
                                    </div>

                                    {/* Action buttons */}
                                    <div className="nd-action-btns">
                                        <button
                                            className={`nd-check-btn${!n.unread ? ' nd-check-btn--done' : ''}`}
                                            title={n.unread ? 'Mark as read' : 'Read'}
                                            onClick={(e) => { e.stopPropagation(); if (n.unread) onRead(n.id); }}
                                        >
                                            <CheckIcon />
                                        </button>
                                        <button
                                            type="button"
                                            className="nd-open-btn"
                                            title="Open linked screen"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                if (onNavigateFromNotification) {
                                                    onNavigateFromNotification(n);
                                                } else {
                                                    handleClose();
                                                    navigate(n.redirectPath || '/dashboard');
                                                }
                                            }}
                                        >
                                            <OpenIcon />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ))
                )}
            </div>

            {/* ── Sticky Footer ── */}
            {unreadCount > 0 && (
                <div className="nd-footer">
                    <button className="nd-markall-btn" onClick={onMarkAll}>
                        <CheckIcon size={12} /> Mark all as read
                    </button>
                </div>
            )}

        </div>
    );
};

// ── Main export ──────────────────────────────────────────────────────────────
const NotificationDrawer = (props) => (
    <DrawerRsuite
        modalname="notificationdrawer"
        size="xs"
        removeheader={true}
        bodyClassName="notification-drawer-body"
        title=""
        body={
            <NotificationDrawerBody
                notifications={props.notifications || []}
                onRead={props.onRead}
                onMarkAll={props.onMarkAll}
                onNavigateFromNotification={props.onNavigateFromNotification}
            />
        }
    />
);

export default NotificationDrawer;