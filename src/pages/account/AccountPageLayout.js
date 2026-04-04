import './accountPages.css';

export default function AccountPageLayout({ title, subtitle, headerBadge, children }) {
    return (
        <div className="acct-page">
            <div className="acct-page-inner">
                <header className="acct-hero-card">
                    <div className="acct-hero-inner">
                        <div className="acct-hero-text">
                            <h1 className="acct-title">{title}</h1>
                            {subtitle ? <p className="acct-subtitle">{subtitle}</p> : null}
                        </div>
                        {headerBadge ? <div className="acct-hero-badge">{headerBadge}</div> : null}
                    </div>
                </header>
                {children}
            </div>
        </div>
    );
}
