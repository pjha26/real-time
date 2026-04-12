import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { SignIn } from '@clerk/clerk-react';
import axios from 'axios';
import { useAuthStore } from '../store/useStore';
import { ShieldCheck, Users, GraduationCap, ArrowLeft } from 'lucide-react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const ROLES = [
    { id: 'client', label: 'Client', desc: 'Book sessions with top experts', icon: Users, color: '#8F00FF' },
    { id: 'expert', label: 'Expert / Trainer', desc: 'Manage your sessions & clients', icon: GraduationCap, color: '#4ade80' },
    { id: 'admin', label: 'Administrator', desc: 'Platform management & oversight', icon: ShieldCheck, color: '#f59e0b' },
];

export default function Login({ clerkEnabled = false }) {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [selectedRole, setSelectedRole] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const { data } = await axios.post(`${API}/api/auth/login`, { email, password });
            localStorage.setItem('token', data.token);
            localStorage.setItem('user_role', selectedRole);
            localStorage.setItem('mf_user', JSON.stringify({ ...data.user, role: selectedRole }));
            localStorage.setItem('mf_token', data.token);
            if (selectedRole === 'admin') navigate('/admin');
            else if (selectedRole === 'expert') navigate('/workspace');
            else navigate('/workspace');
        } catch (err) {
            setError(err.response?.data?.error || 'Login failed');
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
                    <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.5rem', color: 'var(--primary)', letterSpacing: '-0.02em' }}>
                        ⚡ ExpertBook
                    </div>
                </Link>

                {clerkEnabled ? (
                    <SignIn
                        routing="hash"
                        signUpUrl="/register"
                        forceRedirectUrl="/workspace"
                        fallbackRedirectUrl="/workspace"
                        appearance={{
                            variables: {
                                colorPrimary: '#8F00FF', colorBackground: '#1c1c1e',
                                colorText: '#e6e1e5', colorTextSecondary: '#938f99',
                                colorInputBackground: '#2b2930', colorInputText: '#e6e1e5',
                                borderRadius: '1rem', fontFamily: 'Inter, sans-serif',
                            },
                            elements: {
                                card: { boxShadow: '0 8px 32px rgba(0,0,0,0.3)', border: '1px solid rgba(77,67,86,0.2)' },
                                formButtonPrimary: { background: 'linear-gradient(135deg, #8F00FF, #B366FF)' },
                            }
                        }}
                    />
                ) : !selectedRole ? (
                    /* ── Role Selection Screen ── */
                    <div className="card animate-fadeInUp" style={{ width: '100%', maxWidth: '480px', padding: '2rem' }}>
                        <h2 style={{ textAlign: 'center', marginBottom: '0.5rem', color: 'var(--on-surface)' }}>Welcome Back</h2>
                        <p style={{ textAlign: 'center', color: 'var(--on-surface-var)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>Select how you'd like to sign in</p>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {ROLES.map(role => (
                                <button
                                    key={role.id}
                                    onClick={() => setSelectedRole(role.id)}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: '1rem',
                                        padding: '1rem 1.25rem', borderRadius: 'var(--radius-lg)',
                                        background: 'var(--surface-lowest)', border: '1px solid var(--surface-ch)',
                                        cursor: 'pointer', transition: 'all var(--transition)', textAlign: 'left',
                                        color: 'var(--on-surface)',
                                    }}
                                    onMouseEnter={e => {
                                        e.currentTarget.style.borderColor = role.color;
                                        e.currentTarget.style.background = 'var(--surface-low)';
                                    }}
                                    onMouseLeave={e => {
                                        e.currentTarget.style.borderColor = 'var(--surface-ch)';
                                        e.currentTarget.style.background = 'var(--surface-lowest)';
                                    }}
                                >
                                    <div style={{
                                        width: 44, height: 44, borderRadius: 'var(--radius-md)',
                                        background: `${role.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                                    }}>
                                        <role.icon size={22} color={role.color} />
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 700, fontSize: '0.95rem', fontFamily: 'var(--font-body)' }}>{role.label}</div>
                                        <div style={{ fontSize: '0.78rem', color: 'var(--on-surface-var)', marginTop: '2px' }}>{role.desc}</div>
                                    </div>
                                </button>
                            ))}
                        </div>

                        <p style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--on-surface-var)', marginTop: '1.5rem' }}>
                            No account? <Link to="/register" style={{ color: 'var(--primary)' }}>Register</Link>
                        </p>
                    </div>
                ) : (
                    /* ── Login Form ── */
                    <form onSubmit={handleSubmit} className="card animate-fadeInUp" style={{ width: '100%', maxWidth: '420px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <button type="button" onClick={() => setSelectedRole(null)}
                            style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', color: 'var(--on-surface-var)', cursor: 'pointer', padding: 0, fontSize: '0.82rem', fontFamily: 'var(--font-body)' }}>
                            <ArrowLeft size={16} /> Change role
                        </button>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', borderRadius: 'var(--radius-md)', background: 'var(--surface-lowest)', border: '1px solid var(--surface-ch)' }}>
                            {(() => { const R = ROLES.find(r => r.id === selectedRole); return R ? <><R.icon size={18} color={R.color} /><span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--on-surface)' }}>Signing in as {R.label}</span></> : null; })()}
                        </div>

                        <h2 style={{ textAlign: 'center', marginBottom: '0.25rem', color: 'var(--on-surface)' }}>Sign In</h2>
                        {error && <div style={{ color: '#ff6b6b', fontSize: '0.875rem', textAlign: 'center' }}>{error}</div>}

                        <div>
                            <label style={{ fontSize: '0.8rem', color: 'var(--on-surface-var)', display: 'block', marginBottom: '6px' }}>Email</label>
                            <input className="input" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
                        </div>
                        <div>
                            <label style={{ fontSize: '0.8rem', color: 'var(--on-surface-var)', display: 'block', marginBottom: '6px' }}>Password</label>
                            <input className="input" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
                        </div>
                        <button className="btn-primary" type="submit" disabled={loading} style={{ marginTop: '0.5rem' }}>
                            {loading ? 'Signing in…' : 'Sign In'}
                        </button>
                        <p style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--on-surface-var)' }}>
                            No account? <Link to="/register" style={{ color: 'var(--primary)' }}>Register</Link>
                        </p>
                    </form>
                )}
            </div>
        </div>
    );
}
