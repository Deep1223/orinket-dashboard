import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaBell, FaCog, FaEye, FaEyeSlash, FaLock, FaShieldAlt } from 'react-icons/fa';
import Config from '../../config/config';
import AccountPageLayout from './AccountPageLayout';
import TwoFAModal from '../../components/TwoFAModal';
import ApiService from '../../utils/apiService';
import IISMethods from '../../utils/IISMethods';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { mergeUserIntoLoginSession } from '../../utils/sessionUserMerge';

const NOTIF_STORAGE = 'orinket_dashboard_notif_prefs_v1';
const PREFS_STORAGE = 'orinket_dashboard_locale_prefs_v1';

const TABS = [
    { id: 'password', label: 'Password' },
    { id: 'notifications', label: 'Notifications' },
    { id: 'preferences', label: 'Preferences' },
    { id: 'security', label: 'Security' },
];

function loadJson(key, fallback) {
    try {
        const raw = localStorage.getItem(key);
        if (!raw) return fallback;
        return { ...fallback, ...JSON.parse(raw) };
    } catch {
        return fallback;
    }
}

function passwordStrength(pw) {
    if (!pw) {
        return {
            score: 0,
            label: 'At least 8 characters; must meet your server password rules.',
            tone: 'muted',
            segClass: '',
        };
    }
    let score = 0;
    if (pw.length >= 8) score += 1;
    if (/[A-Z]/.test(pw)) score += 1;
    if (/[0-9]/.test(pw)) score += 1;
    if (/[^A-Za-z0-9]/.test(pw)) score += 1;
    const labels = ['', 'Weak', 'Fair', 'Strong', 'Very strong'];
    const segClass =
        score <= 1 ? 'acct-strength-weak' : score === 2 ? 'acct-strength-fair' : 'acct-strength-strong';
    if (score === 0) {
        return {
            score: 0,
            label: 'Too weak — use at least 8 characters and mix letters, numbers, or symbols.',
            tone: 'weak',
            segClass: 'acct-strength-weak',
        };
    }
    return {
        score,
        label: labels[score] || '',
        tone: score <= 1 ? 'weak' : score === 2 ? 'fair' : 'strong',
        segClass,
    };
}

function PasswordField({ id, label, value, onChange, autoComplete, show, onToggleShow }) {
    return (
        <div className="acct-field acct-fields-v2 form-group">
            <label className="acct-field-label-v2 form-label" htmlFor={id}>
                {label}
            </label>
            <div className="acct-pass-wrap">
                <input
                    id={id}
                    type={show ? 'text' : 'password'}
                    autoComplete={autoComplete}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                />
                <button
                    type="button"
                    className="acct-pass-eye"
                    onClick={onToggleShow}
                    tabIndex={-1}
                    aria-label={show ? 'Hide password' : 'Show password'}
                >
                    {show ? <FaEyeSlash /> : <FaEye />}
                </button>
            </div>
        </div>
    );
}

export default function AccountSettingsPage() {
    const dispatch = useAppDispatch();
    const loginInfo = useAppSelector((s) => s.logininfo);
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const tabParam = searchParams.get('tab');
    const activeTab = TABS.some((t) => t.id === tabParam) ? tabParam : 'password';

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showCur, setShowCur] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConf, setShowConf] = useState(false);
    const [busy, setBusy] = useState(false);

    const [notif, setNotif] = useState(() =>
        loadJson(NOTIF_STORAGE, {
            email: true,
            login: true,
            product: false,
            marketing: false,
        })
    );

    const [twoFA, setTwoFA] = useState(() =>
        Boolean(loginInfo?.user?.is2FAEnabled || loginInfo?.user?.twofactorenabled)
    );
    const [show2FAModal, setShow2FAModal] = useState(false);
    const [twoFAModalType, setTwoFAModalType] = useState('enable');

    useEffect(() => {
        setTwoFA(Boolean(loginInfo?.user?.is2FAEnabled || loginInfo?.user?.twofactorenabled));
    }, [loginInfo?.user?.is2FAEnabled, loginInfo?.user?.twofactorenabled]);

    const handle2FAOpen = () => {
        setTwoFAModalType(twoFA ? 'disable' : 'enable');
        setShow2FAModal(true);
    };

    const handle2FAConfirm = async () => {
        try {
            const newVal = !twoFA;
            const response = await ApiService.put('/auth/2fa', { enabled: newVal });
            if (response.success) {
                setTwoFA(newVal);
                setShow2FAModal(false);
                mergeUserIntoLoginSession(dispatch, { twofactorenabled: newVal });
                IISMethods.successmsg(
                    newVal ? '2FA Authenticator Enabled' : '2FA Authenticator Disabled',
                    1
                );
            } else {
                IISMethods.errormsg(response.message || 'Failed to update 2FA settings', 1);
            }
        } catch (error) {
            console.error('2FA toggle error:', error);
            IISMethods.errormsg('Failed to update 2FA settings', 1);
        }
    };

    const handle2FACancel = () => {
        setShow2FAModal(false);
    };

    const [prefs, setPrefs] = useState(() =>
        loadJson(PREFS_STORAGE, { lang: 'en', tz: 'Asia/Kolkata' })
    );

    const strength = useMemo(() => passwordStrength(newPassword), [newPassword]);

    const matchHint = useMemo(() => {
        if (!confirmPassword) return { text: '', className: 'acct-field-hint-v2' };
        if (newPassword === confirmPassword) return { text: 'Passwords match', className: 'acct-field-hint-v2 acct-hint-success' };
        return { text: 'Passwords do not match', className: 'acct-field-hint-v2 acct-hint-error' };
    }, [newPassword, confirmPassword]);

    const sessionTimeoutLabel = useMemo(() => {
        const min = Math.round(Config.autoLogoutTime / 60000);
        if (min >= 60) return `${min / 60} hour${min === 60 ? '' : 's'} (app default)`;
        return `${min} minutes (app default)`;
    }, []);

    const setTab = (id) => {
        setSearchParams(id === 'password' ? {} : { tab: id });
    };

    const changePassword = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            toast.error('New passwords do not match');
            return;
        }
        if (newPassword.length < 8) {
            toast.error('New password must be at least 8 characters');
            return;
        }
        setBusy(true);
        try {
            const res = await fetch(`${Config.apiBaseUrl}/auth/password`, {
                method: 'PUT',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
                body: JSON.stringify({ currentPassword, newPassword }),
            });
            const json = await res.json();
            if (json.success) {
                toast.success(json.message || 'Password updated');
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
            } else {
                toast.error(json.message || 'Could not update password');
            }
        } catch (_e) {
            toast.error('Could not update password');
        } finally {
            setBusy(false);
        }
    };

    const saveNotifications = useCallback(() => {
        localStorage.setItem(NOTIF_STORAGE, JSON.stringify(notif));
        toast.success('Notification preferences saved');
    }, [notif]);

    const savePreferences = useCallback(() => {
        localStorage.setItem(PREFS_STORAGE, JSON.stringify(prefs));
        toast.success('Preferences saved');
    }, [prefs]);

    const toggleNotif = (key) => {
        setNotif((p) => ({ ...p, [key]: !p[key] }));
    };

    return (
        <AccountPageLayout title="Account Settings" subtitle="Preferences & security">
            <div className="acct-profile-shell">
                    <div className="acct-info-block">
                        Two-factor authentication (2FA) can be turned on or off from the <strong>Security</strong> tab
                        below or from the <strong>My Account</strong> menu in the header — both use the same confirmation
                        flow.
                    </div>

                    <div className="acct-tabs-bar" role="tablist" aria-label="Account settings sections">
                        {TABS.map((t) => (
                            <button
                                key={t.id}
                                type="button"
                                role="tab"
                                aria-selected={activeTab === t.id}
                                id={`as-tab-${t.id}`}
                                aria-controls={`as-panel-${t.id}`}
                                tabIndex={activeTab === t.id ? 0 : -1}
                                className={`acct-tab${activeTab === t.id ? ' acct-tab-active' : ''}`}
                                onClick={() => setTab(t.id)}
                            >
                                {t.id === 'password' ? <FaLock className="acct-tab-ic" aria-hidden /> : null}
                                {t.id === 'notifications' ? <FaBell className="acct-tab-ic" aria-hidden /> : null}
                                {t.id === 'preferences' ? <FaCog className="acct-tab-ic" aria-hidden /> : null}
                                {t.id === 'security' ? <FaShieldAlt className="acct-tab-ic" aria-hidden /> : null}
                                {t.label}
                            </button>
                        ))}
                    </div>

                    <div
                        id="as-panel-password"
                        role="tabpanel"
                        aria-labelledby="as-tab-password"
                        hidden={activeTab !== 'password'}
                        className="acct-tab-panel"
                    >
                        <div className="acct-section-card">
                            <div className="acct-sec-header">
                                <div className="acct-sec-icon acct-sec-icon-lock">
                                    <FaLock />
                                </div>
                                <div>
                                    <div className="acct-sec-title">Change password</div>
                                    <div className="acct-sec-desc">Use a strong password you don&apos;t use elsewhere</div>
                                </div>
                            </div>
                            <form className="acct-sec-body" onSubmit={changePassword}>
                                <PasswordField
                                    id="as-cur"
                                    label="Current password"
                                    value={currentPassword}
                                    onChange={setCurrentPassword}
                                    autoComplete="current-password"
                                    show={showCur}
                                    onToggleShow={() => setShowCur((s) => !s)}
                                />
                                <PasswordField
                                    id="as-new"
                                    label="New password"
                                    value={newPassword}
                                    onChange={setNewPassword}
                                    autoComplete="new-password"
                                    show={showNew}
                                    onToggleShow={() => setShowNew((s) => !s)}
                                />
                                <div className="acct-strength-bar" aria-hidden>
                                    {[0, 1, 2, 3].map((i) => {
                                        const filled =
                                            newPassword &&
                                            (strength.score === 0
                                                ? i === 0
                                                : i < strength.score);
                                        return (
                                            <div
                                                key={i}
                                                className={`acct-strength-seg${
                                                    filled && strength.segClass ? ` ${strength.segClass}` : ''
                                                }`}
                                            />
                                        );
                                    })}
                                </div>
                                <p
                                    className={`acct-strength-label acct-strength-label-${strength.tone}`}
                                >
                                    {strength.label}
                                </p>

                                <PasswordField
                                    id="as-confirm"
                                    label="Confirm new password"
                                    value={confirmPassword}
                                    onChange={setConfirmPassword}
                                    autoComplete="new-password"
                                    show={showConf}
                                    onToggleShow={() => setShowConf((s) => !s)}
                                />
                                {matchHint.text ? <p className={matchHint.className}>{matchHint.text}</p> : null}

                                <div className="acct-sec-footer">
                                    <button type="button" className="acct-btn-demo-ghost" onClick={() => {
                                        setCurrentPassword('');
                                        setNewPassword('');
                                        setConfirmPassword('');
                                    }} disabled={busy}>
                                        Cancel
                                    </button>
                                    <button type="submit" className="acct-btn-demo-primary" disabled={busy}>
                                        {busy ? 'Updating…' : 'Update password'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>

                    <div
                        id="as-panel-notifications"
                        role="tabpanel"
                        aria-labelledby="as-tab-notifications"
                        hidden={activeTab !== 'notifications'}
                        className="acct-tab-panel"
                    >
                        <div className="acct-section-card">
                            <div className="acct-sec-header">
                                <div className="acct-sec-icon acct-sec-icon-notif">
                                    <FaBell />
                                </div>
                                <div>
                                    <div className="acct-sec-title">Notification preferences</div>
                                    <div className="acct-sec-desc">Control what alerts you receive (stored on this device)</div>
                                </div>
                            </div>
                            <div className="acct-sec-body acct-sec-body-tight">
                                <div className="acct-toggle-row">
                                    <div>
                                        <div className="acct-toggle-label">Email notifications</div>
                                        <div className="acct-toggle-sub">Activity digests and alerts via email</div>
                                    </div>
                                    <label className={`acct-switch${notif.email ? ' acct-switch-on' : ''}`}>
                                        <input
                                            type="checkbox"
                                            checked={notif.email}
                                            onChange={() => toggleNotif('email')}
                                        />
                                        <span className="acct-switch-track" />
                                        <span className="acct-switch-thumb" />
                                    </label>
                                </div>
                                <div className="acct-toggle-row">
                                    <div>
                                        <div className="acct-toggle-label">Login alerts</div>
                                        <div className="acct-toggle-sub">Reminders when new devices sign in</div>
                                    </div>
                                    <label className={`acct-switch${notif.login ? ' acct-switch-on' : ''}`}>
                                        <input
                                            type="checkbox"
                                            checked={notif.login}
                                            onChange={() => toggleNotif('login')}
                                        />
                                        <span className="acct-switch-track" />
                                        <span className="acct-switch-thumb" />
                                    </label>
                                </div>
                                <div className="acct-toggle-row">
                                    <div>
                                        <div className="acct-toggle-label">Product updates</div>
                                        <div className="acct-toggle-sub">New features and releases</div>
                                    </div>
                                    <label className={`acct-switch${notif.product ? ' acct-switch-on' : ''}`}>
                                        <input
                                            type="checkbox"
                                            checked={notif.product}
                                            onChange={() => toggleNotif('product')}
                                        />
                                        <span className="acct-switch-track" />
                                        <span className="acct-switch-thumb" />
                                    </label>
                                </div>
                                <div className="acct-toggle-row">
                                    <div>
                                        <div className="acct-toggle-label">Marketing emails</div>
                                        <div className="acct-toggle-sub">Promotions, surveys, and tips</div>
                                    </div>
                                    <label className={`acct-switch${notif.marketing ? ' acct-switch-on' : ''}`}>
                                        <input
                                            type="checkbox"
                                            checked={notif.marketing}
                                            onChange={() => toggleNotif('marketing')}
                                        />
                                        <span className="acct-switch-track" />
                                        <span className="acct-switch-thumb" />
                                    </label>
                                </div>
                            </div>
                            <div className="acct-sec-footer">
                                <button type="button" className="acct-btn-demo-primary" onClick={saveNotifications}>
                                    Save preferences
                                </button>
                            </div>
                        </div>
                    </div>

                    <div
                        id="as-panel-preferences"
                        role="tabpanel"
                        aria-labelledby="as-tab-preferences"
                        hidden={activeTab !== 'preferences'}
                        className="acct-tab-panel"
                    >
                        <div className="acct-section-card">
                            <div className="acct-sec-header">
                                <div className="acct-sec-icon acct-sec-icon-cog">
                                    <FaCog />
                                </div>
                                <div>
                                    <div className="acct-sec-title">Regional preferences</div>
                                    <div className="acct-sec-desc">Language and timezone (saved locally for future use)</div>
                                </div>
                            </div>
                            <div className="acct-sec-body acct-fields-v2">
                                <div className="acct-field">
                                    <label className="acct-field-label-v2" htmlFor="as-lang">
                                        Language
                                    </label>
                                    <select
                                        id="as-lang"
                                        value={prefs.lang}
                                        onChange={(e) => setPrefs((p) => ({ ...p, lang: e.target.value }))}
                                    >
                                        <option value="en">English</option>
                                        <option value="hi">Hindi</option>
                                    </select>
                                </div>
                                <div className="acct-field">
                                    <label className="acct-field-label-v2" htmlFor="as-tz">
                                        Timezone
                                    </label>
                                    <select
                                        id="as-tz"
                                        value={prefs.tz}
                                        onChange={(e) => setPrefs((p) => ({ ...p, tz: e.target.value }))}
                                    >
                                        <option value="Asia/Kolkata">Asia / Kolkata</option>
                                        <option value="UTC">UTC</option>
                                        <option value="America/New_York">America / New York</option>
                                        <option value="Europe/London">Europe / London</option>
                                    </select>
                                    <p className="acct-field-hint-v2">App-wide session timeout still follows server configuration.</p>
                                </div>
                            </div>
                            <div className="acct-sec-footer">
                                <button type="button" className="acct-btn-demo-primary" onClick={savePreferences}>
                                    Save preferences
                                </button>
                            </div>
                        </div>
                    </div>

                    <div
                        id="as-panel-security"
                        role="tabpanel"
                        aria-labelledby="as-tab-security"
                        hidden={activeTab !== 'security'}
                        className="acct-tab-panel"
                    >
                        <div className="acct-section-card">
                            <div className="acct-sec-header">
                                <div className="acct-sec-icon acct-sec-icon-shield">
                                    <FaShieldAlt />
                                </div>
                                <div>
                                    <div className="acct-sec-title">Security</div>
                                    <div className="acct-sec-desc">Sessions and sign-in activity</div>
                                </div>
                            </div>
                            <div className="acct-sec-body acct-sec-body-tight">
                                <div className="acct-toggle-row">
                                    <div>
                                        <div className="acct-toggle-label">Two-factor authentication (2FA)</div>
                                        <div className="acct-toggle-sub">
                                            Require a code from your authenticator app when signing in
                                        </div>
                                    </div>
                                    <label className={`acct-switch${twoFA ? ' acct-switch-on' : ''}`}>
                                        <input
                                            type="checkbox"
                                            checked={twoFA}
                                            onChange={handle2FAOpen}
                                            aria-label={twoFA ? 'Disable two-factor authentication' : 'Enable two-factor authentication'}
                                        />
                                        <span className="acct-switch-track" />
                                        <span className="acct-switch-thumb" />
                                    </label>
                                </div>
                                <div className="acct-toggle-row">
                                    <div>
                                        <div className="acct-toggle-label">Active sessions</div>
                                        <div className="acct-toggle-sub">View devices and recent sign-ins</div>
                                    </div>
                                    <button
                                        type="button"
                                        className="acct-btn-demo-ghost acct-btn-compact"
                                        onClick={() => navigate('/my-devices')}
                                    >
                                        Manage devices
                                    </button>
                                </div>
                                <div className="acct-toggle-row acct-toggle-row-static">
                                    <div>
                                        <div className="acct-toggle-label">Session timeout</div>
                                        <div className="acct-toggle-sub">Automatic sign-out after inactivity</div>
                                    </div>
                                    <span className="acct-session-timeout-val">{sessionTimeoutLabel}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            <TwoFAModal
                isOpen={show2FAModal}
                type={twoFAModalType}
                onConfirm={handle2FAConfirm}
                onCancel={handle2FACancel}
            />
        </AccountPageLayout>
    );
}
