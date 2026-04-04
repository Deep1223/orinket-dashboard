import { useEffect, useMemo, useState } from 'react';
import { FaChevronDown, FaChevronUp, FaComments, FaGraduationCap, FaHeadset, FaSearch } from 'react-icons/fa';
import { IoDocumentTextOutline } from 'react-icons/io5';
import WorkspaceShell from './WorkspaceShell';

const RESOURCES = [
    {
        title: 'Documentation',
        desc: 'Full reference guides and API docs for all features.',
        href: 'https://github.com',
        icon: IoDocumentTextOutline,
    },
    {
        title: 'Getting Started',
        desc: 'Step-by-step tutorials to get up and running quickly.',
        href: 'https://github.com',
        icon: FaGraduationCap,
    },
    {
        title: 'Community Forum',
        desc: 'Ask questions and connect with other users.',
        href: 'https://github.com',
        icon: FaComments,
    },
    {
        title: 'Contact Support',
        desc: 'Reach our team directly for account-specific issues.',
        href: 'mailto:support@example.com',
        icon: FaHeadset,
    },
];

const FAQS = [
    {
        q: 'How do I enable two-factor authentication?',
        a: 'Go to Account Settings → Security tab. Toggle the 2FA switch and follow the setup steps to link your authenticator app. You can also use the My Account menu in the header.',
    },
    {
        q: 'How do I manage active sessions?',
        a: 'Open My Account → My Devices (or Account Settings → Security → Manage devices). You can view recent sign-ins and remove entries from your history. Use Sign out on the current row to end this browser session.',
    },
    {
        q: 'How do I change my password?',
        a: 'Account Settings → Password tab. Enter your current password and a new strong password, then update.',
    },
    {
        q: 'Where can I find my activity history?',
        a: 'Workspace → Activity Log shows audit events tied to your account, such as profile and security changes.',
    },
];

export default function WorkspaceHelpPage() {
    const [q, setQ] = useState('');
    const [openKey, setOpenKey] = useState(FAQS[0]?.q || null);

    const norm = q.trim().toLowerCase();
    const resources = useMemo(() => {
        if (!norm) return RESOURCES;
        return RESOURCES.filter(
            (r) => r.title.toLowerCase().includes(norm) || r.desc.toLowerCase().includes(norm)
        );
    }, [norm]);

    const faqs = useMemo(() => {
        if (!norm) return FAQS;
        return FAQS.filter((f) => f.q.toLowerCase().includes(norm) || f.a.toLowerCase().includes(norm));
    }, [norm]);

    useEffect(() => {
        if (openKey && !faqs.some((f) => f.q === openKey)) {
            setOpenKey(faqs[0]?.q ?? null);
        }
    }, [faqs, openKey]);

    return (
        <WorkspaceShell>
            <h1 className="ws-main-h1">Need Help?</h1>
            <p className="ws-main-sub">Documentation, guides, and support resources.</p>
            <div className="ws-divider" />

            <div className="ws-search">
                <FaSearch aria-hidden />
                <input
                    type="search"
                    placeholder="Search docs, guides, FAQs…"
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    aria-label="Search help"
                />
            </div>

            <div className="ws-cards">
                {resources.map((r) => {
                    const Ic = r.icon;
                    return (
                        <div key={r.title} className="ws-card">
                            <div className="ws-card-ic">
                                <Ic aria-hidden />
                            </div>
                            <h3 className="ws-card-title">{r.title}</h3>
                            <p className="ws-card-desc">{r.desc}</p>
                            <a className="ws-card-link" href={r.href} target="_blank" rel="noopener noreferrer">
                                Browse →
                            </a>
                        </div>
                    );
                })}
            </div>

            <h2 className="ws-faq-title">Frequently asked questions</h2>
            {faqs.length === 0 ? (
                <div className="ws-empty">No FAQs match your search.</div>
            ) : (
                <div>
                    {faqs.map((f) => {
                        const expanded = openKey === f.q;
                        return (
                            <div key={f.q} className="ws-faq-item">
                                <button
                                    type="button"
                                    className="ws-faq-q"
                                    onClick={() => setOpenKey(expanded ? null : f.q)}
                                    aria-expanded={expanded}
                                >
                                    <span>{f.q}</span>
                                    {expanded ? <FaChevronUp aria-hidden /> : <FaChevronDown aria-hidden />}
                                </button>
                                {expanded ? <div className="ws-faq-a">{f.a}</div> : null}
                            </div>
                        );
                    })}
                </div>
            )}
        </WorkspaceShell>
    );
}
