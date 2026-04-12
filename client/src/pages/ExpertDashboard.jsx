import { useEffect, useState } from 'react';
import { useAuthStore, useBookingStore, useSocketStore } from '../store/useStore';
import Layout from '../components/Layout';
import { Link, useLocation } from 'react-router-dom';
import {
    PencilRuler,
    AlignLeft,
    Code2,
    Phone,
    FileText,
    Sparkles,
    Network,
    Brain,
    CheckCircle2,
    BookOpen,
    Calendar,
    ArrowRight,
    Bell
} from 'lucide-react';

const FLOW_TASKS = [
    { id: 1, title: 'Architectural Review: Project Zenith', client: 'Sarah Jenkins', type: 'Technical Consultation', time: '10:00 AM', icon: PencilRuler },
    { id: 2, title: 'Strategy Alignment Call', client: 'Neo-Tech Corp', type: 'Strategy Brief', time: '2:00 PM', icon: AlignLeft },
    { id: 3, title: 'Deep Work: Algorithm Refinement', client: '', type: 'Scheduled block · No interruptions enabled', time: '4:00 PM', icon: Code2 },
];

const CURATOR_NOTES = [
    "Sarah's primary concern: Scalability hurdles in the Q4 roadmap.",
    "Past collaboration note: Prefers data-backed visualizations over verbal summaries.",
    "AI Suggestion: Share the 'Zenith Growth' dashboard early to set the tone.",
];

const RECENT = [
    { label: 'Call with David', sub: 'Completed 2h ago · Summary ready', icon: Phone, color: '#4ade80' },
    { label: 'New Brief: AI Ethics', sub: 'Received from Horizon Corp', icon: FileText, color: 'var(--primary)' },
];

export default function ExpertDashboard() {
    const { user } = useAuthStore();
    const { bookings, fetchExpertBookings } = useBookingStore();
    const { connect, socket } = useSocketStore();
    const location = useLocation();

    const [toastMessage, setToastMessage] = useState(null);

    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

    useEffect(() => {
        fetchExpertBookings().catch(() => { });
        
        // ── Real-Time Socket Connection ──
        if (user) {
            connect(user.id, user.role || 'client');
        }
    }, [user, connect]);

    useEffect(() => {
        if (!socket) return;
        
        const handleNewBooking = (data) => {
            setToastMessage(`New Workspace Initialized!`);
            // Auto hide after 5s
            setTimeout(() => setToastMessage(null), 5000);
            fetchExpertBookings().catch(() => { }); // refresh bookings
        };

        socket.on('booking:new', handleNewBooking);
        return () => socket.off('booking:new', handleNewBooking);
    }, [socket]);

    return (
        <Layout>
            {/* Real-time Toast Notification */}
            {toastMessage && (
                <div className="animate-fadeInUp" style={{ position: 'fixed', top: '20px', right: '20px', background: 'var(--surface-lowest)', border: '1px solid var(--primary)', borderRadius: 'var(--radius-lg)', padding: '1rem', display: 'flex', alignItems: 'center', gap: '12px', zIndex: 1000, boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
                    <div style={{ background: 'rgba(50, 255, 126, 0.2)', padding: '8px', borderRadius: '50%' }}>
                        <Bell size={20} color="var(--primary)" />
                    </div>
                    <div>
                        <div style={{ fontFamily: 'var(--font-body)', fontWeight: 700, color: 'var(--on-surface)' }}>{toastMessage}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--on-surface-var)', fontFamily: 'var(--font-mono)' }}>Just now via The Curator</div>
                    </div>
                </div>
            )}

            <div style={{ position: 'relative', overflow: 'hidden', minHeight: '100vh' }}>
                <div className="blob blob-1" style={{ width: '600px', height: '600px', top: '-200px', right: '-100px', opacity: 0.6 }} />

                <div style={{ position: 'relative', zIndex: 1 }}>
                    {/* Header */}
                    <div style={{ padding: '2.5rem 2rem 1.5rem', borderBottom: '1px solid var(--surface-ch)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                                <span className="section-label">
                                    {location.pathname.includes('bookings') ? 'MY BOOKINGS' : 
                                     location.pathname.includes('collaborations') ? 'COLLABORATIONS' :
                                     location.pathname.includes('curator') ? 'AI CURATOR' : 'WORKSPACE CENTRAL'}
                                </span>
                                <h1 style={{ marginTop: '0.5rem', fontSize: '2rem', color: 'var(--on-surface)' }}>
                                    {greeting}, <span style={{ color: 'var(--primary)' }}>{user?.name?.split(' ')[0] || 'Alex'}</span>.
                                </h1>
                                <p style={{ marginTop: '0.5rem', color: 'var(--on-surface-var)', fontFamily: 'var(--font-mono)' }}>The Curator has prioritized 3 critical tasks for your peak flow state today.</p>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ background: 'var(--surface-lowest)', borderRadius: 'var(--radius-xl)', padding: '1rem 1.5rem', border: '1px solid var(--surface-ch)' }}>
                                    <div className="stat-number" style={{ fontFamily: 'var(--font-mono)', color: 'var(--primary)' }}>98.4%</div>
                                    <div className="stat-label">Matching Rate</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '2rem', padding: '2rem' }}>

                        {/* Left — Tasks + Network */}
                        {(!location.pathname.includes('bookings') && !location.pathname.includes('curator')) && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                                {/* Intelligent Flow */}
                                {(!location.pathname.includes('collaborations')) && (
                                <div className="card" style={{ background: 'var(--surface-lowest)', border: '1px solid var(--surface-ch)', borderRadius: 'var(--radius-xl)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.5rem' }}>
                                        <Sparkles size={20} color="var(--primary)" />
                                        <h3 style={{ color: 'var(--on-surface)', fontFamily: 'var(--font-body)', fontWeight: 700 }}>Intelligent Flow</h3>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }} className="stagger">
                                        {FLOW_TASKS.map((task, i) => (
                                            <div key={task.id} className="animate-fadeInUp" style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', padding: '1.25rem', borderRadius: 'var(--radius-xl)', background: 'var(--surface-low)', cursor: 'pointer', transition: 'all var(--transition)', border: '1px solid var(--surface-ch)' }}
                                                onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-lowest)'}
                                                onMouseLeave={e => e.currentTarget.style.background = 'var(--surface-low)'}
                                            >
                                                <div style={{ width: 42, height: 42, borderRadius: 'var(--radius-md)', background: 'linear-gradient(135deg, var(--primary), var(--primary-c))', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                    <task.icon size={20} color="var(--on-primary)" />
                                                </div>
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ fontFamily: 'var(--font-body)', fontWeight: 600, marginBottom: '2px', fontSize: '0.95rem', color: 'var(--on-surface)' }}>{task.title}</div>
                                                    <div style={{ fontSize: '0.8rem', color: 'var(--on-surface-var)', fontFamily: 'var(--font-mono)' }}>
                                                        {task.client && <span style={{ color: 'var(--primary)', fontWeight: 600 }}>{task.client}</span>}
                                                        {task.client && ' · '}
                                                        {task.type}
                                                    </div>
                                                </div>
                                                <div style={{ fontSize: '0.85rem', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--primary)', flexShrink: 0 }}>{task.time}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                )}

                                {/* Network Flow */}
                                {(!location.pathname.includes('workspace') && location.pathname.includes('collaborations')) && (
                                <div className="card" style={{ borderRadius: 'var(--radius-xl)', background: 'var(--surface-lowest)', border: '1px solid var(--surface-ch)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <Network size={20} color="var(--primary)" />
                                            <h3 style={{ color: 'var(--on-surface)', fontFamily: 'var(--font-body)', fontWeight: 700 }}>Network Flow</h3>
                                        </div>
                                        <span style={{ fontSize: '0.75rem', color: 'var(--on-surface-var)', fontFamily: 'var(--font-mono)' }}>12 ACTIVE · 4 PENDING</span>
                                    </div>

                                    {/* Visual flow */}
                                    <div style={{ background: 'var(--surface-low)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', marginBottom: '1.25rem', display: 'flex', justifyContent: 'center', border: '1px solid var(--surface-ch)' }}>
                                        <svg width="260" height="80" viewBox="0 0 260 80">
                                            <defs>
                                                <linearGradient id="flowGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                                                    <stop offset="0%" stopColor="var(--primary)" />
                                                    <stop offset="100%" stopColor="var(--primary-c)" />
                                                </linearGradient>
                                            </defs>
                                            {/* Center node */}
                                            <circle cx="130" cy="40" r="16" fill="var(--primary)" opacity="0.9" />
                                            <text x="130" y="44" textAnchor="middle" fill="var(--on-primary)" fontSize="10" fontFamily="var(--font-mono)" fontWeight="700">YOU</text>
                                            {/* Connecting lines */}
                                            {[[30, 20, 'var(--primary-c)'], [30, 60, 'var(--accent)'], [230, 15, 'var(--primary)'], [230, 65, 'var(--tertiary)'], [80, 75, 'var(--outline)'], [180, 75, 'var(--outline)']].map(([cx, cy, color], i) => (
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
                                        {[{ l: 'Active', v: '12', c: 'var(--primary)' }, { l: 'Pending', v: '4', c: 'var(--tertiary)' }, { l: 'Completed', v: '38', c: 'var(--on-surface-var)' }].map(s => (
                                            <div key={s.l} style={{ textAlign: 'center', padding: '0.75rem', background: 'var(--surface-low)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--surface-ch)' }}>
                                                <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: '1.5rem', color: s.c }}>{s.v}</div>
                                                <div style={{ fontSize: '0.7rem', color: 'var(--on-surface-var)', marginTop: '2px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.l}</div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Recent */}
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        {RECENT.map(r => (
                                            <div key={r.label} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px', borderRadius: 'var(--radius-lg)', background: 'var(--surface-low)', border: '1px solid var(--surface-ch)' }}>
                                                <r.icon size={18} color="var(--primary)" />
                                                <div>
                                                    <div style={{ fontSize: '0.85rem', fontWeight: 600, fontFamily: 'var(--font-body)', color: 'var(--on-surface)' }}>{r.label}</div>
                                                    <div style={{ fontSize: '0.75rem', color: 'var(--on-surface-var)', fontFamily: 'var(--font-mono)' }}>{r.sub}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                )}
                            </div>
                        )}

                        {/* Right — Curator Summary + Bookings */}
                        {(!location.pathname.includes('collaborations')) && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            {/* Curator Summary */}
                            {(!location.pathname.includes('bookings')) && (
                            <div className="card" style={{ background: 'var(--surface-lowest)', border: '1px solid var(--surface-ch)', borderRadius: 'var(--radius-xl)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.5rem' }}>
                                    <Brain size={20} color="var(--primary)" />
                                    <h3 style={{ color: 'var(--on-surface)', fontFamily: 'var(--font-body)', fontWeight: 700 }}>Curator Summary</h3>
                                </div>
                                <span style={{ fontSize: '0.75rem', color: 'var(--on-surface-var)', marginBottom: '1.25rem', display: 'block', fontFamily: 'var(--font-mono)' }}>NEXT BRIEFING — Project Zenith</span>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '1.5rem' }}>
                                    {CURATOR_NOTES.map((note, i) => (
                                        <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                                            <CheckCircle2 size={16} color="var(--primary)" style={{ marginTop: '2px', flexShrink: 0 }} />
                                            <span style={{ fontSize: '0.85rem', color: 'var(--on-surface-var)', lineHeight: 1.5 }}>{note}</span>
                                        </div>
                                    ))}
                                </div>
                                <button className="btn-secondary" style={{ width: '100%', justifyContent: 'center', padding: '12px', fontSize: '0.85rem', gap: '8px', borderRadius: 'var(--radius-md)' }}>
                                    <BookOpen size={16} />
                                    View Briefing Journal
                                </button>
                            </div>
                            )}

                            {/* Bookings from API */}
                            {(!location.pathname.includes('curator')) && (
                            <div className="card" style={{ borderRadius: 'var(--radius-xl)', background: 'var(--surface-lowest)', border: '1px solid var(--surface-ch)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.5rem' }}>
                                    <Calendar size={20} color="var(--primary)" />
                                    <h3 style={{ fontSize: '1rem', color: 'var(--on-surface)', fontFamily: 'var(--font-body)', fontWeight: 700 }}>Upcoming Sessions</h3>
                                </div>
                                {bookings.length === 0 ? (
                                    <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--on-surface-var)' }}>
                                        <Calendar size={32} style={{ display: 'block', margin: '0 auto 12px', color: 'var(--outline)', opacity: 0.5 }} />
                                        <p style={{ fontSize: '0.85rem', fontFamily: 'var(--font-mono)' }}>No upcoming sessions found.</p>
                                        <Link to="/explore" className="btn-ghost" style={{ marginTop: '16px', textDecoration: 'none', display: 'inline-flex', fontSize: '0.8rem', gap: '6px', borderRadius: 'var(--radius-md)' }}>
                                            Initialize discovery <ArrowRight size={14} />
                                        </Link>
                                    </div>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                        {bookings.map(b => (
                                            <div key={b.id} style={{ padding: '12px', borderRadius: 'var(--radius-lg)', background: 'var(--surface-low)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid var(--surface-ch)' }}>
                                                <div>
                                                    <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--on-surface)' }}>
                                                        {b.event_types?.title || 'Session'} {b.experts?.name && <span style={{ color: 'var(--primary)', fontWeight: 700 }}>— {b.experts.name}</span>}
                                                    </div>
                                                    <div style={{ fontSize: '0.75rem', color: 'var(--on-surface-var)', fontFamily: 'var(--font-mono)' }}>
                                                        {new Date(b.start_time).toLocaleDateString('en', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }).toUpperCase()}
                                                    </div>
                                                </div>
                                                <span style={{ fontSize: '0.7rem', padding: '4px 12px', borderRadius: 'var(--radius-full)', background: 'var(--primary-c)', color: 'var(--on-primary-c)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                                    {b.status}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                            )}
                        </div>
                        )}
                    </div>
                </div>
            </div>
        </Layout>
    );
}
