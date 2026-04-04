import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import Config from '../../config/config';
import WorkspaceShell from './WorkspaceShell';

const FILTERS = [
    { id: 'all', label: 'All' },
    { id: 'signin', label: 'Sign-in' },
    { id: 'settings', label: 'Settings' },
    { id: 'security', label: 'Security' },
    { id: 'data', label: 'Data' },
];

function formatRelative(iso) {
    if (!iso) return '—';
    try {
        const d = new Date(iso);
        const diff = Date.now() - d.getTime();
        if (diff < 60_000) return 'Just now';
        if (diff < 3600_000) return `${Math.floor(diff / 60_000)} min ago`;
        if (diff < 86400_000) return `${Math.floor(diff / 3600_000)} hour${Math.floor(diff / 3600_000) === 1 ? '' : 's'} ago`;
        if (diff < 172800_000) return 'Yesterday';
        return d.toLocaleDateString(undefined, { dateStyle: 'medium' });
    } catch {
        return '—';
    }
}

function dotClass(cat) {
    if (cat === 'signin') return 'ws-dot-signin';
    if (cat === 'settings') return 'ws-dot-settings';
    if (cat === 'security') return 'ws-dot-security';
    return 'ws-dot-data';
}

function badgeClass(cat) {
    if (cat === 'signin') return 'ws-cat-badge ws-cat-signin';
    if (cat === 'settings') return 'ws-cat-badge ws-cat-settings';
    if (cat === 'security') return 'ws-cat-badge ws-cat-security';
    return 'ws-cat-badge ws-cat-data';
}

function categoryLabel(cat) {
    if (cat === 'signin') return 'Sign-in';
    if (cat === 'settings') return 'Settings';
    if (cat === 'security') return 'Security';
    return 'Data';
}

export default function ActivityLogPage() {
    const [filter, setFilter] = useState('all');
    const [loading, setLoading] = useState(true);
    const [items, setItems] = useState([]);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch(`${Config.apiBaseUrl}/auth/activity`, {
                credentials: 'include',
                headers: { Accept: 'application/json' },
            });
            const json = await res.json();
            if (json.success && Array.isArray(json.data)) {
                setItems(json.data);
            } else {
                toast.error(json.message || 'Could not load activity');
                setItems([]);
            }
        } catch {
            toast.error('Could not load activity');
            setItems([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    const filtered = useMemo(() => {
        if (filter === 'all') return items;
        return items.filter((r) => r.category === filter);
    }, [items, filter]);

    return (
        <WorkspaceShell>
            <h1 className="ws-main-h1">Activity Log</h1>
            <p className="ws-main-sub">Track actions recorded for your account in this workspace.</p>
            <div className="ws-divider" />

            {loading ? (
                <div className="ws-loading">Loading activity…</div>
            ) : (
                <>
                    <div className="ws-filters">
                        {FILTERS.map((f) => (
                            <button
                                key={f.id}
                                type="button"
                                className={`ws-filter-pill${filter === f.id ? ' ws-filter-pill-active' : ''}`}
                                onClick={() => setFilter(f.id)}
                            >
                                {f.label}
                            </button>
                        ))}
                    </div>

                    {filtered.length === 0 ? (
                        <div className="ws-empty">
                            {items.length === 0
                                ? 'No activity yet. Actions like profile updates and security changes will appear here.'
                                : 'No entries match this filter.'}
                        </div>
                    ) : (
                        <ul className="ws-activity-list">
                            {filtered.map((row) => (
                                <li key={row.id} className="ws-activity-item">
                                    <span className={`ws-dot ${dotClass(row.category)}`} aria-hidden />
                                    <div>
                                        <div className="ws-activity-title">{row.title}</div>
                                        <div className="ws-activity-meta">
                                            <span className={badgeClass(row.category)}>{categoryLabel(row.category)}</span>
                                        </div>
                                        {(row.details || row.ip) && (
                                            <div className="ws-activity-detail">
                                                {row.details ? <span>{row.details}</span> : null}
                                                {row.ip ? (
                                                    <span>
                                                        {row.details ? ' · ' : ''}
                                                        IP {row.ip}
                                                    </span>
                                                ) : null}
                                            </div>
                                        )}
                                    </div>
                                    <span className="ws-activity-time">{formatRelative(row.at)}</span>
                                </li>
                            ))}
                        </ul>
                    )}
                </>
            )}
        </WorkspaceShell>
    );
}
