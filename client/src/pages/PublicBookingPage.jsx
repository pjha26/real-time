import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
    Check,
    LayoutGrid,
    Sparkles,
    CheckCircle2,
    Calendar,
    Rocket
} from 'lucide-react';
import { useBookingStore, useAuthStore, useSocketStore } from '../store/useStore';
import Layout from '../components/Layout';

const EXPERTS = {
    '1': { name: 'Marcus Thorne', specialty: 'Product Strategy', hourly_rate: 450 },
    '2': { name: 'Elena Vance', specialty: 'UI/UX Architecture', hourly_rate: 380 },
    '3': { name: 'David Chen', specialty: 'Cloud Infrastructure', hourly_rate: 420 },
    '4': { name: 'Zoe Nakamura', specialty: 'AI/ML', hourly_rate: 500 },
    '5': { name: 'Alex Rivera', specialty: 'Blockchain', hourly_rate: 460 },
    '6': { name: 'Sarah Kim', specialty: 'Growth Marketing', hourly_rate: 340 },
};

const TIME_SLOTS = ['9:00 AM', '10:00 AM', '11:00 AM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM'];

const SCOPE_ITEMS = [
    'Audit of current atomic components and accessibility gaps in existing library.',
    'Definition of a multi-brand token strategy for 2024 compliance.',
    'Live pairing session to establish 3 core dashboard templates.',
];

export default function PublicBookingPage() {
    const { expertId } = useParams();
    const { user } = useAuthStore();
    const { createBooking, loading: storeLoading, addMockBooking } = useBookingStore();
    const navigate = useNavigate();

    const expert = EXPERTS[expertId] || { name: 'Elena Vance', specialty: 'UI/UX Architecture', hourly_rate: 380 };
    const initials = expert.name.split(' ').map(n => n[0]).join('');

    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedTime, setSelectedTime] = useState(null);
    const [notes, setNotes] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState('');
    const [isBookingLocal, setIsBookingLocal] = useState(false);
    
    const loading = storeLoading || isBookingLocal;

    const days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() + i);
        return d;
    });

    const handleSubmit = async () => {
        const CLERK_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
        const isClerkActive = CLERK_KEY && !CLERK_KEY.includes('your_clerk');
        const hasToken = localStorage.getItem('mf_token');

        if (!user && !isClerkActive && !hasToken) { navigate('/login'); return; }

        if (!selectedDate || !selectedTime) { setError('Please select a date and time.'); return; }
        setError('');

        // ── DEMO MODE: If expertId is one of our mock IDs (1-6), simulate success and save ──
        if (['1', '2', '3', '4', '5', '6'].includes(expertId)) {
            setIsBookingLocal(true);
            setTimeout(() => {
                setIsBookingLocal(false);
                setSubmitted(true);
                
                // Add to local state so it appears in My Bookings
                const start = new Date(selectedDate);
                const [h, m] = selectedTime.replace(' AM', '').replace(' PM', '').split(':');
                start.setHours(parseInt(h) + (selectedTime.includes('PM') && h !== '12' ? 12 : 0), parseInt(m));
                
                addMockBooking({
                    id: `demo_${Date.now()}`,
                    is_mock: true,
                    expert_id: expertId,
                    start_time: start.toISOString(),
                    event_types: { title: 'AI Curated Flow Session' },
                    status: 'pending',
                    experts: { name: expert.name }
                });

                // Connect ad-hoc if not already connected
                useSocketStore.getState().connect('demo_client', 'client');
                const { socket } = useSocketStore.getState();
                if (socket) socket.emit('demo:book', { id: `demo_${Date.now()}`, expert_id: expertId, start_time: selectedDate, event_types: { title: 'AI Curated Flow Session' }, status: 'pending' });
            }, 800);
            return;
        }

        try {
            const start = new Date(selectedDate);
            const [h, m] = selectedTime.replace(' AM', '').replace(' PM', '').split(':');
            start.setHours(parseInt(h) + (selectedTime.includes('PM') && h !== '12' ? 12 : 0), parseInt(m));
            const end = new Date(start.getTime() + 60 * 60 * 1000);
            await createBooking({ expert_id: expertId, start_time: start.toISOString(), end_time: end.toISOString(), scope: { notes } });
            setSubmitted(true);
        } catch (err) {
            setError(err.response?.data?.error || 'Booking failed. Please try again.');
        }
    };

    if (submitted) {
        return (
            <Layout>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
                    <div className="card animate-fadeInUp" style={{ textAlign: 'center', maxWidth: '480px', padding: '3rem', border: '1px solid var(--surface-ch)', borderRadius: 'var(--radius-xl)', background: 'var(--surface-lowest)' }}>
                        <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--primary-c))', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                            <Check size={32} color="var(--on-primary)" />
                        </div>
                        <h2 style={{ marginBottom: '0.75rem', color: 'var(--on-surface)' }}>Workspace Initialized!</h2>
                        <p style={{ marginBottom: '2rem', color: 'var(--on-surface-var)' }}>Your session with <strong style={{ color: 'var(--primary)' }}>{expert.name}</strong> has been confirmed. The Curator has sent prep materials to your inbox.</p>
                        <div style={{ background: 'var(--surface-low)', borderRadius: 'var(--radius-md)', padding: '1rem', marginBottom: '2rem', fontSize: '0.85rem', color: 'var(--on-surface-var)', border: '1px solid var(--surface-ch)' }}>
                            💡 Curator Tip: {expert.name.split(' ')[0]} prefers having access to Figma files 24 hours in advance. Your prep list has been updated.
                        </div>
                        <Link to="/workspace" className="btn-primary" style={{ textDecoration: 'none', display: 'inline-flex', gap: '8px', borderRadius: 'var(--radius-md)' }}>
                            <LayoutGrid size={18} />
                            Go to Workspace
                        </Link>
                    </div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div style={{ position: 'relative', overflow: 'hidden' }}>
                <div className="blob blob-1" style={{ width: '400px', height: '400px', top: '-100px' }} />

                <div style={{ padding: '2.5rem 2rem', position: 'relative', zIndex: 1 }}>
                    <span className="section-label">DYNAMIC BOOKING</span>
                    <h1 style={{ marginTop: '0.5rem', marginBottom: '0.5rem', fontSize: '1.8rem' }}>
                        Finalizing your workspace with{' '}
                        <span style={{ color: 'var(--primary)' }}>{expert.name}</span>
                    </h1>
                    <p style={{ marginBottom: '2.5rem', color: 'var(--on-surface-var)' }}>AI-curated scope + intelligent availability sync.</p>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', alignItems: 'start' }}>
                        {/* Left */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            {/* AI Scope */}
                            <div className="card" style={{ background: 'var(--surface-lowest)', border: '1px solid var(--surface-ch)', borderRadius: 'var(--radius-xl)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
                                    <Sparkles size={20} color="var(--primary)" />
                                    <span style={{ fontFamily: 'var(--font-body)', fontWeight: 700, color: 'var(--on-surface)' }}>AI-Drafted Project Scope</span>
                                </div>
                                <p style={{ fontSize: '0.8rem', color: 'var(--on-surface-var)', marginBottom: '1rem' }}>Based on your inquiry about "Scalable Design Systems", the Curator has synthesized:</p>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    {SCOPE_ITEMS.map((item, i) => (
                                        <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                                            <CheckCircle2 size={16} color="var(--primary)" style={{ marginTop: '2px', flexShrink: 0 }} />
                                            <span style={{ fontSize: '0.85rem', color: 'var(--on-surface-var)', lineHeight: 1.5 }}>{item}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Notes */}
                            <div className="card" style={{ borderRadius: 'var(--radius-xl)', background: 'var(--surface-lowest)', border: '1px solid var(--surface-ch)' }}>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--on-surface)', marginBottom: '8px', fontFamily: 'var(--font-body)' }}>
                                    Additional Context (optional)
                                </label>
                                <textarea
                                    className="input"
                                    rows={4}
                                    placeholder="Describe your project goals, deliverables, or questions for the expert…"
                                    value={notes}
                                    onChange={e => setNotes(e.target.value)}
                                    style={{ resize: 'vertical', borderRadius: 'var(--radius-lg)', background: 'var(--surface-low)', border: '1px solid var(--surface-ch)' }}
                                />
                            </div>
                        </div>

                        {/* Right */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            {/* Calendar */}
                            <div className="card" style={{ borderRadius: 'var(--radius-xl)', background: 'var(--surface-lowest)', border: '1px solid var(--surface-ch)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
                                    <Calendar size={20} color="var(--primary)" />
                                    <span style={{ fontFamily: 'var(--font-body)', fontWeight: 700, color: 'var(--on-surface)' }}>Intelligent Availability</span>
                                </div>
                                <p style={{ fontSize: '0.75rem', color: 'var(--on-surface-var)', marginBottom: '1rem' }}>Synchronizing your work cycles with {expert.name.split(' ')[0]}'s peak creative flow.</p>

                                {/* Day picker */}
                                <div style={{ display: 'flex', gap: '8px', marginBottom: '1.25rem', overflowX: 'auto', paddingBottom: '4px' }}>
                                    {days.map((d, i) => {
                                        const isSelected = selectedDate?.toDateString() === d.toDateString();
                                        return (
                                            <button
                                                key={i}
                                                onClick={() => setSelectedDate(d)}
                                                style={{
                                                    flexShrink: 0, padding: '10px 14px', borderRadius: 'var(--radius-xl)', border: '1px solid var(--surface-ch)', cursor: 'pointer',
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
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
                                    {TIME_SLOTS.map(time => {
                                        const isSelected = selectedTime === time;
                                        return (
                                            <button
                                                key={time}
                                                onClick={() => setSelectedTime(time)}
                                                style={{
                                                    padding: '8px 4px', borderRadius: 'var(--radius-md)', border: '1px solid var(--surface-ch)', cursor: 'pointer',
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
                            </div>

                            {/* Expert summary */}
                            <div className="card" style={{ display: 'flex', gap: '1rem', alignItems: 'center', borderRadius: 'var(--radius-xl)', background: 'var(--surface-lowest)', border: '1px solid var(--surface-ch)' }}>
                                <div className="avatar" style={{ width: 44, height: 44, fontSize: '1rem', flexShrink: 0, background: 'var(--primary-c)', color: 'var(--on-primary-c)' }}>{initials}</div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontFamily: 'var(--font-body)', fontWeight: 700, marginBottom: '2px', color: 'var(--on-surface)' }}>{expert.name}</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--on-surface-var)', fontFamily: 'var(--font-mono)' }}>{expert.specialty}</div>
                                </div>
                                <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, color: 'var(--primary)', fontSize: '1.1rem' }}>${expert.hourly_rate}/hr</div>
                            </div>

                            {/* CTA */}
                            {error && <div style={{ background: 'rgba(255,180,171,0.1)', border: '1px solid rgba(255,180,171,0.2)', color: 'var(--error)', padding: '10px 14px', borderRadius: 'var(--radius)', fontSize: '0.85rem' }}>{error}</div>}

                            <button className="btn-primary" onClick={handleSubmit} disabled={loading} style={{ width: '100%', padding: '14px', fontSize: '1rem', justifyContent: 'center', opacity: loading ? 0.7 : 1, gap: '10px' }}>
                                {loading ? <div className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }} /> : (
                                    <>
                                        <Rocket size={20} />
                                        Initialize Workspace
                                    </>
                                )}
                            </button>
                            <p style={{ fontSize: '0.75rem', color: 'var(--on-surface-var)', textAlign: 'center', lineHeight: 1.5 }}>
                                By initializing, you agree to the Workspace Protocols and the AI data processing agreement.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
