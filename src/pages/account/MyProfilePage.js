import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaMapMarkerAlt, FaUser } from 'react-icons/fa';
import Config from '../../config/config';
import { useAppDispatch } from '../../store/hooks';
import { mergeUserIntoLoginSession } from '../../utils/sessionUserMerge';
import AccountPageLayout from './AccountPageLayout';

const TABS = [
    { id: 'profile', label: 'Profile' },
    { id: 'address', label: 'Address' },
];

function displayNameFromForm(form) {
    const n = [form.firstname, form.lastname].filter(Boolean).join(' ').trim();
    if (n) return n;
    if (form.username) return form.username;
    return '—';
}

function ProfileAvatar({ imageUrl, fallbackLetter }) {
    const [broken, setBroken] = useState(false);
    useEffect(() => {
        setBroken(false);
    }, [imageUrl]);
    const showImg = imageUrl && !broken;
    return (
        <div className="acct-avatar-lg-wrap">
            {showImg ? (
                <img
                    src={imageUrl}
                    alt=""
                    className="acct-avatar-lg-img"
                    onError={() => setBroken(true)}
                />
            ) : (
                <div className="acct-avatar-lg">{fallbackLetter}</div>
            )}
        </div>
    );
}

export default function MyProfilePage() {
    const dispatch = useAppDispatch();
    const [searchParams, setSearchParams] = useSearchParams();
    const tabParam = searchParams.get('tab');
    const activeTab = TABS.some((t) => t.id === tabParam) ? tabParam : 'profile';
    const imgUrlRef = useRef(null);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({
        firstname: '',
        lastname: '',
        email: '',
        username: '',
        usercode: '',
        mobilenumber: '',
        profileimage: '',
        addressline1: '',
        city: '',
        state: '',
        country: '',
        pincode: '',
    });

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch(`${Config.apiBaseUrl}/auth/me`, {
                credentials: 'include',
                headers: { Accept: 'application/json' },
            });
            const json = await res.json();
            if (!json.success || !json.data) {
                toast.error(json.message || 'Could not load profile');
                return;
            }
            const u = json.data;
            setForm({
                firstname: u.firstname || '',
                lastname: u.lastname || '',
                email: u.email || '',
                username: u.username || '',
                usercode: u.usercode || '',
                mobilenumber: u.mobilenumber || '',
                profileimage: u.profileimage || '',
                addressline1: u.addressline1 || '',
                city: u.city || '',
                state: u.state || '',
                country: u.country || '',
                pincode: u.pincode || '',
            });
            mergeUserIntoLoginSession(dispatch, u);
        } catch (_e) {
            toast.error('Could not load profile');
        } finally {
            setLoading(false);
        }
    }, [dispatch]);

    useEffect(() => {
        load();
    }, [load]);

    const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

    const save = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await fetch(`${Config.apiBaseUrl}/auth/profile`, {
                method: 'PUT',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
                body: JSON.stringify({
                    firstname: form.firstname,
                    lastname: form.lastname,
                    mobilenumber: form.mobilenumber,
                    profileimage: form.profileimage,
                    addressline1: form.addressline1,
                    city: form.city,
                    state: form.state,
                    country: form.country,
                    pincode: form.pincode,
                }),
            });
            const json = await res.json();
            if (json.success && json.data) {
                toast.success(json.message || 'Profile saved');
                mergeUserIntoLoginSession(dispatch, json.data);
            } else {
                toast.error(json.message || 'Save failed');
            }
        } catch (_e) {
            toast.error('Save failed');
        } finally {
            setSaving(false);
        }
    };

    const setTab = (id) => {
        setSearchParams(id === 'profile' ? {} : { tab: id });
    };

    const initialLetter = useMemo(() => {
        const c = (form.firstname || form.email || '?').charAt(0);
        return c.toUpperCase();
    }, [form.firstname, form.email]);

    if (loading) {
        return (
            <AccountPageLayout title="My Profile" subtitle="View & edit your information">
                <div className="acct-loading">Loading profile…</div>
            </AccountPageLayout>
        );
    }

    return (
        <AccountPageLayout title="My Profile" subtitle="View & edit your information">
            <div className="acct-profile-shell">
                <div className="acct-info-block">
                    Updates are saved to your account when you choose <strong>Save changes</strong>. Email and
                    username are read-only here.
                </div>

                <form onSubmit={save}>
                    <div className="acct-tabs-bar" role="tablist" aria-label="Profile sections">
                        {TABS.map((t) => (
                            <button
                                key={t.id}
                                type="button"
                                role="tab"
                                aria-selected={activeTab === t.id}
                                id={`tab-${t.id}`}
                                aria-controls={`panel-${t.id}`}
                                tabIndex={activeTab === t.id ? 0 : -1}
                                className={`acct-tab${activeTab === t.id ? ' acct-tab-active' : ''}`}
                                onClick={() => setTab(t.id)}
                            >
                                {t.id === 'profile' ? <FaUser className="acct-tab-ic" aria-hidden /> : null}
                                {t.id === 'address' ? <FaMapMarkerAlt className="acct-tab-ic" aria-hidden /> : null}
                                {t.label}
                            </button>
                        ))}
                    </div>

                    <div
                        id="panel-profile"
                        role="tabpanel"
                        aria-labelledby="tab-profile"
                        hidden={activeTab !== 'profile'}
                        className="acct-tab-panel"
                    >
                        <div className="acct-section-card">
                            <div className="acct-sec-header">
                                <div className="acct-sec-icon acct-sec-icon-profile">
                                    <FaUser />
                                </div>
                                <div>
                                    <div className="acct-sec-title">Profile information</div>
                                    <div className="acct-sec-desc">Update your name, contact details and profile photo</div>
                                </div>
                            </div>
                            <div className="acct-sec-body">
                                <div className="acct-avatar-upload">
                                    <ProfileAvatar imageUrl={form.profileimage} fallbackLetter={initialLetter} />
                                    <div className="acct-avatar-actions">
                                        <button
                                            type="button"
                                            className="acct-btn-upload"
                                            onClick={() => imgUrlRef.current?.focus()}
                                        >
                                            Set photo URL
                                        </button>
                                        <div className="acct-avatar-hint">Paste an image URL below (e.g. from your media library)</div>
                                    </div>
                                </div>

                                <div className="acct-form-grid two-col acct-fields-v2">
                                    <div className="acct-field  form-group">
                                        <label className="acct-field-label-v2 form-label" htmlFor="mp-first">
                                            First name
                                        </label>
                                        <input
                                            id="mp-first"
                                            value={form.firstname}
                                            onChange={(e) => set('firstname', e.target.value)}
                                            autoComplete="given-name"
                                        />
                                    </div>
                                    <div className="acct-field  form-group">
                                        <label className="acct-field-label-v2 form-label" htmlFor="mp-last">
                                            Last name
                                        </label>
                                        <input
                                            id="mp-last"
                                            value={form.lastname}
                                            onChange={(e) => set('lastname', e.target.value)}
                                            autoComplete="family-name"
                                        />
                                    </div>
                                </div>

                                <div className="acct-field acct-fields-v2 form-group">
                                    <label className="acct-field-label-v2 form-label" htmlFor="mp-email">
                                        Email address
                                    </label>
                                    <input id="mp-email" className="acct-readonly" value={form.email} readOnly />
                                </div>

                                <div className="acct-field acct-fields-v2 form-group">
                                    <label className="acct-field-label-v2 form-label" htmlFor="mp-display">
                                        Display name
                                    </label>
                                    <input
                                        id="mp-display"
                                        className="acct-readonly"
                                        readOnly
                                        value={displayNameFromForm(form)}
                                    />
                                    <p className="acct-field-hint-v2">This is shown across the application (from your first and last name).</p>
                                </div>

                                <div className="acct-form-grid two-col acct-fields-v2">
                                    <div className="acct-field form-group">
                                        <label className="acct-field-label-v2 form-label" htmlFor="mp-user">
                                            Username
                                        </label>
                                        <input id="mp-user" className="acct-readonly" value={form.username} readOnly />
                                    </div>
                                    <div className="acct-field  form-group">
                                        <label className="acct-field-label-v2 form-label" htmlFor="mp-code">
                                            User / API code
                                        </label>
                                        <input id="mp-code" className="acct-readonly" value={form.usercode} readOnly />
                                    </div>
                                </div>

                                <div className="acct-field acct-fields-v2 form-group">
                                    <label className="acct-field-label-v2 form-label" htmlFor="mp-phone">
                                        Mobile
                                    </label>
                                    <input
                                        id="mp-phone"
                                        value={form.mobilenumber}
                                        onChange={(e) => set('mobilenumber', e.target.value)}
                                        autoComplete="tel"
                                    />
                                </div>
                            </div>
                            <div className="acct-sec-footer">
                                <button type="button" className="acct-btn-demo-ghost" onClick={load} disabled={saving}>
                                    Discard
                                </button>
                                <button type="submit" className="acct-btn-demo-primary" disabled={saving}>
                                    {saving ? 'Saving…' : 'Save changes'}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div
                        id="panel-address"
                        role="tabpanel"
                        aria-labelledby="tab-address"
                        hidden={activeTab !== 'address'}
                        className="acct-tab-panel"
                    >
                        <div className="acct-section-card">
                            <div className="acct-sec-header">
                                <div className="acct-sec-icon acct-sec-icon-address">
                                    <FaMapMarkerAlt />
                                </div>
                                <div>
                                    <div className="acct-sec-title">Address</div>
                                    <div className="acct-sec-desc">Where we can reach you for deliveries or records</div>
                                </div>
                            </div>
                            <div className="acct-sec-body">
                                <div className="acct-field acct-fields-v2 form-group">
                                    <label className="acct-field-label-v2 form-label" htmlFor="mp-addr">
                                        Address line
                                    </label>
                                    <textarea
                                        id="mp-addr"
                                        value={form.addressline1}
                                        onChange={(e) => set('addressline1', e.target.value)}
                                        rows={3}
                                    />
                                </div>
                                <div className="acct-form-grid two-col acct-fields-v2">
                                    <div className="acct-field  form-group">
                                        <label className="acct-field-label-v2 form-label" htmlFor="mp-city">
                                            City
                                        </label>
                                        <input id="mp-city" value={form.city} onChange={(e) => set('city', e.target.value)} />
                                    </div>
                                    <div className="acct-field  form-group">
                                        <label className="acct-field-label-v2 form-label" htmlFor="mp-state">
                                            State
                                        </label>
                                        <input id="mp-state" value={form.state} onChange={(e) => set('state', e.target.value)} />
                                    </div>
                                    <div className="acct-field  form-group">
                                        <label className="acct-field-label-v2 form-label" htmlFor="mp-country">
                                            Country
                                        </label>
                                        <input
                                            id="mp-country"
                                            value={form.country}
                                            onChange={(e) => set('country', e.target.value)}
                                        />
                                    </div>
                                    <div className="acct-field  form-group">
                                        <label className="acct-field-label-v2 form-label" htmlFor="mp-pin">
                                            PIN / ZIP
                                        </label>
                                        <input id="mp-pin" value={form.pincode} onChange={(e) => set('pincode', e.target.value)} />
                                    </div>
                                </div>
                            </div>
                            <div className="acct-sec-footer">
                                <button type="button" className="acct-btn-demo-ghost" onClick={load} disabled={saving}>
                                    Discard
                                </button>
                                <button type="submit" className="acct-btn-demo-primary" disabled={saving}>
                                    {saving ? 'Saving…' : 'Save changes'}
                                </button>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </AccountPageLayout>
    );
}
