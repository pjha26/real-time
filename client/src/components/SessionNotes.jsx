import { useState } from 'react';
import { FileText, Sparkles, Copy, Download, X, Loader2, CheckCircle2 } from 'lucide-react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function SessionNotes({ booking, onClose }) {
    const [topics, setTopics] = useState('');
    const [keyPoints, setKeyPoints] = useState('');
    const [notes, setNotes] = useState(null);
    const [loading, setLoading] = useState(false);
    const [copied, setCopied] = useState(false);

    const expertName = booking?.experts?.name || booking?.expert_name || 'Expert';
    const sessionTitle = booking?.event_types?.title || booking?.event_title || 'Expert Consultation';

    const handleGenerate = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API}/api/sessions/${booking.id}/notes`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ topics, keyPoints, expertName, sessionTitle }),
            });
            const data = await res.json();
            setNotes(data.summary);
            // Save to localStorage
            const saved = JSON.parse(localStorage.getItem('session_notes') || '{}');
            saved[booking.id] = { summary: data.summary, generated_at: data.generated_at };
            localStorage.setItem('session_notes', JSON.stringify(saved));
        } catch (err) {
            console.error('Failed to generate notes:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(notes);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDownload = () => {
        const blob = new Blob([notes], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `session_notes_${booking.id}.md`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 2000, padding: '2rem',
        }} onClick={onClose}>
            <div
                className="animate-fadeInUp"
                onClick={e => e.stopPropagation()}
                style={{
                    width: '100%', maxWidth: '640px', maxHeight: '85vh', overflowY: 'auto',
                    background: 'var(--surface-lowest)', borderRadius: 'var(--radius-xl)',
                    border: '1px solid var(--surface-ch)', padding: '2rem',
                    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
                }}
            >
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                            <FileText size={20} color="var(--primary)" />
                            <h3 style={{ fontFamily: 'var(--font-body)', fontWeight: 700, color: 'var(--on-surface)' }}>Session Notes</h3>
                        </div>
                        <p style={{ fontSize: '0.8rem', color: 'var(--on-surface-var)' }}>
                            {sessionTitle} with <strong style={{ color: 'var(--primary)' }}>{expertName}</strong>
                        </p>
                    </div>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--on-surface-var)', padding: '4px' }}>
                        <X size={20} />
                    </button>
                </div>

                {!notes ? (
                    <>
                        {/* Input Form */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
                            <div>
                                <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--on-surface)', display: 'block', marginBottom: '6px' }}>Topics Discussed</label>
                                <input
                                    className="input"
                                    placeholder="e.g., System architecture, API design, scaling strategy"
                                    value={topics}
                                    onChange={e => setTopics(e.target.value)}
                                    style={{ background: 'var(--surface-low)', border: '1px solid var(--surface-ch)' }}
                                />
                            </div>
                            <div>
                                <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--on-surface)', display: 'block', marginBottom: '6px' }}>Key Takeaways</label>
                                <textarea
                                    className="input"
                                    rows={3}
                                    placeholder="e.g., Decided on microservices approach, Need to benchmark DB options, Follow up on auth provider"
                                    value={keyPoints}
                                    onChange={e => setKeyPoints(e.target.value)}
                                    style={{ resize: 'vertical', background: 'var(--surface-low)', border: '1px solid var(--surface-ch)' }}
                                />
                            </div>
                        </div>
                        <button
                            className="btn-primary"
                            onClick={handleGenerate}
                            disabled={loading}
                            style={{ width: '100%', padding: '14px', fontSize: '0.95rem', justifyContent: 'center', gap: '10px' }}
                        >
                            {loading ? (
                                <><Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} /> Generating with AI...</>
                            ) : (
                                <><Sparkles size={20} /> Generate Summary</>
                            )}
                        </button>
                    </>
                ) : (
                    <>
                        {/* Generated Notes */}
                        <div style={{
                            background: 'var(--surface-low)', borderRadius: 'var(--radius-lg)',
                            border: '1px solid var(--surface-ch)', padding: '1.5rem', marginBottom: '1rem',
                            fontSize: '0.88rem', color: 'var(--on-surface-var)', lineHeight: 1.7,
                            whiteSpace: 'pre-wrap', fontFamily: 'var(--font-body)',
                        }}>
                            {notes}
                        </div>

                        {/* Actions */}
                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                            <button className="btn-secondary" onClick={handleCopy} style={{ flex: 1, justifyContent: 'center', gap: '8px', fontSize: '0.85rem' }}>
                                {copied ? <><CheckCircle2 size={16} color="#4ade80" /> Copied!</> : <><Copy size={16} /> Copy</>}
                            </button>
                            <button className="btn-secondary" onClick={handleDownload} style={{ flex: 1, justifyContent: 'center', gap: '8px', fontSize: '0.85rem' }}>
                                <Download size={16} /> Download .md
                            </button>
                            <button className="btn-ghost" onClick={() => setNotes(null)} style={{ fontSize: '0.85rem' }}>
                                Regenerate
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
