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
    ArrowRight
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
            confirmed: { bg: 'rgba(50, 255, 126, 0.12)', color: 'var(--primary)', icon: CheckCircle, label: 'Confirmed' },
            completed: { bg: 'rgba(218, 185, 255, 0.12)', color: 'var(--primary)', icon: CheckCircle, label: 'Completed' },
            cancelled: { bg: 'rgba(255, 180, 171, 0.12)', color: 'var(--error)', icon: XCircle, label: 'Cancelled' },
            rescheduled: { bg: 'rgba(255, 182, 139, 0.12)', color: 'var(--tertiary)', icon: RefreshCw, label: 'Rescheduled' },
            pending: { bg: 'rgba(218, 185, 255, 0.08)', color: 'var(--on-surface-var)', icon: Clock3, label: 'Pending' },
        };
        const cfg = map[s] || map.pending;
        const Icon = cfg.icon;
        return (
            <span style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                padding: '4px 12px', borderRadius: 'var(--radius-full)',
                background: cfg.bg, color: cfg.color,
                fontSize: '0.72rem', fontWeight: 700, fontFamily: 'var(--font-mono)',
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
                    <div className="card animate-fadeInUp" style={{ textAlign: 'center', maxWidth: '420px', padding: '2.5rem', background: 'var(--surface-lowest)', borderRadius: 'var(--radius-xl)' }}>
                        <User size={48} style={{ color: 'var(--outline)', marginBottom: '1rem' }} />
                        <h2 style={{ color: 'var(--on-surface)', marginBottom: '0.75rem' }}>Sign in to continue</h2>
                        <p style={{ color: 'var(--on-surface-var)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>Access your bookings, manage sessions, and track your schedule.</p>
                        <Link to="/login" className="btn-primary" style={{ textDecoration: 'none', display: 'inline-flex', gap: '8px', borderRadius: 'var(--radius-full)' }}>
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
                    background: toast.type === 'error'
                        ? 'rgba(147, 0, 10, 0.9)'
                        : 'rgba(32, 31, 33, 0.95)',
                    backdropFilter: 'blur(20px)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '1rem 1.5rem',
                    display: 'flex', alignItems: 'center', gap: '12px',
                    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
                    border: toast.type === 'error'
                        ? '1px solid rgba(255, 180, 171, 0.2)'
                        : '1px solid var(--primary)',
                }}>
                    {toast.type === 'error'
                        ? <AlertTriangle size={18} color="var(--error)" />
                        : <CheckCircle size={18} color="var(--primary)" />
                    }
                    <span style={{ fontFamily: 'var(--font-body)', fontWeight: 600, color: 'var(--on-surface)', fontSize: '0.85rem' }}>
                        {toast.message}
                    </span>
                </div>
            )}

            <div style={{ position: 'relative', overflow: 'hidden', minHeight: '100vh' }}>
                <div className="blob blob-1" style={{ width: '500px', height: '500px', top: '-150px', right: '-50px', opacity: 0.5 }} />

                <div style={{ position: 'relative', zIndex: 1 }}>
                    {/* Header */}
                    <div style={{ padding: '2.5rem 2rem 1.5rem', borderBottom: '1px solid var(--surface-ch)' }}>
                        <span className="section-label">SESSION MANAGEMENT</span>
                        <h1 style={{ marginTop: '0.5rem', fontSize: '2rem', color: 'var(--on-surface)' }}>
                            My <span style={{ color: 'var(--primary)' }}>Bookings</span>
                        </h1>
                        <p style={{ marginTop: '0.5rem', color: 'var(--on-surface-var)', fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>
                            Manage, reschedule, or cancel your upcoming sessions.
                        </p>
                    </div>

                    {/* Content */}
                    <div style={{ padding: '2rem' }}>
                        {loading && bookings.length === 0 ? (
                            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '4rem', color: 'var(--primary)' }}>
                                <Loader2 className="animate-spin" size={32} />
                            </div>
                        ) : error ? (
                            <div className="card" style={{ textAlign: 'center', padding: '2rem', background: 'rgba(147, 0, 10, 0.1)', borderRadius: 'var(--radius-xl)' }}>
                                <AlertTriangle size={32} color="var(--error)" style={{ marginBottom: '0.75rem' }} />
                                <p style={{ color: 'var(--error)', fontWeight: 600 }}>{error}</p>
                            </div>
                        ) : bookings.length === 0 ? (
                            <div className="card animate-fadeInUp" style={{ textAlign: 'center', padding: '3rem', background: 'var(--surface-lowest)', borderRadius: 'var(--radius-xl)' }}>
                                <CalendarIcon size={48} style={{ color: 'var(--outline)', opacity: 0.4, marginBottom: '1rem' }} />
                                <h3 style={{ color: 'var(--on-surface)', fontFamily: 'var(--font-body)', fontWeight: 700, marginBottom: '0.5rem' }}>
                                    No sessions yet
                                </h3>
                                <p style={{ color: 'var(--on-surface-var)', fontSize: '0.85rem', fontFamily: 'var(--font-mono)', marginBottom: '1.5rem' }}>
                                    Browse experts and book your first session to get started.
                                </p>
                                <Link to="/explore" className="btn-primary" style={{ textDecoration: 'none', display: 'inline-flex', gap: '8px', borderRadius: 'var(--radius-full)' }}>
                                    <Rocket size={16} /> Explore Experts
                                </Link>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }} className="stagger">
                                {bookings.map((booking, idx) => {
                                    const bookingId = booking.id || booking._id;
                                    const expertName = booking.experts?.name || booking.experts?.users?.name || 'Expert';
                                    const eventTitle = booking.event_types?.title || 'Session';
                                    const status = (booking.status || 'pending').toLowerCase();
                                    const isActive = status !== 'cancelled' && status !== 'completed';

                                    return (
                                        <div key={bookingId} className="animate-fadeInUp" style={{
                                            background: 'var(--surface-lowest)',
                                            borderRadius: 'var(--radius-xl)',
                                            padding: '1.5rem',
                                            transition: 'all var(--transition)',
                                            cursor: 'default',
                                            animationDelay: `${idx * 0.08}s`,
                                        }}
                                            onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-low)'}
                                            onMouseLeave={e => e.currentTarget.style.background = 'var(--surface-lowest)'}
                                        >
                                            {/* Top row: badge + ID */}
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                                {getStatusBadge(booking.status)}
                                                <span style={{ fontSize: '0.7rem', fontFamily: 'var(--font-mono)', color: 'var(--outline)', letterSpacing: '0.05em' }}>
                                                    {bookingId?.slice(-8)?.toUpperCase()}
                                                </span>
                                            </div>

                                            {/* Main content */}
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1.5rem', flexWrap: 'wrap' }}>
                                                <div style={{ flex: 1, minWidth: '200px' }}>
                                                    <h3 style={{ fontFamily: 'var(--font-body)', fontWeight: 700, color: 'var(--on-surface)', fontSize: '1.05rem', marginBottom: '0.5rem' }}>
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
                                                            className="btn-secondary"
                                                            style={{
                                                                padding: '8px 16px', fontSize: '0.78rem', gap: '6px',
                                                                borderRadius: 'var(--radius-md)',
                                                                background: rescheduleId === bookingId ? 'var(--primary-c)' : undefined,
                                                                color: rescheduleId === bookingId ? 'var(--on-primary-c)' : undefined,
                                                            }}
                                                        >
                                                            <RefreshCw size={14} /> Reschedule
                                                        </button>
                                                        <button
                                                            onClick={() => setCancelConfirmId(bookingId)}
                                                            style={{
                                                                padding: '8px 16px', fontSize: '0.78rem',
                                                                borderRadius: 'var(--radius-md)',
                                                                background: 'rgba(255, 180, 171, 0.08)',
                                                                border: '1px solid rgba(255, 180, 171, 0.15)',
                                                                color: 'var(--error)',
                                                                cursor: 'pointer',
                                                                fontWeight: 600,
                                                                fontFamily: 'var(--font-body)',
                                                                display: 'flex', alignItems: 'center', gap: '6px',
                                                                transition: 'all var(--transition)',
                                                            }}
                                                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255, 180, 171, 0.15)'}
                                                            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255, 180, 171, 0.08)'}
                                                        >
                                                            <XCircle size={14} /> Cancel
                                                        </button>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Inline Reschedule Picker */}
                                            {rescheduleId === bookingId && (
                                                <div className="animate-fadeInUp" style={{
                                                    marginTop: '1.25rem',
                                                    padding: '1.5rem',
                                                    background: 'var(--surface-low)',
                                                    borderRadius: 'var(--radius-xl)',
                                                }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
                                                        <CalendarIcon size={18} color="var(--primary)" />
                                                        <span style={{ fontFamily: 'var(--font-body)', fontWeight: 700, color: 'var(--on-surface)', fontSize: '0.9rem' }}>
                                                            Pick a new time
                                                        </span>
                                                    </div>

                                                    {/* Day picker */}
                                                    <div style={{ display: 'flex', gap: '6px', marginBottom: '1rem', overflowX: 'auto', paddingBottom: '4px' }}>
                                                        {days.map((d, i) => {
                                                            const isSelected = selectedDate?.toDateString() === d.toDateString();
                                                            return (
                                                                <button
                                                                    key={i}
                                                                    onClick={() => setSelectedDate(d)}
                                                                    style={{
                                                                        flexShrink: 0, padding: '8px 12px', borderRadius: 'var(--radius-xl)',
                                                                        border: 'none', cursor: 'pointer',
                                                                        background: isSelected ? 'linear-gradient(135deg, var(--primary), var(--primary-c))' : 'var(--surface-lowest)',
                                                                        color: isSelected ? 'var(--on-primary)' : 'var(--on-surface-var)',
                                                                        fontFamily: 'var(--font-mono)', fontWeight: isSelected ? 700 : 500, fontSize: '0.78rem',
                                                                        transition: 'all var(--transition)', textAlign: 'center', minWidth: '52px',
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
                                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px', marginBottom: '1rem' }}>
                                                        {TIME_SLOTS.map(time => {
                                                            const isSelected = selectedTime === time;
                                                            return (
                                                                <button
                                                                    key={time}
                                                                    onClick={() => setSelectedTime(time)}
                                                                    style={{
                                                                        padding: '8px 4px', borderRadius: 'var(--radius-md)',
                                                                        border: 'none', cursor: 'pointer',
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
                                                            className="btn-secondary"
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
                        )}
                    </div>
                </div>
            </div>

            {/* Cancel Confirmation Modal */}
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
                        padding: '2rem',
                        maxWidth: '400px',
                        width: '90%',
                        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(255, 180, 171, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <AlertTriangle size={20} color="var(--error)" />
                                </div>
                                <h3 style={{ color: 'var(--on-surface)', fontFamily: 'var(--font-body)', fontWeight: 700 }}>Cancel Session?</h3>
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
                                style={{
                                    padding: '10px 20px', fontSize: '0.85rem',
                                    borderRadius: 'var(--radius-md)',
                                    background: 'var(--error-container)',
                                    border: 'none',
                                    color: 'var(--on-error-container)',
                                    cursor: actionLoading ? 'wait' : 'pointer',
                                    fontWeight: 700,
                                    fontFamily: 'var(--font-body)',
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
