import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore, useBookingStore } from '../store/useStore';
import Layout from '../components/Layout';

const OPPORTUNITIES = [
    { title: 'Fintech Architect for 3-month contract', desc: 'Scaling a cross-border payment protocol using Rust and WASM. High complexity.', match: 97, urgent: true },
    { title: 'DeFi Protocol Security Auditor', desc: 'Smart contract audit for a new liquidity layer. Focus on EVM compatibility.', match: 93, urgent: false },
];

const SESSIONS = [
    { title: 'Architecture Review', org: 'Project Zenith Core Team', time: '14:00 - 14:45', urgency: 'In 15 Minutes', icon: 'auto_stories', action: 'Quick Prep', color: 'var(--primary)' },
    { title: 'Matching Interview', org: 'Fintech Protocol Candidate', time: '16:30 - 17:30', urgency: 'Today', icon: 'history_edu', action: 'Briefing Docs', color: '#ffb68b' },
    { title: 'Strategy Sync', org: 'Global Payments Corp', time: 'Tomorrow', urgency: '', icon: 'description', action: 'View Specs', color: '#4ade80' },
];

const PULSE = [
    { label: 'Velocity', val: '4.8', unit: '/5' },
    { label: 'Alignment', val: '92', unit: '%' },
    { label: 'Response', val: '12', unit: 'min' },
    { label: 'Impact', val: 'A+', unit: '' },
];

function useTimer() {
    const [elapsed, setElapsed] = useState(3 * 3600 + 42 * 60 + 15);
    useEffect(() => {
        const id = setInterval(() => setElapsed(t => t + 1), 1000);
        return () => clearInterval(id);
    }, []);
    const h = String(Math.floor(elapsed / 3600)).padStart(2, '0');
    const m = String(Math.floor((elapsed % 3600) / 60)).padStart(2, '0');
    const s = String(elapsed % 60).padStart(2, '0');
    return `${h}:${m}:${s}`;
}

export default function LuminalExpertPortal() {
    const { user } = useAuthStore();
    const { bookings, fetchExpertBookings } = useBookingStore();
    const timer = useTimer();

    useEffect(() => { fetchExpertBookings().catch(() => { }); }, []);

    return (
        <Layout>
            <div style={{ position: 'relative', overflow: 'hidden' }}>
                <div className="blob blob-1" style={{ opacity: 0.5 }} />

                {/* ── Header bar ── */}
                <div style={{ padding: '2rem 2rem 0', position: 'relative', zIndex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                        <div>
                            <span className="section-label">LUMINAL FLOW · EXPERT PORTAL</span>
                            <h1 style={{ fontSize: '1.5rem', marginTop: '0.4rem' }}>
                                {user?.name || 'Dr. Aris Varma'} &mdash;{' '}
                                <span style={{ color: 'var(--on-surface-var)', fontWeight: 400, fontSize: '1.1rem' }}>
                                    Current focus: Blockchain Migration Strategy for Project Zenith
                                </span>
                            </h1>
                        </div>
                    </div>

                    {/* KPI strip */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, auto) 1fr', gap: '1rem', marginTop: '1.25rem', marginBottom: '2rem', flexWrap: 'wrap', maxWidth: 640 }}>
                        {[
                            { label: 'Time in Flow', val: timer, icon: 'timer', mono: true },
                            { label: 'Match Quality', val: '99.2%', icon: 'verified', mono: false },
                            { label: 'Next Session', val: '14:00', icon: 'schedule', mono: false },
                        ].map(k => (
                            <div key={k.label} style={{ background: 'rgba(218,185,255,0.06)', border: '1px solid rgba(218,185,255,0.1)', borderRadius: 'var(--radius-lg)', padding: '1rem 1.5rem', textAlign: 'center' }}>
                                <span className="material-icons" style={{ color: 'var(--primary)', fontSize: '20px', marginBottom: '4px', display: 'block' }}>{k.icon}</span>
                                <div style={{ fontFamily: k.mono ? 'monospace' : 'var(--font-display)', fontWeight: 800, fontSize: k.mono ? '1.3rem' : '1.6rem', color: 'var(--primary)', letterSpacing: k.mono ? '0.05em' : 0 }}>{k.val}</div>
                                <div style={{ fontSize: '0.7rem', color: 'var(--on-surface-var)', marginTop: '2px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{k.label}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── Main grid ── */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem', padding: '0 2rem 2rem', position: 'relative', zIndex: 1 }}>

                    {/* AI Concierge */}
                    <div className="card" style={{ background: 'rgba(143,0,255,0.06)', border: '1px solid rgba(218,185,255,0.1)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
                            <span className="material-icons" style={{ color: 'var(--primary)' }}>psychology</span>
                            <h3>AI Concierge</h3>
                            <div className="pulse-dot" style={{ marginLeft: 'auto' }} />
                        </div>
                        <div style={{ background: 'var(--surface-lowest)', borderRadius: 'var(--radius-md)', padding: '14px', marginBottom: '1rem', fontSize: '0.875rem', lineHeight: 1.6, fontStyle: 'italic' }}>
                            "Aris, your alignment for today is <strong style={{ color: '#4ade80' }}>Optimal</strong>. Zenith's migration requires your technical review by 16:00."
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {[
                                'Confirm protocol specs with Lead Architect.',
                                'Review 2 new high-match contract offers.',
                            ].map((task, i) => (
                                <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                                    <span className="material-icons" style={{ color: '#4ade80', fontSize: '16px', marginTop: '2px', flexShrink: 0 }}>check_circle</span>
                                    <span style={{ fontSize: '0.82rem', color: 'var(--on-surface-var)', lineHeight: 1.5 }}>{task}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* High-Match Opportunities */}
                    <div className="card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span className="material-icons" style={{ color: 'var(--primary)' }}>auto_awesome</span>
                                <h3>High-Match Opportunities</h3>
                            </div>
                            <Link to="/search" className="btn-ghost" style={{ textDecoration: 'none', fontSize: '0.78rem', padding: '4px 10px' }}>View All</Link>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {OPPORTUNITIES.map((opp, i) => (
                                <div key={i} style={{ padding: '14px', background: 'var(--surface-lowest)', borderRadius: 'var(--radius-md)', position: 'relative' }}>
                                    {opp.urgent && (
                                        <span style={{ position: 'absolute', top: '10px', right: '10px', fontSize: '0.65rem', padding: '2px 8px', borderRadius: 'var(--radius-full)', background: 'rgba(255,182,139,0.1)', color: '#ffb68b', fontWeight: 600 }}>URGENT</span>
                                    )}
                                    <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.875rem', marginBottom: '6px', paddingRight: opp.urgent ? '60px' : 0 }}>{opp.title}</div>
                                    <p style={{ fontSize: '0.78rem', color: 'var(--on-surface-var)', marginBottom: '10px', lineHeight: 1.5 }}>{opp.desc}</p>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 700 }}>{opp.match}% match</span>
                                        <button className="btn-primary" style={{ padding: '4px 14px', fontSize: '0.78rem' }}>Apply</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Collaboration Pulse + Sessions */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {/* Pulse */}
                        <div className="card">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
                                <span className="material-icons" style={{ color: 'var(--primary)' }}>analytics</span>
                                <h3>Collaboration Pulse</h3>
                            </div>
                            <p style={{ fontSize: '0.75rem', color: 'var(--on-surface-var)', marginBottom: '1rem' }}>Engagement performance metrics across current ecosystem</p>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                                {PULSE.map(p => (
                                    <div key={p.label} style={{ textAlign: 'center', padding: '10px', background: 'var(--surface-lowest)', borderRadius: 'var(--radius-md)' }}>
                                        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.4rem', color: 'var(--primary)' }}>{p.val}<span style={{ fontSize: '0.8rem', fontWeight: 400, color: 'var(--on-surface-var)' }}>{p.unit}</span></div>
                                        <div style={{ fontSize: '0.7rem', color: 'var(--on-surface-var)', marginTop: '2px' }}>{p.label}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Upcoming Sessions */}
                        <div className="card" style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
                                <span className="material-icons" style={{ color: 'var(--primary)' }}>event</span>
                                <h3>Upcoming Sessions</h3>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {SESSIONS.map((s, i) => (
                                    <div key={i} style={{ padding: '12px', background: 'var(--surface-lowest)', borderRadius: 'var(--radius-md)', borderLeft: `3px solid ${s.color}` }}>
                                        {s.urgency && <div style={{ fontSize: '0.68rem', color: '#ffb68b', fontWeight: 700, marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{s.urgency}</div>}
                                        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.875rem', marginBottom: '2px' }}>{s.title}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--on-surface-var)', marginBottom: '8px' }}>{s.org} · {s.time}</div>
                                        <button className="btn-secondary" style={{ padding: '5px 12px', fontSize: '0.75rem', display: 'inline-flex', gap: '5px' }}>
                                            <span className="material-icons" style={{ fontSize: 14 }}>{s.icon}</span>
                                            {s.action}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
