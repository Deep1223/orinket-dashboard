import { useState } from 'react';
import { toast } from 'react-toastify';
import Config from '../../config/config';
import WorkspaceShell from './WorkspaceShell';

const RATINGS = [
    { value: 1, emoji: '😞', label: 'Poor' },
    { value: 2, emoji: '😐', label: 'Fair' },
    { value: 3, emoji: '🙂', label: 'Good' },
    { value: 4, emoji: '😊', label: 'Great' },
    { value: 5, emoji: '😄', label: 'Excellent' },
];

const TYPES = ['Bug report', 'Feature request', 'UI/UX issue', 'Performance', 'Other'];

export default function SendFeedbackPage() {
    const [rating, setRating] = useState(4);
    const [type, setType] = useState('Feature request');
    const [message, setMessage] = useState('');
    const [includeScreenshot, setIncludeScreenshot] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const submit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const res = await fetch(`${Config.apiBaseUrl}/auth/feedback`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
                body: JSON.stringify({
                    rating,
                    type,
                    message,
                    includeScreenshot,
                }),
            });
            const json = await res.json();
            if (json.success) {
                toast.success(json.message || 'Feedback submitted');
                setMessage('');
            } else {
                toast.error(json.message || 'Could not submit');
            }
        } catch {
            toast.error('Could not submit feedback');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <WorkspaceShell>
            <h1 className="ws-main-h1">Send Feedback</h1>
            <p className="ws-main-sub">Help us improve your experience.</p>
            <div className="ws-divider" />

            <form onSubmit={submit}>
                <span className="ws-label">How would you rate your experience?</span>
                <div className="ws-rating-row">
                    {RATINGS.map((r) => (
                        <button
                            key={r.value}
                            type="button"
                            className={`ws-rate-card${rating === r.value ? ' ws-rate-card-active' : ''}`}
                            onClick={() => setRating(r.value)}
                        >
                            <span className="ws-rate-emoji" aria-hidden>
                                {r.emoji}
                            </span>
                            <span className="ws-rate-label">{r.label}</span>
                        </button>
                    ))}
                </div>

                <span className="ws-label">What type of feedback is this?</span>
                <div className="ws-type-row">
                    {TYPES.map((t) => (
                        <button
                            key={t}
                            type="button"
                            className={`ws-type-pill${type === t ? ' ws-type-pill-active' : ''}`}
                            onClick={() => setType(t)}
                        >
                            {t}
                        </button>
                    ))}
                </div>

                <label className="ws-label" htmlFor="fb-msg">
                    Tell us more
                    <span className="ws-label-hint">Optional details help us act faster.</span>
                </label>
                <textarea
                    id="fb-msg"
                    className="ws-textarea"
                    placeholder="Describe your experience or suggestion…"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    maxLength={5000}
                />

                <div className="ws-toggle-row">
                    <div>
                        <div className="ws-label" style={{ marginBottom: 0 }}>
                            Attach screenshot
                        </div>
                        <div className="ws-toggle-sub">Flag if you’re willing to share a screen capture later (not uploaded yet).</div>
                    </div>
                    <label className={`ws-switch${includeScreenshot ? ' ws-switch-on' : ''}`}>
                        <input
                            type="checkbox"
                            checked={includeScreenshot}
                            onChange={() => setIncludeScreenshot((v) => !v)}
                            aria-label="Include screenshot preference"
                        />
                        <span className="ws-switch-track" />
                        <span className="ws-switch-thumb" />
                    </label>
                </div>

                <button type="submit" className="ws-submit" disabled={submitting}>
                    {submitting ? 'Submitting…' : 'Submit feedback'}
                </button>
            </form>
        </WorkspaceShell>
    );
}
