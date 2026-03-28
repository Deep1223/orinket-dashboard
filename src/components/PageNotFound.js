// src/components/PageNotFound.jsx
import { useNavigate } from 'react-router-dom';
import Config from '../config/config';

const PageNotFound = () => {
    const navigate = useNavigate();

    return (
        <div style={styles.board}>
            {/* Glow blobs */}
            <div style={{ ...styles.blob, ...styles.blob1 }} />
            <div style={{ ...styles.blob, ...styles.blob2 }} />

            {/* Content */}
            <div style={styles.content}>

                {/* 404 Number Block */}
                <div style={styles.numBlock}>
                    <div style={styles.numBg}>404</div>
                    <div style={styles.numFg}>
                        <span style={styles.digit}>4</span>
                        <div style={styles.zeroRing}>
                            <div style={styles.zeroInner} />
                            <div style={styles.zeroDot} />
                        </div>
                        <span style={styles.digit}>4</span>
                    </div>
                </div>

                {/* Status Tag */}
                <div style={styles.statusTag}>
                    <span style={styles.pulse}>
                        <span style={styles.pulseRing} />
                    </span>
                    {Config.pageNotFoundTitle}
                </div>

                {/* Heading */}
                <h1 style={styles.heading}>{Config.pageNotFoundOops}</h1>

                {/* Description */}
                <p style={styles.desc}>
                    {Config.pageNotFoundDesc}
                </p>

                {/* Buttons */}
                <div style={styles.btns}>
                    <button style={styles.btnPrimary} onClick={() => navigate(-1)}
                        onMouseEnter={e => Object.assign(e.currentTarget.style, styles.btnPrimaryHover)}
                        onMouseLeave={e => Object.assign(e.currentTarget.style, styles.btnPrimary)}
                    >
                        <ArrowLeftIcon />
                        {Config.goBackBtn}
                    </button>
                    <button style={styles.btnOutline} onClick={() => navigate('/')}
                        onMouseEnter={e => Object.assign(e.currentTarget.style, styles.btnOutlineHover)}
                        onMouseLeave={e => Object.assign(e.currentTarget.style, styles.btnOutline)}
                    >
                        <HomeIcon />
                        {Config.backToHomeBtn}
                    </button>
                </div>

                {/* URL Hint */}
                <div style={styles.hint}>
                    <InfoIcon />
                    {Config.requestedUrlLabel}&nbsp;
                    <code style={styles.hintCode}>{window.location.pathname}</code>
                </div>

            </div>
        </div>
    );
};

/* ── Inline SVG Icons ─────────────────────────────────── */
const ArrowLeftIcon = () => (
    <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
        <path strokeLinecap="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
    </svg>
);
const HomeIcon = () => (
    <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7m-9 2v9m-4 0h4m6 0h4m-10 0V12" />
    </svg>
);
const InfoIcon = () => (
    <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <path strokeLinecap="round" d="M12 8v4m0 4h.01" />
    </svg>
);

/* ── Styles ───────────────────────────────────────────── */
const C = Config.THEME;

const styles = {
    board: {
        position: 'fixed',
        inset: 0,
        backgroundColor: C.background,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
        overflow: 'hidden',
        zIndex: 9999,
    },
    blob: {
        position: 'absolute',
        width: '500px',
        height: '500px',
        borderRadius: '50%',
        filter: 'blur(80px)',
        opacity: 0.15,
        zIndex: 0,
    },
    blob1: {
        top: '-100px',
        left: '-100px',
        background: C.primary,
    },
    blob2: {
        bottom: '-100px',
        right: '-100px',
        background: C.primaryMedium,
    },
    content: {
        position: 'relative',
        zIndex: 1,
        textAlign: 'center',
        padding: '2rem',
        maxWidth: '600px',
        width: '100%',
    },
    numBlock: {
        position: 'relative',
        marginBottom: '2.5rem',
    },
    numBg: {
        fontSize: '12rem',
        fontWeight: 900,
        color: C.primaryLight,
        lineHeight: 1,
        userSelect: 'none',
    },
    numFg: {
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1rem',
    },
    digit: {
        fontSize: '7rem',
        fontWeight: 800,
        color: C.text,
        textShadow: `0 10px 20px rgba(15, 21, 40, 0.1)`,
    },
    zeroRing: {
        width: '80px',
        height: '80px',
        borderRadius: '50%',
        border: `12px solid ${C.primary}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        boxShadow: `0 10px 20px rgba(67, 97, 238, 0.2)`,
    },
    zeroInner: {
        width: '30px',
        height: '30px',
        borderRadius: '50%',
        border: `6px solid ${C.primaryMedium}`,
    },
    zeroDot: {
        position: 'absolute',
        width: '8px',
        height: '8px',
        background: C.primary,
        borderRadius: '50%',
        top: '5px',
        right: '5px',
    },
    statusTag: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.6rem',
        padding: '0.5rem 1rem',
        background: C.white,
        border: `1px solid ${C.border}`,
        borderRadius: '100px',
        fontSize: '0.85rem',
        fontWeight: 600,
        color: C.primary,
        marginBottom: '1.5rem',
        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
    },
    pulse: {
        width: '8px',
        height: '8px',
        background: C.primary,
        borderRadius: '50%',
        position: 'relative',
    },
    pulseRing: {
        position: 'absolute',
        inset: '-4px',
        border: `2px solid ${C.primary}`,
        borderRadius: '50%',
        opacity: 0.5,
    },
    heading: {
        fontSize: '2.25rem',
        fontWeight: 800,
        color: C.text,
        marginBottom: '1rem',
        letterSpacing: '-0.02em',
    },
    desc: {
        fontSize: '1.05rem',
        color: C.textMuted,
        lineHeight: 1.6,
        marginBottom: '2.5rem',
    },
    btns: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1rem',
        marginBottom: '3rem',
    },
    btnPrimary: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.8rem 1.5rem',
        background: C.primary,
        color: C.white,
        border: 'none',
        borderRadius: '12px',
        fontSize: '0.95rem',
        fontWeight: 600,
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        boxShadow: `0 4px 12px ${C.primary}33`,
    },
    btnPrimaryHover: {
        background: C.primaryDark,
        transform: 'translateY(-1px)',
        boxShadow: `0 6px 15px ${C.primary}4D`,
    },
    btnOutline: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.8rem 1.5rem',
        background: C.white,
        color: C.text,
        border: `1px solid ${C.border}`,
        borderRadius: '12px',
        fontSize: '0.95rem',
        fontWeight: 600,
        cursor: 'pointer',
        transition: 'all 0.2s ease',
    },
    btnOutlineHover: {
        background: C.primaryLight,
        borderColor: C.primaryMedium,
        color: C.primary,
    },
    hint: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
        fontSize: '0.8rem',
        color: C.textMuted,
        padding: '0.75rem 1rem',
        background: `${C.border}40`,
        borderRadius: '10px',
        border: `1px dashed ${C.border}`,
    },
    hintCode: {
        color: C.primary,
        fontWeight: 600,
    }
};

export default PageNotFound;
