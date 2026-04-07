import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { SignUp } from '@clerk/clerk-react';
import axios from 'axios';
import { useAuthStore } from '../store/useStore';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function Register({ clerkEnabled = false }) {
    const navigate = useNavigate();
    const { setAuth } = useAuthStore();
    const [form, setForm] = useState({ name: '', email: '', password: '', role: 'client' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const { data } = await axios.post(`${API}/api/auth/register`, form);
            localStorage.setItem('token', data.token);
            setAuth(data.user, data.token);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.error || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    const pageStyle = {
        minHeight: '100vh',
        background: 'var(--bg)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
    };

    return (
        <div style={pageStyle}>
            <div className="blob blob-1" />
            <div className="blob blob-2" />
            <div style={{ position: 'relative', zIndex: 1, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
                <Link to="/" style={{ textDecoration: 'none' }}>
                    <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.5rem', color: 'var(--primary)' }}>
                        ⚡ Match & Flow
                    </div>
                </Link>

                {clerkEnabled ? (
                    <SignUp
                        routing="hash"
                        signInUrl="/login"
                        appearance={{
                            variables: {
                                colorPrimary: '#8f00ff', colorBackground: '#0e0a1a',
                                colorText: '#e8deff', colorTextSecondary: '#a394c8',
                                colorInputBackground: '#1a1230', colorInputText: '#e8deff',
                                borderRadius: '12px', fontFamily: 'Inter, sans-serif',
                            },
                            elements: {
                                card: { boxShadow: '0 0 40px rgba(143,0,255,0.15)', border: '1px solid rgba(218,185,255,0.1)' },
                                formButtonPrimary: { background: 'linear-gradient(135deg, #8f00ff, #b96aff)' },
                            }
                        }}
                    />
                ) : (
                    <form onSubmit={handleSubmit} className="card" style={{ width: '100%', maxWidth: '420px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <h2 style={{ textAlign: 'center', marginBottom: '0.5rem' }}>Create Account</h2>
                        {error && <div style={{ color: '#ff6b6b', fontSize: '0.875rem', textAlign: 'center' }}>{error}</div>}
                        <div>
                            <label style={{ fontSize: '0.8rem', color: 'var(--on-surface-var)', display: 'block', marginBottom: '6px' }}>Full Name</label>
                            <input className="input" placeholder="Your name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
                        </div>
                        <div>
                            <label style={{ fontSize: '0.8rem', color: 'var(--on-surface-var)', display: 'block', marginBottom: '6px' }}>Email</label>
                            <input className="input" type="email" placeholder="you@example.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
                        </div>
                        <div>
                            <label style={{ fontSize: '0.8rem', color: 'var(--on-surface-var)', display: 'block', marginBottom: '6px' }}>Password</label>
                            <input className="input" type="password" placeholder="••••••••" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
                        </div>
                        <div>
                            <label style={{ fontSize: '0.8rem', color: 'var(--on-surface-var)', display: 'block', marginBottom: '6px' }}>I am a…</label>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                {['client', 'expert'].map(r => (
                                    <button key={r} type="button" onClick={() => setForm({ ...form, role: r })}
                                        className={form.role === r ? 'btn-primary' : 'btn-ghost'}
                                        style={{ flex: 1, textTransform: 'capitalize' }}>
                                        {r}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <button className="btn-primary" type="submit" disabled={loading} style={{ marginTop: '0.5rem' }}>
                            {loading ? 'Creating account…' : 'Create Account'}
                        </button>
                        <p style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--on-surface-var)' }}>
                            Have an account? <Link to="/login" style={{ color: 'var(--primary)' }}>Sign in</Link>
                        </p>
                    </form>
                )}
            </div>
        </div>
    );
}
