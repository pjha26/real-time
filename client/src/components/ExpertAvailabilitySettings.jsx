import { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Clock,
    Globe,
    CalendarOff,
    Save,
    Loader2,
    CheckCircle,
    AlertTriangle,
    Timer,
    X,
    Plus
} from 'lucide-react';

const API = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api`;
const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const DAY_SHORT = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

const COMMON_TIMEZONES = [
    'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles',
    'Europe/London', 'Europe/Paris', 'Europe/Berlin',
    'Asia/Kolkata', 'Asia/Tokyo', 'Asia/Shanghai', 'Asia/Dubai',
    'Australia/Sydney', 'Pacific/Auckland', 'UTC',
];

const getAuthHeader = () => {
    const token = localStorage.getItem('mf_token');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

export default function ExpertAvailabilitySettings({ expertId, onClose }) {
    const [schedule, setSchedule] = useState(
        DAY_NAMES.map((_, i) => ({
            day_of_week: i,
            start_hour: '09:00',
            end_hour: '17:00',
            is_active: i >= 1 && i <= 5, // Mon-Fri active by default
        }))
    );
    const [timezone, setTimezone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone);
    const [bufferMinutes, setBufferMinutes] = useState(0);
    const [blockedDates, setBlockedDates] = useState([]);
    const [newBlockedDate, setNewBlockedDate] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState(null);

    useEffect(() => {
        fetchAvailability();
    }, [expertId]);

    const fetchAvailability = async () => {
        try {
            setLoading(true);
            const { data } = await axios.get(`${API}/experts/${expertId}/availability`, {
                headers: getAuthHeader(),
            });

            if (data.schedule && data.schedule.length > 0) {
                setSchedule(DAY_NAMES.map((_, i) => {
                    const existing = data.schedule.find(s => s.day_of_week === i);
                    return existing
                        ? { day_of_week: i, start_hour: existing.start_hour?.slice(0, 5) || '09:00', end_hour: existing.end_hour?.slice(0, 5) || '17:00', is_active: existing.is_active }
                        : { day_of_week: i, start_hour: '09:00', end_hour: '17:00', is_active: false };
                }));
            }

            setTimezone(data.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone);
            setBufferMinutes(data.buffer_minutes || 0);
            setBlockedDates(data.blocked_dates || []);
        } catch (err) {
            console.error('Failed to load availability:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            // Save schedule
            await axios.put(`${API}/experts/${expertId}/availability`,
                { schedule },
                { headers: getAuthHeader() }
            );

            // Save settings
            await axios.put(`${API}/experts/${expertId}/settings`,
                { timezone, buffer_minutes: bufferMinutes, blocked_dates: blockedDates },
                { headers: getAuthHeader() }
            );

            setToast({ type: 'success', message: 'Availability settings saved!' });
            setTimeout(() => setToast(null), 3000);
        } catch (err) {
            setToast({ type: 'error', message: err.response?.data?.error || 'Failed to save' });
            setTimeout(() => setToast(null), 4000);
        } finally {
            setSaving(false);
        }
    };

    const toggleDay = (dayIndex) => {
        setSchedule(prev => prev.map(s =>
            s.day_of_week === dayIndex ? { ...s, is_active: !s.is_active } : s
        ));
    };

    const updateDayTime = (dayIndex, field, value) => {
        setSchedule(prev => prev.map(s =>
            s.day_of_week === dayIndex ? { ...s, [field]: value } : s
        ));
    };

    const addBlockedDate = () => {
        if (newBlockedDate && !blockedDates.includes(newBlockedDate)) {
            setBlockedDates(prev => [...prev, newBlockedDate]);
            setNewBlockedDate('');
        }
    };

    const removeBlockedDate = (date) => {
        setBlockedDates(prev => prev.filter(d => d !== date));
    };

    if (loading) {
        return (
            <div style={{ position: 'fixed', inset: 0, zIndex: 999, display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}>
                <div style={{ background: 'var(--surface-lowest)', borderRadius: 'var(--radius-xl)', padding: '3rem', display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--primary)' }}>
                    <Loader2 className="animate-spin" size={24} />
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>Loading availability...</span>
                </div>
            </div>
        );
    }

    return (
        <div style={{ position: 'fixed', inset: 0, zIndex: 999, display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}
            onClick={onClose}
        >
            <div className="animate-fadeInUp" onClick={e => e.stopPropagation()} style={{
                background: 'var(--surface-lowest)',
                borderRadius: 'var(--radius-xl)',
                padding: '2rem',
                maxWidth: '600px',
                width: '92%',
                maxHeight: '85vh',
                overflowY: 'auto',
                border: '1px solid var(--surface-ch)',
                boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
            }}>
                {/* Toast */}
                {toast && (
                    <div className="animate-fadeInUp" style={{
                        position: 'fixed', top: '20px', right: '20px', zIndex: 1001,
                        background: toast.type === 'error' ? 'rgba(147,0,10,0.9)' : 'rgba(32,31,33,0.95)',
                        backdropFilter: 'blur(20px)',
                        borderRadius: 'var(--radius-lg)', padding: '1rem 1.5rem',
                        display: 'flex', alignItems: 'center', gap: '12px',
                        boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
                        border: toast.type === 'error' ? '1px solid rgba(255,180,171,0.2)' : '1px solid var(--primary)',
                    }}>
                        {toast.type === 'error' ? <AlertTriangle size={18} color="var(--error)" /> : <CheckCircle size={18} color="var(--primary)" />}
                        <span style={{ fontFamily: 'var(--font-body)', fontWeight: 600, color: 'var(--on-surface)', fontSize: '0.85rem' }}>{toast.message}</span>
                    </div>
                )}

                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <div>
                        <span className="section-label">AVAILABILITY</span>
                        <h2 style={{ marginTop: '0.25rem', color: 'var(--on-surface)', fontSize: '1.3rem', fontFamily: 'var(--font-display)' }}>
                            Manage Your <span style={{ color: 'var(--primary)' }}>Schedule</span>
                        </h2>
                    </div>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--outline)', padding: '4px' }}>
                        <X size={20} />
                    </button>
                </div>

                {/* ── Timezone ── */}
                <div style={{ marginBottom: '1.5rem', padding: '1.25rem', background: 'var(--surface-c)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--surface-ch)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.75rem' }}>
                        <Globe size={18} color="var(--primary)" />
                        <span style={{ fontFamily: 'var(--font-body)', fontWeight: 700, color: 'var(--on-surface)', fontSize: '0.9rem' }}>Timezone</span>
                    </div>
                    <select
                        value={timezone}
                        onChange={e => setTimezone(e.target.value)}
                        style={{
                            width: '100%', padding: '10px 14px',
                            background: 'var(--surface-lowest)', color: 'var(--on-surface)',
                            border: 'none', borderRadius: 'var(--radius-md)',
                            fontFamily: 'var(--font-mono)', fontSize: '0.82rem',
                            cursor: 'pointer', appearance: 'auto',
                        }}
                    >
                        {COMMON_TIMEZONES.map(tz => (
                            <option key={tz} value={tz}>{tz.replace(/_/g, ' ')}</option>
                        ))}
                    </select>
                </div>

                {/* ── Buffer Time ── */}
                <div style={{ marginBottom: '1.5rem', padding: '1.25rem', background: 'var(--surface-low)', borderRadius: 'var(--radius-xl)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.75rem' }}>
                        <Timer size={18} color="var(--tertiary)" />
                        <span style={{ fontFamily: 'var(--font-body)', fontWeight: 700, color: 'var(--on-surface)', fontSize: '0.9rem' }}>Buffer Between Sessions</span>
                    </div>
                    <div style={{ display: 'flex', gap: '6px' }}>
                        {[0, 5, 10, 15, 30].map(mins => (
                            <button
                                key={mins}
                                onClick={() => setBufferMinutes(mins)}
                                style={{
                                    padding: '8px 14px', borderRadius: 'var(--radius-md)',
                                    border: 'none', cursor: 'pointer',
                                    background: bufferMinutes === mins ? 'var(--primary)' : 'var(--surface-lowest)',
                                    color: bufferMinutes === mins ? 'var(--on-primary)' : 'var(--on-surface-var)',
                                    fontFamily: 'var(--font-mono)', fontSize: '0.78rem', fontWeight: bufferMinutes === mins ? 700 : 400,
                                    transition: 'all var(--transition)',
                                }}
                            >
                                {mins === 0 ? 'None' : `${mins} min`}
                            </button>
                        ))}
                    </div>
                </div>

                {/* ── Weekly Schedule ── */}
                <div style={{ marginBottom: '1.5rem', padding: '1.25rem', background: 'var(--surface-low)', borderRadius: 'var(--radius-xl)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
                        <Clock size={18} color="var(--primary)" />
                        <span style={{ fontFamily: 'var(--font-body)', fontWeight: 700, color: 'var(--on-surface)', fontSize: '0.9rem' }}>Weekly Hours</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {schedule.map(day => (
                            <div key={day.day_of_week} style={{
                                display: 'flex', alignItems: 'center', gap: '10px',
                                padding: '10px 14px', borderRadius: 'var(--radius-lg)',
                                background: day.is_active ? 'var(--surface-lowest)' : 'transparent',
                                opacity: day.is_active ? 1 : 0.5,
                                transition: 'all var(--transition)',
                            }}>
                                {/* Toggle */}
                                <button
                                    onClick={() => toggleDay(day.day_of_week)}
                                    style={{
                                        width: 36, height: 20, borderRadius: 'var(--radius-full)',
                                        border: 'none', cursor: 'pointer', position: 'relative',
                                        background: day.is_active ? 'var(--primary)' : 'var(--outline-variant)',
                                        transition: 'all var(--transition)', flexShrink: 0,
                                    }}
                                >
                                    <div style={{
                                        width: 16, height: 16, borderRadius: '50%',
                                        background: 'var(--on-primary)',
                                        position: 'absolute', top: '2px',
                                        left: day.is_active ? '18px' : '2px',
                                        transition: 'all var(--transition)',
                                    }} />
                                </button>

                                {/* Day name */}
                                <span style={{
                                    fontFamily: 'var(--font-mono)', fontSize: '0.72rem', fontWeight: 700,
                                    color: day.is_active ? 'var(--on-surface)' : 'var(--outline)',
                                    width: '36px', letterSpacing: '0.05em',
                                }}>
                                    {DAY_SHORT[day.day_of_week]}
                                </span>

                                {/* Time pickers */}
                                {day.is_active && (
                                    <>
                                        <input
                                            type="time"
                                            value={day.start_hour}
                                            onChange={e => updateDayTime(day.day_of_week, 'start_hour', e.target.value)}
                                            style={{
                                                padding: '4px 8px', borderRadius: 'var(--radius)',
                                                background: 'var(--surface-low)', color: 'var(--on-surface)',
                                                border: 'none', fontFamily: 'var(--font-mono)', fontSize: '0.78rem',
                                            }}
                                        />
                                        <span style={{ color: 'var(--outline)', fontSize: '0.75rem' }}>→</span>
                                        <input
                                            type="time"
                                            value={day.end_hour}
                                            onChange={e => updateDayTime(day.day_of_week, 'end_hour', e.target.value)}
                                            style={{
                                                padding: '4px 8px', borderRadius: 'var(--radius)',
                                                background: 'var(--surface-low)', color: 'var(--on-surface)',
                                                border: 'none', fontFamily: 'var(--font-mono)', fontSize: '0.78rem',
                                            }}
                                        />
                                    </>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── Blocked Dates ── */}
                <div style={{ marginBottom: '1.5rem', padding: '1.25rem', background: 'var(--surface-low)', borderRadius: 'var(--radius-xl)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.75rem' }}>
                        <CalendarOff size={18} color="var(--error)" />
                        <span style={{ fontFamily: 'var(--font-body)', fontWeight: 700, color: 'var(--on-surface)', fontSize: '0.9rem' }}>Blocked Dates</span>
                    </div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--on-surface-var)', fontFamily: 'var(--font-mono)', marginBottom: '0.75rem' }}>
                        Block specific dates when you're unavailable (holidays, leave, etc.)
                    </p>
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '0.75rem' }}>
                        <input
                            type="date"
                            value={newBlockedDate}
                            onChange={e => setNewBlockedDate(e.target.value)}
                            style={{
                                flex: 1, padding: '8px 12px', borderRadius: 'var(--radius-md)',
                                background: 'var(--surface-lowest)', color: 'var(--on-surface)',
                                border: 'none', fontFamily: 'var(--font-mono)', fontSize: '0.82rem',
                            }}
                        />
                        <button onClick={addBlockedDate} className="btn-secondary" style={{ padding: '8px 14px', fontSize: '0.78rem', gap: '4px', borderRadius: 'var(--radius-md)' }}>
                            <Plus size={14} /> Add
                        </button>
                    </div>
                    {blockedDates.length > 0 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                            {blockedDates.map(date => (
                                <span key={date} style={{
                                    display: 'inline-flex', alignItems: 'center', gap: '6px',
                                    padding: '4px 10px', borderRadius: 'var(--radius-full)',
                                    background: 'rgba(255,180,171,0.1)', color: 'var(--error)',
                                    fontSize: '0.72rem', fontFamily: 'var(--font-mono)', fontWeight: 600,
                                }}>
                                    {date}
                                    <button onClick={() => removeBlockedDate(date)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--error)', padding: 0, display: 'flex' }}>
                                        <X size={12} />
                                    </button>
                                </span>
                            ))}
                        </div>
                    )}
                </div>

                {/* Save */}
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="btn-primary"
                    style={{
                        width: '100%', padding: '14px', fontSize: '0.9rem',
                        justifyContent: 'center', gap: '8px', borderRadius: 'var(--radius-md)',
                        opacity: saving ? 0.7 : 1,
                    }}
                >
                    {saving ? <Loader2 className="animate-spin" size={18} /> : <><Save size={18} /> Save Availability</>}
                </button>
            </div>
        </div>
    );
}
