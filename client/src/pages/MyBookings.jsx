import { useState, useEffect } from 'react';
import { useBookingStore, useSocketStore } from '../store/useStore';
import useAuthStore from '../store/useAuthStore';
import Layout from '../components/Layout';
import { Link } from 'react-router-dom';
import {
    Loader2,
    Calendar as CalendarIcon,
    Clock,
    User,
    CheckCircle,
    Clock3,
    XCircle,
    RefreshCw,
    AlertTriangle,
    X,
    Rocket,
    ArrowRight,
    Sparkles
} from 'lucide-react';

const TIME_SLOTS = ['9:00 AM', '10:00 AM', '11:00 AM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM'];

const MyBookings = () => {
    const { user } = useAuthStore();
    const {
        bookings,
        fetchMyBookings,
        cancelBooking,
        rescheduleBooking,
        loading
    } = useBookingStore();
    const { socket } = useSocketStore();

    const [error, setError] = useState(null);
    const [cancelConfirmId, setCancelConfirmId] = useState(null);
    const [rescheduleId, setRescheduleId] = useState(null);
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedTime, setSelectedTime] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);
    const [toast, setToast] = useState(null);

    useEffect(() => {
        if (user) {
            fetchMyBookings();
        }
    }, [user]);

    // Listen for real-time booking updates
    useEffect(() => {
        if (!socket) return;

        const handleUpdated = () => fetchMyBookings();
        const handleSlotReleased = () => fetchMyBookings();

        socket.on('booking:updated', handleUpdated);
        socket.on('booking:slot-released', handleSlotReleased);

        return () => {
            socket.off('booking:updated', handleUpdated);
            socket.off('booking:slot-released', handleSlotReleased);
        };
    }, [socket]);

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 4000);
    };

    const handleCancel = async (id) => {
        setActionLoading(true);
        try {
            await cancelBooking(id);
            showToast('Booking cancelled. The time slot is now available.');
            setCancelConfirmId(null);
        } catch (err) {
            showToast(err.response?.data?.error || 'Cancellation failed', 'error');
        } finally {
            setActionLoading(false);
        }
    };

    const handleReschedule = async () => {
        if (!selectedDate || !selectedTime) return;
        setActionLoading(true);
        try {
            const start = new Date(selectedDate);
            const [h, m] = selectedTime.replace(' AM', '').replace(' PM', '').split(':');
            start.setHours(parseInt(h) + (selectedTime.includes('PM') && h !== '12' ? 12 : 0), parseInt(m), 0, 0);
            const end = new Date(start.getTime() + 60 * 60 * 1000);

            await rescheduleBooking(rescheduleId, start.toISOString(), end.toISOString());
            showToast('Booking rescheduled successfully!');
            setRescheduleId(null);
            setSelectedDate(null);
            setSelectedTime(null);
        } catch (err) {
            showToast(err.response?.data?.error || 'Reschedule failed', 'error');
        } finally {
            setActionLoading(false);
        }
    };

    const days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() + i);
        return d;
    });

    const getStatusBadge = (status) => {
        const s = (status || 'pending').toLowerCase();
        const map = {
            confirmed: { bg: 'var(--tertiary-c)', color: 'var(--primary)', icon: CheckCircle, label: 'Confirmed' },
            completed: { bg: 'var(--tertiary-c)', color: 'var(--primary)', icon: CheckCircle, label: 'Completed' },
            cancelled: { bg: 'rgba(255, 180, 171, 0.12)', color: 'var(--error)', icon: XCircle, label: 'Cancelled' },
            rescheduled: { bg: 'var(--tertiary-c)', color: 'var(--tertiary)', icon: RefreshCw, label: 'Rescheduled' },
            pending: { bg: 'var(--surface-ch)', color: 'var(--on-surface-var)', icon: Clock3, label: 'Pending' },
        };
        const cfg = map[s] || map.pending;
        const Icon = cfg.icon;
        return (
            <span style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                padding: '4px 12px', borderRadius: 'var(--radius-full)',
                background: cfg.bg, color: cfg.color,
                fontSize: '0.7rem', fontWeight: 700, fontFamily: 'var(--font-mono)',
                textTransform: 'uppercase', letterSpacing: '0.05em',
            }}>
                <Icon size={12} />
                {cfg.label}
            </span>
        );
    };

    if (!user) {
        return (
            <Layout>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
                    <div className="card animate-fadeInUp" style={{
                        textAlign: 'center', maxWidth: '420px', padding: '2.5rem',
                        background: 'var(--surface-lowest)', borderRadius: 'var(--radius-xl)',
                        border: '1px solid var(--surface-ch)'
                    }}>
                        <User size={48} style={{ color: 'var(--outline)', marginBottom: '1rem' }} />
                        <h2 style={{ color: 'var(--on-surface)', marginBottom: '0.75rem' }}>Sign in to continue</h2>
                        <p style={{ color: 'var(--on-surface-var)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                            Access your bookings, manage sessions, and track your schedule.
                        </p>
                        <Link to="/login" className="btn-primary" style={{ textDecoration: 'none', display: 'inline-flex', gap: '8px' }}>
                            Sign In <ArrowRight size={16} />
                        </Link>
                    </div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            {/* Toast Notification */}
            {toast && (
                <div className="animate-fadeInUp" style={{
                    position: 'fixed', top: '20px', right: '20px', zIndex: 1000,
                    background: 'var(--surface-lowest)',
                    border: toast.type === 'error'
                        ? '1px solid rgba(255, 180, 171, 0.3)'
                        : '1px solid var(--primary)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '1rem 1.5rem',
                    display: 'flex', alignItems: 'center', gap: '12px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                }}>
                    <div style={{
                        background: toast.type === 'error' ? 'rgba(255,180,171,0.2)' : 'rgba(50,255,126,0.2)',
                        padding: '8px', borderRadius: '50%',
                    }}>
                        {toast.type === 'error'
                            ? <AlertTriangle size={18} color="var(--error)" />
                            : <CheckCircle size={18} color="var(--primary)" />
                        }
                    </div>
                    <div>
                        <div style={{ fontFamily: 'var(--font-body)', fontWeight: 700, color: 'var(--on-surface)', fontSize: '0.85rem' }}>
                            {toast.message}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--on-surface-var)', fontFamily: 'var(--font-mono)' }}>
                            Just now via The Curator
                        </div>
                    </div>
                </div>
            )}

            <div style={{ position: 'relative', overflow: 'hidden', minHeight: '100vh' }}>
                <div className="blob blob-1" style={{ width: '400px', height: '400px', top: '-100px' }} />

                <div style={{ position: 'relative', zIndex: 1 }}>
                    {/* Header — matching ExpertListing & ExpertDashboard */}
                    <div style={{ padding: '2.5rem 2rem 0' }}>
                        <span className="section-label">MY BOOKINGS</span>
                        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: '0.5rem', marginBottom: '2rem' }}>
                            <div>
                                <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem', color: 'var(--on-surface)' }}>
                                    Session <span style={{ color: 'var(--primary)' }}>Management</span>
                                </h1>
                                <p style={{ fontSize: '0.9rem', color: 'var(--on-surface-var)' }}>
                                    Manage, reschedule, or cancel your upcoming sessions.
                                </p>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--tertiary-c)', padding: '8px 16px', borderRadius: 'var(--radius-full)' }}>
                                <div className="pulse-dot"></div>
                                <span style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>
                                    {bookings.filter(b => (b.status || 'pending').toLowerCase() !== 'cancelled').length} ACTIVE
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <div style={{ padding: '0 2rem 3rem', position: 'relative', zIndex: 1 }}>
                        {loading && bookings.length === 0 ? (
                            <div className="grid-auto stagger">
                                {Array.from({ length: 3 }).map((_, i) => (
                                    <div key={i} className="card skeleton-card" style={{
                                        height: '180px', display: 'flex', flexDirection: 'column', gap: '14px',
                                        borderRadius: 'var(--radius-xl)', background: 'var(--surface-lowest)', border: '1px solid var(--surface-ch)'
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <div className="skeleton" style={{ height: 22, width: 80, borderRadius: 'var(--radius-full)' }} />
                                            <div className="skeleton skeleton-text" style={{ width: 60 }} />
                                        </div>
                                        <div className="skeleton skeleton-title" style={{ width: '70%' }} />
                                        <div className="skeleton skeleton-text" style={{ width: '50%' }} />
                                        <div style={{ display: 'flex', gap: '8px', marginTop: 'auto' }}>
                                            <div className="skeleton" style={{ height: 32, width: 100, borderRadius: 'var(--radius-md)' }} />
                                            <div className="skeleton" style={{ height: 32, width: 80, borderRadius: 'var(--radius-md)' }} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : error ? (
                            <div className="card" style={{
                                textAlign: 'center', padding: '2rem',
                                background: 'var(--surface-lowest)', borderRadius: 'var(--radius-xl)',
                                border: '1px solid rgba(255, 180, 171, 0.2)'
                            }}>
                                <AlertTriangle size={32} color="var(--error)" style={{ marginBottom: '0.75rem' }} />
                                <p style={{ color: 'var(--error)', fontWeight: 600 }}>{error}</p>
                            </div>
                        ) : bookings.length === 0 ? (
                            <div className="card animate-fadeInUp" style={{
                                textAlign: 'center', padding: '3rem',
                                background: 'var(--surface-lowest)', borderRadius: 'var(--radius-xl)',
                                border: '1px solid var(--surface-ch)',
                            }}>
                                <CalendarIcon size={48} style={{ color: 'var(--outline)', opacity: 0.4, marginBottom: '1rem' }} />
                                <h3 style={{ color: 'var(--on-surface)', fontWeight: 700, marginBottom: '0.5rem' }}>No sessions yet</h3>
                                <p style={{ color: 'var(--on-surface-var)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
                                    Browse experts and book your first session to get started.
                                </p>
                                <Link to="/explore" className="btn-primary" style={{ textDecoration: 'none', display: 'inline-flex', gap: '8px' }}>
                                    <Rocket size={16} /> Explore Experts
                                </Link>
                            </div>
                        ) : (
                            <>
                                <p style={{ fontSize: '0.85rem', color: 'var(--outline)', marginBottom: '1.5rem' }}>
                                    Showing <strong style={{ color: 'var(--primary)' }}>{bookings.length}</strong> sessions
                                </p>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }} className="stagger">
                                    {bookings.map((booking, idx) => {
                                        const bookingId = booking.id || booking._id;
                                        const expertName = booking.experts?.name || booking.experts?.users?.name || 'Expert';
                                        const eventTitle = booking.event_types?.title || 'Session';
                                        const status = (booking.status || 'pending').toLowerCase();
                                        const isActive = status !== 'cancelled' && status !== 'completed';

                                        return (
                                            <div key={bookingId} className="card animate-fadeInUp" style={{
                                                background: 'var(--surface-lowest)',
                                                borderRadius: 'var(--radius-xl)',
                                                border: '1px solid var(--surface-ch)',
                                                padding: '1.5rem',
                                                transition: 'all 0.3s ease',
                                                animationDelay: `${idx * 80}ms`,
                                            }}>
                                                {/* Top row: badge + ID */}
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                                                    {getStatusBadge(booking.status)}
                                                    <span style={{ fontSize: '0.7rem', fontFamily: 'var(--font-mono)', color: 'var(--outline)', letterSpacing: '0.05em' }}>
                                                        #{bookingId?.slice(-8)?.toUpperCase()}
                                                    </span>
                                                </div>

                                                {/* Main content */}
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1.5rem', flexWrap: 'wrap' }}>
                                                    <div style={{ flex: 1, minWidth: '200px' }}>
                                                        <h3 style={{ fontWeight: 700, color: 'var(--on-surface)', fontSize: '1.05rem', marginBottom: '0.5rem' }}>
                                                            {eventTitle}
                                                            <span style={{ color: 'var(--primary)', fontWeight: 700 }}> — {expertName}</span>
                                                        </h3>
                                                        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', fontFamily: 'var(--font-mono)', color: 'var(--on-surface-var)' }}>
                                                                <CalendarIcon size={14} color="var(--outline)" />
                                                                {booking.start_time
                                                                    ? new Date(booking.start_time).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                                                                    : booking.date
                                                                        ? new Date(booking.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                                                                        : '—'}
                                                            </div>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', fontFamily: 'var(--font-mono)', color: 'var(--on-surface-var)' }}>
                                                                <Clock size={14} color="var(--outline)" />
                                                                {booking.start_time
                                                                    ? new Date(booking.start_time).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
                                                                    : booking.timeSlot || '—'}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Action buttons */}
                                                    {isActive && (
                                                        <div style={{ display: 'flex', gap: '8px', flexShrink: 0, flexWrap: 'wrap' }}>
                                                            <button
                                                                onClick={() => setRescheduleId(rescheduleId === bookingId ? null : bookingId)}
                                                                className={rescheduleId === bookingId ? 'btn-primary' : 'btn-secondary'}
                                                                style={{
                                                                    padding: '8px 16px', fontSize: '0.75rem', gap: '6px',
                                                                    borderRadius: 'var(--radius-md)',
                                                                }}
                                                            >
                                                                <RefreshCw size={14} /> Reschedule
                                                            </button>
                                                            <button
                                                                onClick={() => setCancelConfirmId(bookingId)}
                                                                className="btn-ghost"
                                                                style={{
                                                                    padding: '8px 16px', fontSize: '0.75rem',
                                                                    borderRadius: 'var(--radius-md)',
                                                                    border: '1px dashed rgba(255, 180, 171, 0.3)',
                                                                    color: 'var(--error)', gap: '6px',
                                                                }}
                                                            >
                                                                <XCircle size={14} /> Cancel
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Inline Reschedule Picker */}
                                                {rescheduleId === bookingId && (
                                                    <div className="animate-fadeInUp" style={{
                                                        marginTop: '1.5rem',
                                                        padding: '1.5rem',
                                                        background: 'var(--surface-c)',
                                                        borderRadius: 'var(--radius-xl)',
                                                        border: '1px solid var(--surface-ch)',
                                                    }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
                                                            <Sparkles size={18} color="var(--primary)" />
                                                            <span style={{ fontFamily: 'var(--font-body)', fontWeight: 700, color: 'var(--on-surface)', fontSize: '0.9rem' }}>
                                                                Pick a new time
                                                            </span>
                                                        </div>

                                                        {/* Day picker */}
                                                        <div style={{ display: 'flex', gap: '8px', marginBottom: '1.25rem', overflowX: 'auto', paddingBottom: '4px' }}>
                                                            {days.map((d, i) => {
                                                                const isSelected = selectedDate?.toDateString() === d.toDateString();
                                                                return (
                                                                    <button
                                                                        key={i}
                                                                        onClick={() => setSelectedDate(d)}
                                                                        style={{
                                                                            flexShrink: 0, padding: '10px 14px',
                                                                            borderRadius: 'var(--radius-xl)',
                                                                            border: '1px solid var(--surface-ch)',
                                                                            cursor: 'pointer',
                                                                            background: isSelected ? 'linear-gradient(135deg, var(--primary), var(--primary-c))' : 'var(--surface-lowest)',
                                                                            color: isSelected ? 'var(--on-primary)' : 'var(--on-surface-var)',
                                                                            fontFamily: 'var(--font-mono)', fontWeight: isSelected ? 700 : 500, fontSize: '0.8rem',
                                                                            transition: 'all var(--transition)', textAlign: 'center', minWidth: '55px',
                                                                        }}
                                                                    >
                                                                        <div style={{ fontSize: '0.6rem', opacity: 0.8, marginBottom: '2px' }}>
                                                                            {d.toLocaleDateString('en', { weekday: 'short' }).toUpperCase()}
                                                                        </div>
                                                                        <div style={{ fontSize: '1rem' }}>{d.getDate()}</div>
                                                                    </button>
                                                                );
                                                            })}
                                                        </div>

                                                        {/* Time slots */}
                                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px', marginBottom: '1.25rem' }}>
                                                            {TIME_SLOTS.map(time => {
                                                                const isSelected = selectedTime === time;
                                                                return (
                                                                    <button
                                                                        key={time}
                                                                        onClick={() => setSelectedTime(time)}
                                                                        style={{
                                                                            padding: '8px 4px',
                                                                            borderRadius: 'var(--radius-md)',
                                                                            border: '1px solid var(--surface-ch)',
                                                                            cursor: 'pointer',
                                                                            background: isSelected ? 'var(--primary)' : 'var(--surface-lowest)',
                                                                            color: isSelected ? 'var(--on-primary)' : 'var(--on-surface-var)',
                                                                            fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: isSelected ? 700 : 400,
                                                                            transition: 'all var(--transition)',
                                                                        }}
                                                                    >
                                                                        {time}
                                                                    </button>
                                                                );
                                                            })}
                                                        </div>

                                                        {/* Confirm / Close */}
                                                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                                            <button
                                                                onClick={() => { setRescheduleId(null); setSelectedDate(null); setSelectedTime(null); }}
                                                                className="btn-ghost"
                                                                style={{ padding: '8px 16px', fontSize: '0.78rem', borderRadius: 'var(--radius-md)' }}
                                                            >
                                                                Cancel
                                                            </button>
                                                            <button
                                                                onClick={handleReschedule}
                                                                disabled={!selectedDate || !selectedTime || actionLoading}
                                                                className="btn-primary"
                                                                style={{
                                                                    padding: '8px 20px', fontSize: '0.78rem', gap: '6px',
                                                                    borderRadius: 'var(--radius-md)',
                                                                    opacity: (!selectedDate || !selectedTime || actionLoading) ? 0.5 : 1,
                                                                }}
                                                            >
                                                                {actionLoading
                                                                    ? <Loader2 className="animate-spin" size={14} />
                                                                    : <><RefreshCw size={14} /> Confirm Reschedule</>
                                                                }
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Cancel Confirmation Modal — glass overlay */}
            {cancelConfirmId && (
                <div style={{
                    position: 'fixed', inset: 0, zIndex: 999,
                    display: 'flex', justifyContent: 'center', alignItems: 'center',
                    background: 'rgba(0, 0, 0, 0.6)',
                    backdropFilter: 'blur(8px)',
                }} onClick={() => setCancelConfirmId(null)}>
                    <div className="animate-fadeInUp" onClick={e => e.stopPropagation()} style={{
                        background: 'var(--surface-lowest)',
                        borderRadius: 'var(--radius-xl)',
                        border: '1px solid var(--surface-ch)',
                        padding: '2rem',
                        maxWidth: '400px',
                        width: '90%',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(255, 180, 171, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <AlertTriangle size={20} color="var(--error)" />
                                </div>
                                <h3 style={{ color: 'var(--on-surface)' }}>Cancel Session?</h3>
                            </div>
                            <button onClick={() => setCancelConfirmId(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--outline)', padding: '4px' }}>
                                <X size={18} />
                            </button>
                        </div>
                        <p style={{ color: 'var(--on-surface-var)', fontSize: '0.85rem', marginBottom: '1.5rem', lineHeight: 1.6 }}>
                            This will cancel the session and release the time slot, making it available for other clients. This action cannot be undone.
                        </p>
                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                            <button onClick={() => setCancelConfirmId(null)} className="btn-secondary" style={{ padding: '10px 20px', fontSize: '0.85rem', borderRadius: 'var(--radius-md)' }}>
                                Keep Session
                            </button>
                            <button
                                onClick={() => handleCancel(cancelConfirmId)}
                                disabled={actionLoading}
                                className="btn-primary"
                                style={{
                                    padding: '10px 20px', fontSize: '0.85rem',
                                    borderRadius: 'var(--radius-md)',
                                    background: 'linear-gradient(135deg, #ff6b6b, #93000a)',
                                    display: 'flex', alignItems: 'center', gap: '6px',
                                    opacity: actionLoading ? 0.7 : 1,
                                }}
                            >
                                {actionLoading ? <Loader2 className="animate-spin" size={14} /> : <XCircle size={14} />}
                                Cancel Session
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    );
};

export default MyBookings;
