import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useStore';

export default function Register() {
    const { register, loading, error } = useAuthStore();
    const navigate = useNavigate();
    const [form, setForm] = useState({ name: '', email: '', password: '', role: 'client' });
    const [showPass, setShowPass] = useState(false);

    const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await register(form.name, form.email, form.password, form.role);
            navigate('/workspace');
        } catch (_) { }
    };

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
            <div className="blob blob-1" />
            <div className="blob blob-2" />

            <div style={{ width: '100%', maxWidth: '440px', padding: '2rem', position: 'relative', zIndex: 1 }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '0.5rem' }}>⚡ Match & Flow</div>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Create your workspace</h2>
                    <p style={{ fontSize: '0.875rem', color: 'var(--on-surface-var)' }}>Join the collaborative intelligence platform</p>
                </div>

                <div className="card" style={{ padding: '2rem', border: '1px solid rgba(218,185,255,0.08)' }}>
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        {error && (
                            <div style={{ background: 'rgba(255,180,171,0.1)', border: '1px solid rgba(255,180,171,0.2)', color: 'var(--error)', padding: '10px 14px', borderRadius: 'var(--radius)', fontSize: '0.85rem' }}>
                                {error}
                            </div>
                        )}

                        <div className="form-group">
                            <label className="form-label">Full name</label>
                            <input className="input" type="text" placeholder="Your name" value={form.name} onChange={set('name')} required />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Email address</label>
                            <input className="input" type="email" placeholder="you@example.com" value={form.email} onChange={set('email')} required />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Password</label>
                            <div style={{ position: 'relative' }}>
                                <input className="input" type={showPass ? 'text' : 'password'} placeholder="Min. 8 characters" value={form.password} onChange={set('password')} required minLength={8} style={{ paddingRight: '48px' }} />
                                <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--outline)', padding: 0 }}>
                                    <span className="material-icons" style={{ fontSize: 20 }}>{showPass ? 'visibility_off' : 'visibility'}</span>
                                </button>
                            </div>
                        </div>

                        {/* Role toggle */}
                        <div className="form-group">
                            <label className="form-label">I am joining as</label>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                                {['client', 'expert'].map(role => (
                                    <button
                                        key={role}
                                        type="button"
                                        onClick={() => setForm(f => ({ ...f, role }))}
                                        style={{
                                            padding: '12px', borderRadius: 'var(--radius-md)', border: 'none', cursor: 'pointer',
                                            background: form.role === role ? 'rgba(218,185,255,0.15)' : 'var(--surface-lowest)',
                                            color: form.role === role ? 'var(--primary)' : 'var(--on-surface-var)',
                                            fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: '0.875rem',
                                            border: form.role === role ? '1px solid rgba(218,185,255,0.3)' : '1px solid transparent',
                                            transition: 'all var(--transition)',
                                        }}
                                    >
                                        <span className="material-icons" style={{ fontSize: 18, display: 'block', margin: '0 auto 4px' }}>
                                            {role === 'client' ? 'person_search' : 'workspace_premium'}
                                        </span>
                                        {role === 'client' ? 'Seeker' : 'Expert'}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%', justifyContent: 'center', padding: '13px', fontSize: '0.95rem', marginTop: '0.25rem', opacity: loading ? 0.7 : 1 }}>
                            {loading ? <div className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }} /> : (
                                <>
                                    <span className="material-icons" style={{ fontSize: 18 }}>rocket_launch</span>
                                    Initialize Workspace
                                </>
                            )}
                        </button>
                    </form>
                </div>

                <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem', color: 'var(--on-surface-var)' }}>
                    Already a member?{' '}
                    <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>Sign in</Link>
                </p>
            </div>
        </div>
    );
}
