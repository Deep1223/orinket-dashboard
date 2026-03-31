import { useEffect, useRef, useState } from 'react';

/**
 * InfoBox — Anchored popup panel with RSuite-style placement
 *
 * Props:
 *  open            – boolean
 *  onClose         – fn
 *  anchorEl        – ref | DOM node  (trigger element)
 *  placement       – 'bottomStart' | 'bottomEnd' | 'bottom'
 *                    'topStart'    | 'topEnd'    | 'top'
 *                    'leftStart'   | 'leftEnd'   | 'left'
 *                    'rightStart'  | 'rightEnd'  | 'right'
 *                    'auto' (default — picks best fit)
 *  title           – string
 *  body            – ReactNode
 *  footer          – ReactNode
 *  width           – number (px, default 400)
 *  backdrop        – boolean (default true)
 *  closable        – boolean (default true)
 *  className       – string
 *  headerClassName – string
 *  bodyClassName   – string
 *  footerClassName – string
 */

// ── Compute panel (x, y) from anchor rect + placement ───────────────────────
const GAP = 8; // px gap between anchor and panel

const getPosition = (anchorRect, panelWidth, panelHeight, placement) => {
    const { top, bottom, left, right, width, height } = anchorRect;
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    // Resolved placement (auto picks best vertical fit)
    let resolved = placement || 'auto';
    if (resolved === 'auto') {
        resolved = bottom + panelHeight + GAP > vh ? 'topStart' : 'bottomStart';
    }

    let x = 0, y = 0;

    if (resolved.startsWith('bottom')) {
        y = bottom + GAP;
        if (resolved === 'bottomStart') x = left;
        else if (resolved === 'bottomEnd') x = right - panelWidth;
        else x = left + width / 2 - panelWidth / 2;
    } else if (resolved.startsWith('top')) {
        y = top - panelHeight - GAP;
        if (resolved === 'topStart') x = left;
        else if (resolved === 'topEnd') x = right - panelWidth;
        else x = left + width / 2 - panelWidth / 2;
    } else if (resolved.startsWith('right')) {
        x = right + GAP;
        if (resolved === 'rightStart') y = top;
        else if (resolved === 'rightEnd') y = bottom - panelHeight;
        else y = top + height / 2 - panelHeight / 2;
    } else if (resolved.startsWith('left')) {
        x = left - panelWidth - GAP;
        if (resolved === 'leftStart') y = top;
        else if (resolved === 'leftEnd') y = bottom - panelHeight;
        else y = top + height / 2 - panelHeight / 2;
    }

    // Clamp to viewport
    x = Math.max(8, Math.min(x, vw - panelWidth - 8));
    y = Math.max(8, y);

    return { x, y };
};

const InfoBox = (props) => {
    const {
        open,
        onClose,
        anchorEl,
        placement,
        width,
        backdrop,
        closable,
        className,
        headerClassName,
        bodyClassName,
        footerClassName,
        title,
        body,
        footer,
    } = props;

    const panelRef = useRef(null);
    const [pos, setPos] = useState({ x: -9999, y: -9999 });

    // ── Position panel ───────────────────────────────────────────────────────
    useEffect(() => {
        if (!open) return;

        const anchor = anchorEl?.current ?? anchorEl;
        if (!anchor) return;

        // Use a short RAF so panel is mounted and measurable
        const frame = requestAnimationFrame(() => {
            const anchorRect = anchor.getBoundingClientRect();
            const panelEl    = panelRef.current;
            const panelW     = width || 400;
            const panelH     = panelEl ? panelEl.offsetHeight : 300;
            const { x, y }   = getPosition(anchorRect, panelW, panelH, placement);
            setPos({ x, y });
        });

        return () => cancelAnimationFrame(frame);
    }, [open, anchorEl, placement, width]);

    // ── ESC key ──────────────────────────────────────────────────────────────
    useEffect(() => {
        if (!open) return;
        const handler = (e) => {
            if (e.key === 'Escape' && closable !== false) onClose?.();
        };
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, [open, closable, onClose]);

    // ── Outside click ────────────────────────────────────────────────────────
    useEffect(() => {
        if (!open || backdrop === false) return;
        const handler = (e) => {
            const anchor = anchorEl?.current ?? anchorEl;
            if (
                panelRef.current && !panelRef.current.contains(e.target) &&
                (!anchor || !anchor.contains(e.target))
            ) {
                onClose?.();
            }
        };
        const t = setTimeout(() => document.addEventListener('mousedown', handler), 0);
        return () => { clearTimeout(t); document.removeEventListener('mousedown', handler); };
    }, [open, backdrop, anchorEl, onClose]);

    if (!open) return null;

    return (
        <div
            ref={panelRef}
            className={`infobox-panel ${className || ''}`}
            style={{ position: 'fixed', top: pos.y, left: pos.x, width: width || 400 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="infobox-title"
        >
            {/* ── Header ── */}
            <div className={`infobox-header ${headerClassName || ''}`}>
                <h5 className="infobox-title w-100" id="infobox-title">{title}</h5>
                {closable !== false && (
                    <button className="infobox-close-btn" onClick={onClose} aria-label="Close">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" strokeWidth="2.5"
                            strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6"  y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                )}
            </div>

            {/* ── Body ── */}
            <div className={`infobox-body ${bodyClassName || ''}`}>
                {body}
            </div>

            {/* ── Footer ── */}
            {footer && (
                <div className={`infobox-footer ${footerClassName || ''}`}>
                    {footer}
                </div>
            )}
        </div>
    );
};

export default InfoBox;