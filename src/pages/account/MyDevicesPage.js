import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import {
    FaClock,
    FaDesktop,
    FaExclamationTriangle,
    FaLaptop,
    FaMobileAlt,
    FaShieldAlt,
} from 'react-icons/fa';
import Config from '../../config/config';
import useAuth from '../../hooks/useAuth';
import AccountPageLayout from './AccountPageLayout';

function formatRelativeWhen(iso) {
    if (!iso) return '—';
    try {
        const d = new Date(iso);
        const diffMs = Date.now() - d.getTime();
        if (diffMs < 60_000) return 'Just now';
        if (diffMs < 3600_000) {
            const m = Math.floor(diffMs / 60_000);
            return `${m} min ago`;
        }
        if (diffMs < 86400_000) {
            const h = Math.floor(diffMs / 3600_000);
            return `${h} hour${h === 1 ? '' : 's'} ago`;
        }
        const days = Math.floor(diffMs / 86400_000);
        if (days < 14) return `${days} day${days === 1 ? '' : 's'} ago`;
        return d.toLocaleDateString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
    } catch {
        return String(iso);
    }
}

/** Best-effort label + device class for icons (no geo — location line omitted). */
function parseSessionUa(ua) {
    if (!ua || typeof ua !== 'string') {
        return { title: 'Unknown browser', kind: 'desktop' };
    }
    const u = ua.toLowerCase();
    let browser = 'Browser';
    if (u.includes('edg/') || u.includes('edgios') || u.includes('edga')) browser = 'Edge';
    else if (u.includes('opr/') || u.includes('opera')) browser = 'Opera';
    else if (u.includes('chrome') || u.includes('crios')) browser = 'Chrome';
    else if (u.includes('firefox') || u.includes('fxios')) browser = 'Firefox';
    else if (u.includes('safari') && !u.includes('chrome')) browser = 'Safari';

    let os = '';
    let kind = 'desktop';
    if (u.includes('iphone')) {
        os = 'iPhone';
        kind = 'mobile';
    } else if (u.includes('ipad')) {
        os = 'iPad';
        kind = 'tablet';
    } else if (u.includes('android')) {
        const m = ua.match(/Android\s+([\d.]+)/i);
        os = m ? `Android ${m[1]}` : 'Android';
        kind = u.includes('mobile') ? 'mobile' : 'tablet';
    } else if (u.includes('mac os x') || u.includes('macintosh')) {
        const m = ua.match(/Mac OS X\s+([\d_]+)/i);
        os = m ? `macOS ${m[1].replace(/_/g, '.')}` : 'macOS';
        kind = 'laptop';
    } else if (u.includes('windows nt 10')) os = 'Windows 11';
    else if (u.includes('windows nt 11')) os = 'Windows 11';
    else if (u.includes('windows')) os = 'Windows';
    else if (u.includes('linux')) os = 'Linux';

    const title = os ? `${browser} on ${os}` : `${browser}`;

    return { title, kind };
}

function sessionIpLine(r) {
    if (r.ipDisplay) return r.ipDisplay;
    const ip = String(r.ip || '').trim();
    if (!ip) return '';
    if (ip === '::1' || ip === '127.0.0.1' || ip.startsWith('::ffff:127.0.0.1')) {
        return 'This device (local network)';
    }
    return ip;
}

function sessionIsLoopback(r) {
    if (typeof r.isLoopback === 'boolean') return r.isLoopback;
    const ip = String(r.ip || '').trim();
    return ip === '::1' || ip === '127.0.0.1' || ip.startsWith('::ffff:127.0.0.1');
}

function SessionDeviceIcon({ kind }) {
    const wrapClass = 'acct-session-dev-icon';
    if (kind === 'mobile') {
        return (
            <div className={wrapClass}>
                <FaMobileAlt aria-hidden />
            </div>
        );
    }
    if (kind === 'laptop') {
        return (
            <div className={wrapClass}>
                <FaLaptop aria-hidden />
            </div>
        );
    }
    return (
        <div className={wrapClass}>
            <FaDesktop aria-hidden />
        </div>
    );
}

export default function MyDevicesPage() {
    const { logout } = useAuth();
    const [loading, setLoading] = useState(true);
    const [rows, setRows] = useState([]);
    const [lastRefresh, setLastRefresh] = useState(null);
    const [removingId, setRemovingId] = useState(null);
    /** Browser’s public IP (helps when server only sees 127.0.0.1 / ::1 in dev). */
    const [publicIpHint, setPublicIpHint] = useState(null);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch(`${Config.apiBaseUrl}/auth/sessions`, {
                credentials: 'include',
                headers: { Accept: 'application/json' },
            });
            const json = await res.json();
            if (json.success && Array.isArray(json.data)) {
                setRows(json.data);
                setLastRefresh(new Date());
            } else {
                toast.error(json.message || 'Could not load sessions');
                setRows([]);
            }
        } catch (_e) {
            toast.error('Could not load sessions');
            setRows([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    useEffect(() => {
        if (!rows.some((r) => sessionIsLoopback(r))) {
            setPublicIpHint(null);
            return undefined;
        }
        let cancelled = false;
        fetch('https://api.ipify.org?format=json')
            .then((res) => res.json())
            .then((d) => {
                if (!cancelled && d && typeof d.ip === 'string') setPublicIpHint(d.ip);
            })
            .catch(() => {});
        return () => {
            cancelled = true;
        };
    }, [rows]);

    const handleSignOutThisBrowser = useCallback(async () => {
        await logout();
    }, [logout]);

    const removeSession = async (id) => {
        if (!id || String(id).startsWith('h-')) {
            toast.error('This entry cannot be removed');
            return;
        }
        setRemovingId(id);
        try {
            const res = await fetch(`${Config.apiBaseUrl}/auth/sessions/${encodeURIComponent(id)}`, {
                method: 'DELETE',
                credentials: 'include',
                headers: { Accept: 'application/json' },
            });
            const json = await res.json();
            if (json.success) {
                toast.success(json.message || 'Removed from list');
                await load();
            } else {
                toast.error(json.message || 'Could not remove session');
            }
        } catch (_e) {
            toast.error('Could not remove session');
        } finally {
            setRemovingId(null);
        }
    };

    const refreshLabel = lastRefresh
        ? `Last refreshed ${formatRelativeWhen(lastRefresh.toISOString())}`
        : '—';

    const sessionBadge = loading ? (
        <span className="acct-sessions-count-pill acct-sessions-count-pill-muted">Loading…</span>
    ) : (
        <span className="acct-sessions-count-pill">
            <FaShieldAlt aria-hidden className="acct-sessions-count-ic" />
            {rows.length} active session{rows.length === 1 ? '' : 's'}
        </span>
    );

    return (
        <AccountPageLayout
            title="My Devices"
            subtitle="Recent sign-ins for your account"
            headerBadge={sessionBadge}
        >
            <div className="acct-card acct-devices-card">
                <div className="acct-devices-section-head">
                    <span className="acct-icon-wrap acct-ic-emerald">
                        <FaMobileAlt aria-hidden />
                    </span>
                    <div>
                        <div className="acct-devices-section-title">Sign-in activity</div>
                        <p className="acct-devices-section-desc">
                            Each time you log in, this browser is recorded. The newest entry is your current session.
                        </p>
                    </div>
                </div>

                {loading ? (
                    <div className="acct-loading">Loading sessions…</div>
                ) : rows.length === 0 ? (
                    <div className="acct-empty">
                        No sign-in history yet. Sign out and log in again to populate this list.
                    </div>
                ) : (
                    <ul className="acct-session-list">
                        {rows.map((r) => {
                            const { title, kind } = parseSessionUa(r.userAgent);
                            const ipLine = sessionIpLine(r);
                            return (
                                <li
                                    key={r.id}
                                    className={`acct-session-item${r.current ? ' acct-session-item-current' : ''}`}
                                >
                                    <SessionDeviceIcon kind={kind} />
                                    <div className="acct-session-item-main">
                                        <div className="acct-session-item-title">{title}</div>
                                        <div className="acct-session-item-meta">
                                            <span className="acct-session-meta-chip">
                                                <FaClock aria-hidden size={12} />
                                                {formatRelativeWhen(r.at)}
                                            </span>
                                            {ipLine ? (
                                                <span className="acct-session-meta-chip">IP {ipLine}</span>
                                            ) : null}
                                            {r.current && sessionIsLoopback(r) && publicIpHint ? (
                                                <span
                                                    className="acct-session-meta-chip acct-session-meta-public"
                                                    title="Approximate public address of this browser"
                                                >
                                                    Public ~ {publicIpHint}
                                                </span>
                                            ) : null}
                                        </div>
                                    </div>
                                    <div className="acct-session-item-actions acct-session-actions-group">
                                        {r.current ? (
                                            <>
                                                <span className="acct-badge-current-session">Current session</span>
                                                <button
                                                    type="button"
                                                    className="acct-btn-signout-row"
                                                    onClick={() => void handleSignOutThisBrowser()}
                                                >
                                                    Sign out
                                                </button>
                                            </>
                                        ) : (
                                            <button
                                                type="button"
                                                className="acct-btn-signout-row"
                                                disabled={removingId === r.id}
                                                onClick={() => removeSession(r.id)}
                                            >
                                                {removingId === r.id ? '…' : 'Remove'}
                                            </button>
                                        )}
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                )}

                <div className="acct-session-warning" role="status">
                    <FaExclamationTriangle aria-hidden className="acct-session-warning-ic" />
                    <div>
                        <strong>Don&apos;t recognise a session?</strong> Remove it from this list and consider changing
                        your password in Account Settings to secure your account. <strong>Remove</strong> clears history
                        only; <strong>Sign out</strong> on this device ends your login here. Remote tokens may still be
                        valid until they expire.
                    </div>
                </div>

                <div className="acct-devices-footer">
                    <span className="acct-last-refresh">{refreshLabel}</span>
                    <button type="button" className="acct-btn-ghost" onClick={load} disabled={loading}>
                        Refresh
                    </button>
                </div>
            </div>
        </AccountPageLayout>
    );
}
