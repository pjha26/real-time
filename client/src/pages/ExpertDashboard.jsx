import { useEffect, useState } from 'react';
import { useAuthStore, useBookingStore, useSocketStore, useDashboardStore } from '../store/useStore';
import Layout from '../components/Layout';
import SessionNotes from '../components/SessionNotes';
import ExpertAvailabilitySettings from '../components/ExpertAvailabilitySettings';
import { useTimezone } from '../hooks/useTimezone';
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
    Bell,
    Globe,
    Loader2,
    Settings
} from 'lucide-react';

const ICON_MAP = {
    'Prep': FileText,
    'Deep Work': Code2,
    'Strategy': AlignLeft,
    'System': PencilRuler
};

export default function ExpertDashboard() {
    const { user } = useAuthStore();
    const { bookings, fetchExpertBookings } = useBookingStore();
    const { flowTasks, curatorNotes, networkStats, fetchInsights, loading: insightsLoading } = useDashboardStore();
    const { connect, socket } = useSocketStore();
    const location = useLocation();

    const [toastMessage, setToastMessage] = useState(null);
    const [notesBooking, setNotesBooking] = useState(null);
    const [showAvailability, setShowAvailability] = useState(false);
    const { formatTime, getTimezoneLabel } = useTimezone();

    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

    useEffect(() => {
        fetchExpertBookings().catch(() => { });
        fetchInsights();
        
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
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 14px', borderRadius: 'var(--radius-full)', background: 'var(--surface-lowest)', border: '1px solid var(--surface-ch)', fontSize: '0.72rem', color: 'var(--on-surface-var)', fontFamily: 'var(--font-mono)' }}>
                                    <Globe size={12} />
                                    {getTimezoneLabel()}
                                </div>
                                <button
                                    onClick={() => setShowAvailability(true)}
                                    className="btn-secondary"
                                    style={{ padding: '6px 14px', fontSize: '0.72rem', gap: '6px', borderRadius: 'var(--radius-md)' }}
                                >
                                    <Settings size={14} /> Availability
                                </button>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ background: 'var(--surface-lowest)', borderRadius: 'var(--radius-xl)', padding: '1rem 1.5rem', border: '1px solid var(--surface-ch)' }}>
                                        <div className="stat-number" style={{ fontFamily: 'var(--font-mono)', color: 'var(--primary)' }}>98.4%</div>
                                        <div className="stat-label">Matching Rate</div>
                                    </div>
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
                                        {insightsLoading ? (
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', color: 'var(--primary)' }}>
                                                <Loader2 className="animate-spin" size={24} />
                                            </div>
                                        ) : flowTasks.map((task, i) => {
                                            const TaskIcon = ICON_MAP[task.type] || PencilRuler;
                                            return (
                                            <div key={task.id} className="animate-fadeInUp" style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', padding: '1.25rem', borderRadius: 'var(--radius-xl)', background: 'var(--surface-low)', cursor: 'pointer', transition: 'all var(--transition)', border: '1px solid var(--surface-ch)' }}
                                                onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-lowest)'}
                                                onMouseLeave={e => e.currentTarget.style.background = 'var(--surface-low)'}
                                            >
                                                <div style={{ width: 42, height: 42, borderRadius: 'var(--radius-md)', background: 'linear-gradient(135deg, var(--primary), var(--primary-c))', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                    <TaskIcon size={20} color="var(--on-primary)" />
                                                </div>
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ fontFamily: 'var(--font-body)', fontWeight: 600, marginBottom: '2px', fontSize: '0.95rem', color: 'var(--on-surface)' }}>
                                                        {task.title}
                                                    </div>
                                                    <div style={{ fontSize: '0.8rem', color: 'var(--on-surface-var)', fontFamily: 'var(--font-mono)' }}>
                                                        <span style={{ color: task.priority === 'high' ? 'var(--primary)' : 'var(--on-surface-var)' }}>
                                                            {task.priority?.toUpperCase()} PRIORITY
                                                        </span>
                                                        {' · '}
                                                        {task.type}
                                                    </div>
                                                </div>
                                                <div style={{ fontSize: '0.85rem', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--primary)', flexShrink: 0 }}>{task.time}</div>
                                            </div>
                                        )})}
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
                                        <span style={{ fontSize: '0.75rem', color: 'var(--on-surface-var)', fontFamily: 'var(--font-mono)' }}>
                                            {insightsLoading ? 'SCANNING...' : `${networkStats.active_connections} ACTIVE · ${networkStats.pending_connections} PENDING`}
                                        </span>
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
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                                        {[{ l: 'Active', v: networkStats.active_connections, c: 'var(--primary)' }, { l: 'Pending', v: networkStats.pending_connections, c: 'var(--tertiary)' }, { l: 'Completed', v: '0', c: 'var(--on-surface-var)' }].map(s => (
                                            <div key={s.l} style={{ textAlign: 'center', padding: '0.75rem', background: 'var(--surface-low)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--surface-ch)' }}>
                                                <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: '1.5rem', color: s.c }}>{s.v}</div>
                                                <div style={{ fontSize: '0.7rem', color: 'var(--on-surface-var)', marginTop: '2px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.l}</div>
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
                                <span style={{ fontSize: '0.75rem', color: 'var(--on-surface-var)', marginBottom: '1.25rem', display: 'block', fontFamily: 'var(--font-mono)' }}>NEXT BRIEFING PREP</span>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '1.5rem' }}>
                                    {insightsLoading ? (
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', color: 'var(--primary)' }}>
                                            <Loader2 className="animate-spin" size={24} />
                                        </div>
                                    ) : curatorNotes.map((note, i) => (
                                        <div key={i} className="animate-fadeInUp" style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', animationDelay: `${i * 0.15}s` }}>
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
                                                        {formatTime(b.start_time)}
                                                    </div>
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <button onClick={() => setNotesBooking(b)} style={{ padding: '4px 10px', borderRadius: 'var(--radius)', background: 'rgba(143,0,255,0.1)', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '0.7rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                        <FileText size={12} /> Notes
                                                    </button>
                                                    <span style={{ fontSize: '0.7rem', padding: '4px 12px', borderRadius: 'var(--radius-full)', background: 'var(--primary-c)', color: 'var(--on-primary-c)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                                        {b.status}
                                                    </span>
                                                </div>
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
            {/* Session Notes Modal */}
            {notesBooking && <SessionNotes booking={notesBooking} onClose={() => setNotesBooking(null)} />}
            {showAvailability && <ExpertAvailabilitySettings expertId={user?.expert_id || user?.id} onClose={() => setShowAvailability(false)} />}
        </Layout>
    );
}
