// src/components/Sidebar.jsx
import { useState, useMemo, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { FaBars } from 'react-icons/fa';
import { FiSidebar } from 'react-icons/fi';
import { BiChevronDown } from 'react-icons/bi';
import Config from '../config/config';
import { getCurrentState } from '../utils/reduxUtils';

const Sidebar = ({ isFixed, setIsFixed }) => {
    const [isOpen, setIsOpen] = useState(false);
    const location = useLocation();

    // Get modules from Redux store for icons
    const reduxModules = useMemo(() => {
        const state = getCurrentState();
        const configData = state?.logininfo;
        return configData?.modules || [];
    }, []);

    // Single expanded accordion section: opening one module closes the others.
    const [openLabel, setOpenLabel] = useState(null);

    useEffect(() => {
        const activeModule = reduxModules.find((m) =>
            m.menus?.some((menu) => location.pathname === `/${menu.aliasname}`)
        );
        setOpenLabel(activeModule ? activeModule.module : null);
    }, [location.pathname, reduxModules]);

    const expanded = isFixed || isOpen;

    const toggleGroup = (label) => {
        setOpenLabel((prev) => (prev === label ? null : label));
    };

    return (
        <aside
            className={`sidebar ${expanded ? 'sidebar-expanded' : 'sidebar-collapsed'}`}
            onMouseEnter={() => { if (!isFixed) setIsOpen(true); }}
            onMouseLeave={() => { if (!isFixed) setIsOpen(false); }}
        >
            {/* Header */}
            <div className={`sidebar-header ${expanded ? '' : 'justify-content-end'}`}>
                <div className="sidebar-logo">
                    <FaBars size={20} style={{ color: '#94a3b8', flexShrink: 0 }} />
                    <span className="sidebar-logo-text">{Config.projectName}</span>
                </div>
                {expanded && (
                    <button className="sidebar-pin-btn" onClick={() => setIsFixed(!isFixed)}>
                        <FiSidebar size={18} />
                    </button>
                )}
            </div>

            {/* Nav */}
            <nav className="sidebar-nav">
                {/* Show only modules from Redux store that have menus */}
                {reduxModules
                    .filter((module) => module.menus && module.menus.length > 0)
                    .map((module) => {
                        const menus = module.menus;
                        const soleMenu = menus.length === 1 ? menus[0] : null;

                        if (soleMenu) {
                            return (
                                <div key={module._id}>
                                    <NavLink
                                        to={`/${soleMenu.aliasname}`}
                                        className={({ isActive }) =>
                                            `nav-item${isActive ? ' active' : ''}`
                                        }
                                        title={!expanded ? module.module : undefined}
                                    >
                                        <span className={`nav-item-icon ${expanded ? '' : 'ml-4'}`}>
                                            <i className={module.icon} style={{ fontSize: '18px' }} />
                                        </span>
                                        <span className="nav-item-label">{module.module}</span>
                                    </NavLink>
                                </div>
                            );
                        }

                        const hasActive = menus.some(
                            (menu) => location.pathname === `/${menu.aliasname}`
                        );
                        const isGroupOpen = openLabel === module.module;

                        return (
                            <div key={module._id}>
                                <button
                                    type="button"
                                    className={`accordion-header ${hasActive ? 'has-active' : ''} ${hasActive && !expanded ? 'collapsed-active' : ''}`}
                                    onClick={() => toggleGroup(module.module)}
                                    title={!expanded ? module.module : undefined}
                                >
                                    <span className={`nav-item-icon ${expanded ? '' : 'ml-4'}`}>
                                        <i className={module.icon} style={{ fontSize: '18px' }}></i>
                                    </span>
                                    <span className="nav-item-label">{module.module}</span>
                                    <BiChevronDown
                                        size={16}
                                        className={`accordion-arrow ${isGroupOpen ? 'open' : ''}`}
                                    />
                                </button>

                                <div className={`accordion-children ${isGroupOpen && expanded ? 'open' : ''}`}>
                                    {menus.map((menu) => {
                                        return (
                                            <NavLink
                                                key={menu._id}
                                                to={`/${menu.aliasname}`}
                                                className={({ isActive }) =>
                                                    `child-nav-item pl-38 ${isActive ? 'active' : ''}`
                                                }
                                            >
                                                <span className="child-dot" />
                                                {menu.menuname}
                                            </NavLink>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
            </nav>
        </aside>
    );
};

export default Sidebar;