import { useEffect, useState } from 'react';
import { useAuthStore, useBookingStore } from '../store/useStore';
import Layout from '../components/Layout';
import { Link } from 'react-router-dom';

const FLOW_TASKS = [
    { id: 1, title: 'Architectural Review: Project Zenith', client: 'Sarah Jenkins', type: 'Technical Consultation', time: '10:00 AM', icon: 'architecture' },
    { id: 2, title: 'Strategy Alignment Call', client: 'Neo-Tech Corp', type: 'Strategy Brief', time: '2:00 PM', icon: 'align_horizontal_left' },
    { id: 3, title: 'Deep Work: Algorithm Refinement', client: '', type: 'Scheduled block · No interruptions enabled', time: '4:00 PM', icon: 'code' },
];

const CURATOR_NOTES = [
    "Sarah's primary concern: Scalability hurdles in the Q4 roadmap.",
    "Past collaboration note: Prefers data-backed visualizations over verbal summaries.",
    "AI Suggestion: Share the 'Zenith Growth' dashboard early to set the tone.",
];

const RECENT = [
    { label: 'Call with David', sub: 'Completed 2h ago · Summary ready', icon: 'call', color: '#4ade80' },
    { label: 'New Brief: AI Ethics', sub: 'Received from Horizon Corp', icon: 'description', color: 'var(--primary)' },
];

export default function ExpertDashboard() {
    const { user } = useAuthStore();
    const { bookings, fetchExpertBookings } = useBookingStore();
    const [activeSection, setActiveSection] = useState('flow');

    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

    useEffect(() => {
        fetchExpertBookings().catch(() => { });
    }, []);

    return (
        <Layout>
            <div style={{ position: 'relative', overflow: 'hidden', minHeight: '100vh' }}>
                <div className="blob blob-1" style={{ width: '600px', height: '600px', top: '-200px', right: '-100px', opacity: 0.6 }} />

                <div style={{ position: 'relative', zIndex: 1 }}>
                    {/* Header */}
                    <div style={{ padding: '2.5rem 2rem 1.5rem', borderBottom: '1px solid rgba(218,185,255,0.06)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                                <span className="section-label">WORKSPACE CENTRAL</span>
                                <h1 style={{ marginTop: '0.5rem', fontSize: '2rem' }}>
                                    {greeting}, <span style={{ color: 'var(--primary)' }}>{user?.name?.split(' ')[0] || 'Alex'}</span>.
                                </h1>
                                <p style={{ marginTop: '0.5rem', color: 'var(--on-surface-var)' }}>The Curator has prioritized 3 critical tasks for your peak flow state today.</p>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ background: 'rgba(218,185,255,0.08)', borderRadius: 'var(--radius-lg)', padding: '1rem 1.5rem', border: '1px solid rgba(218,185,255,0.12)' }}>
                                    <div className="stat-number">98.4%</div>
                                    <div className="stat-label">Matching Rate</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '2rem', padding: '2rem' }}>

                        {/* Left — Tasks + Network */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                            {/* Intelligent Flow */}
                            <div className="card" style={{ background: 'rgba(143,0,255,0.05)', border: '1px solid rgba(218,185,255,0.08)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.5rem' }}>
                                    <span className="material-icons" style={{ color: 'var(--primary)' }}>auto_awesome</span>
                                    <h3>Intelligent Flow</h3>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }} className="stagger">
                                    {FLOW_TASKS.map((task, i) => (
                                        <div key={task.id} className="animate-fadeInUp" style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', padding: '1rem', borderRadius: 'var(--radius-md)', background: 'var(--surface-ch)', cursor: 'pointer', transition: 'all var(--transition)' }}
                                            onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-chh)'}
                                            onMouseLeave={e => e.currentTarget.style.background = 'var(--surface-ch)'}
                                        >
                                            <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-md)', background: 'linear-gradient(135deg, var(--primary-c), var(--secondary-c))', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                <span className="material-icons" style={{ fontSize: 18, color: '#fff' }}>{task.icon}</span>
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, marginBottom: '2px', fontSize: '0.9rem' }}>{task.title}</div>
                                                <div style={{ fontSize: '0.78rem', color: 'var(--on-surface-var)' }}>
                                                    {task.client && <span style={{ color: 'var(--primary)' }}>{task.client}</span>}
                                                    {task.client && ' · '}
                                                    {task.type}
                                                </div>
                                            </div>
                                            <div style={{ fontSize: '0.8rem', fontFamily: 'var(--font-display)', fontWeight: 600, color: 'var(--on-surface-var)', flexShrink: 0 }}>{task.time}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Network Flow */}
                            <div className="card">
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <span className="material-icons" style={{ color: 'var(--primary)' }}>hub</span>
                                        <h3>Network Flow</h3>
                                    </div>
                                    <span style={{ fontSize: '0.75rem', color: 'var(--on-surface-var)' }}>12 active · 4 pending</span>
                                </div>

                                {/* Visual flow */}
                                <div style={{ background: 'var(--surface-lowest)', borderRadius: 'var(--radius-md)', padding: '1.5rem', marginBottom: '1.25rem', display: 'flex', justifyContent: 'center' }}>
                                    <svg width="260" height="80" viewBox="0 0 260 80">
                                        <defs>
                                            <linearGradient id="flowGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                                                <stop offset="0%" stopColor="#8f00ff" />
                                                <stop offset="100%" stopColor="#dab9ff" />
                                            </linearGradient>
                                        </defs>
                                        {/* Center node */}
                                        <circle cx="130" cy="40" r="16" fill="#8f00ff" opacity="0.9" />
                                        <text x="130" y="44" textAnchor="middle" fill="white" fontSize="10" fontFamily="Manrope" fontWeight="700">YOU</text>
                                        {/* Connecting lines */}
                                        {[[30, 20, '#4ade80'], [30, 60, '#dab9ff'], [230, 15, '#ffb68b'], [230, 65, '#dab9ff'], [80, 75, '#cfc2d9'], [180, 75, '#cfc2d9']].map(([cx, cy, color], i) => (
                                            <g key={i}>
                                                <line x1="130" y1="40" x2={cx} y2={cy} stroke="url(#flowGrad)" strokeWidth="1.5" strokeDasharray="4,3" opacity="0.5">
                                                    <animate attributeName="stroke-dashoffset" from="0" to="-14" dur={`${1.5 + i * 0.3}s`} repeatCount="indefinite" />
                                                </line>
                                                <circle cx={cx} cy={cy} r="8" fill={color} opacity="0.8" />
                                            </g>
                                        ))}
                                    </svg>
                                </div>

                                {/* Flow Health */}
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.25rem' }}>
                                    {[{ l: 'Active', v: '12', c: '#4ade80' }, { l: 'Pending', v: '4', c: 'var(--primary)' }, { l: 'Completed', v: '38', c: 'var(--on-surface-var)' }].map(s => (
                                        <div key={s.l} style={{ textAlign: 'center', padding: '0.75rem', background: 'var(--surface-lowest)', borderRadius: 'var(--radius-md)' }}>
                                            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.5rem', color: s.c }}>{s.v}</div>
                                            <div style={{ fontSize: '0.7rem', color: 'var(--on-surface-var)', marginTop: '2px' }}>{s.l}</div>
                                        </div>
                                    ))}
                                </div>

                                {/* Recent */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    {RECENT.map(r => (
                                        <div key={r.label} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', borderRadius: 'var(--radius)', background: 'var(--surface-lowest)' }}>
                                            <span className="material-icons" style={{ color: r.color, fontSize: '18px' }}>{r.icon}</span>
                                            <div>
                                                <div style={{ fontSize: '0.85rem', fontWeight: 600, fontFamily: 'var(--font-display)' }}>{r.label}</div>
                                                <div style={{ fontSize: '0.72rem', color: 'var(--on-surface-var)' }}>{r.sub}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Right — Curator Summary + Bookings */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            {/* Curator Summary */}
                            <div className="card" style={{ background: 'rgba(143,0,255,0.06)', border: '1px solid rgba(218,185,255,0.1)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.5rem' }}>
                                    <span className="material-icons" style={{ color: 'var(--primary)' }}>psychology</span>
                                    <h3>Curator Summary</h3>
                                </div>
                                <span style={{ fontSize: '0.7rem', color: 'var(--on-surface-var)', marginBottom: '1.25rem', display: 'block' }}>Next Briefing — Sarah Jenkins (Project Zenith)</span>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '1.5rem' }}>
                                    {CURATOR_NOTES.map((note, i) => (
                                        <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                                            <span className="material-icons" style={{ color: '#4ade80', fontSize: '14px', marginTop: '3px', flexShrink: 0 }}>check_circle</span>
                                            <span style={{ fontSize: '0.82rem', color: 'var(--on-surface-var)', lineHeight: 1.5 }}>{note}</span>
                                        </div>
                                    ))}
                                </div>
                                <button className="btn-secondary" style={{ width: '100%', justifyContent: 'center', padding: '10px', fontSize: '0.85rem' }}>
                                    <span className="material-icons" style={{ fontSize: 16 }}>menu_book</span>
                                    View Briefing Journal
                                </button>
                            </div>

                            {/* Bookings from API */}
                            <div className="card">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
                                    <span className="material-icons" style={{ color: 'var(--primary)' }}>event</span>
                                    <h3 style={{ fontSize: '1rem' }}>Upcoming Sessions</h3>
                                </div>
                                {bookings.length === 0 ? (
                                    <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--on-surface-var)' }}>
                                        <span className="material-icons" style={{ fontSize: '2rem', display: 'block', marginBottom: '8px', color: 'var(--outline)' }}>calendar_today</span>
                                        <p style={{ fontSize: '0.82rem' }}>No upcoming sessions yet.</p>
                                        <Link to="/explore" className="btn-ghost" style={{ marginTop: '8px', textDecoration: 'none', display: 'inline-flex', fontSize: '0.8rem' }}>Explore experts</Link>
                                    </div>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        {bookings.slice(0, 4).map(b => (
                                            <div key={b.id} style={{ padding: '10px', borderRadius: 'var(--radius)', background: 'var(--surface-lowest)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <div>
                                                    <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{b.event_types?.title || 'Session'}</div>
                                                    <div style={{ fontSize: '0.72rem', color: 'var(--on-surface-var)' }}>
                                                        {new Date(b.start_time).toLocaleDateString('en', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                    </div>
                                                </div>
                                                <span style={{ fontSize: '0.7rem', padding: '3px 10px', borderRadius: 'var(--radius-full)', background: b.status === 'confirmed' ? 'rgba(74,222,128,0.1)' : 'rgba(218,185,255,0.1)', color: b.status === 'confirmed' ? '#4ade80' : 'var(--primary)', fontWeight: 600, textTransform: 'capitalize' }}>
                                                    {b.status}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
