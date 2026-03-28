import { useState } from 'react';
import { FaUser, FaCog, FaMobileAlt, FaChartBar, FaQuestionCircle, FaCommentAlt, FaSignOutAlt, FaShieldAlt } from 'react-icons/fa';
import { IoClose } from 'react-icons/io5';
import DrawerRsuite from './DrawerRsuite';
import TwoFAModal from './TwoFAModal';
import IISMethods from '../utils/IISMethods';
import ApiService from '../utils/apiService';

// ── Reusable menu item ────────────────────────────────────────────────────────
const MenuItem = ({ icon, color, title, desc, badge, rightElement }) => (
    <div className="pd-menu-item">
        <div className={`pd-menu-icon pd-ic-${color}`}>{icon}</div>
        <div className="pd-menu-info">
            <div className="pd-menu-title">{title}</div>
            <div className="pd-menu-desc">{desc}</div>
        </div>
        {badge && <span className="badge badge-danger">{badge}</span>}
        {rightElement
            ? <div className="pd-menu-right">{rightElement}</div>
            : <span className="pd-menu-arrow">›</span>
        }
    </div>
);

// ── Toggle Switch ─────────────────────────────────────────────────────────────
const Toggle = ({ checked, onChange }) => (
    <label className="pd-toggle" onClick={(e) => e.stopPropagation()}>
        <input type="checkbox" checked={checked} onChange={onChange} />
        <span className="pd-toggle-slider" />
    </label>
);

// ── Profile Drawer Body ───────────────────────────────────────────────────────
const ProfileDrawerBody = ({ loginInfo, onSignOut, onClose }) => {
    const userName = loginInfo?.user?.firstName || loginInfo?.user?.firstname || loginInfo?.user?.email || 'Guest';
    const userRole = loginInfo?.user?.role || 'User';
    const userEmail = loginInfo?.user?.email || '';
    const userCode = loginInfo?.user?.usercode || '';
    const initial = userName.charAt(0).toUpperCase();
    const is2FAEnabled = loginInfo?.user?.is2FAEnabled || false;

    const [twoFA, setTwoFA] = useState(is2FAEnabled);
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState('enable');

    const handle2FAToggle = () => {
        setModalType(twoFA ? 'disable' : 'enable');
        setShowModal(true);
    };

    const handleModalConfirm = async () => {
        try {
            const newVal = !twoFA;

            // Call API to enable/disable 2FA
            const response = await ApiService.put('/auth/2fa', { enabled: newVal });

            if (response.success) {
                setTwoFA(newVal);
                setShowModal(false);
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

    const handleModalCancel = () => {
        setShowModal(false);
    };

    return (
        <div className="pd-root">

            {/* ── Dark Header ── */}
            <div className="pd-header">
                <div className="pd-header-inner">

                    {/* Top row */}
                    <div className="pd-top-row">
                        <span className="pd-label">My Account</span>
                        <div className="d-flex align-items-center gap-8">
                            <button className="pd-signout-btn" onClick={onSignOut}>
                                <FaSignOutAlt size={12} /> Sign Out
                            </button>
                            <button className="pd-close-btn" onClick={onClose}>
                                <IoClose size={13} />
                            </button>
                        </div>
                    </div>

                    {/* Avatar + info */}
                    <div className="pd-profile-row">
                        <div className="pd-avatar-wrap">
                            <div className="pd-avatar">{initial}</div>
                            <span className="pd-online-dot" />
                        </div>
                        <div className="pd-profile-info">
                            <div className="pd-name">{userName}</div>
                            <div className="pd-designation">{userRole}</div>
                            <div className="pd-badges">
                                <span className="badge badge-primary">Super Admin</span>
                                <span className="badge badge-success">Active</span>
                            </div>
                        </div>
                    </div>

                    {/* Info pills */}
                    <div className="pd-pills">
                        {userEmail && (
                            <div className="pd-pill">
                                <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                                    <polyline points="22,6 12,13 2,6" />
                                </svg>
                                <span>{userEmail}</span>
                            </div>
                        )}
                        {userCode && (
                            <div className="pd-pill">
                                <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 3H8a2 2 0 0 0-2 2v2h12V5a2 2 0 0 0-2-2z" />
                                </svg>
                                <span>{userCode}</span>
                            </div>
                        )}
                    </div>

                </div>
            </div>

            {/* ── Menu Body ── */}
            <div className="pd-body">
                <div className="pd-section">
                    <div className="pd-section-label">Account</div>
                    <MenuItem icon={<FaUser size={15} />} color="violet" title="My Profile" desc="View & edit your information" />
                    <MenuItem icon={<FaCog size={15} />} color="slate" title="Account Settings" desc="Preferences & security" />
                    <MenuItem icon={<FaMobileAlt size={15} />} color="emerald" title="My Devices" desc="Manage logged-in devices" />
                </div>

                {/* ── Security section with 2FA toggle ── */}
                <div className="pd-section">
                    <div className="pd-section-label">Security</div>
                    <MenuItem
                        icon={<FaShieldAlt size={15} />}
                        color="sky"
                        title="2FA Authenticator"
                        desc={twoFA ? 'Two-factor auth is ON' : 'Two-factor auth is OFF'}
                        rightElement={
                            <Toggle checked={twoFA} onChange={handle2FAToggle} />
                        }
                    />
                </div>

                <div className="pd-section">
                    <div className="pd-section-label">Workspace</div>
                    <MenuItem icon={<FaChartBar size={15} />} color="amber" title="Activity Log" desc="Your recent actions" />
                    <MenuItem icon={<FaQuestionCircle size={14} />} color="sky" title="Need Help?" desc="Docs & support center" />
                    <MenuItem icon={<FaCommentAlt size={14} />} color="violet" title="Send Feedback" desc="Help us improve" badge="New" />
                </div>
            </div>

            {/* ── Footer ── */}
            <div className="pd-footer">
                <div className="pd-online-badge">
                    <span className="pd-online-pulse" /> Online
                </div>
                <span className="pd-version">v1.0.0</span>
            </div>

            {/* ── TwoFA Modal ── */}
            <TwoFAModal
                isOpen={showModal}
                type={modalType}
                onConfirm={handleModalConfirm}
                onCancel={handleModalCancel}
            />

        </div>
    );
};

// ── Main export ───────────────────────────────────────────────────────────────
const ProfileDrawer = ({ loginInfo, onSignOut }) => {
    const handleClose = () => IISMethods.handleGrid(false, 'profiledrawer', 0);
    const handleSignOut = () => { onSignOut(); handleClose(); };

    return (
        <DrawerRsuite
            size="xs"
            removeheader={true}
            bodyClassName={'profile-drawer'}
            title=""
            modalname="profiledrawer"
            body={
                <ProfileDrawerBody
                    loginInfo={loginInfo}
                    onSignOut={handleSignOut}
                    onClose={handleClose}
                />
            }
        />
    );
};

export default ProfileDrawer;