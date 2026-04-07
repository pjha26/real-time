import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useExpertStore } from '../store/useStore';

const EXPERTS = [
    { id: '1', name: 'Marcus Thorne', specialty: ['Product Strategy', 'Growth'], bio: 'Ex-Apple strategist specializing in fluid transactional experiences and high-growth ecosystems.', match_score: 97, hourly_rate: 450 },
    { id: '2', name: 'Elena Vance', specialty: ['UI/UX', 'Motion Systems'], bio: 'Senior UI Architect with focus on accessibility and motion systems.', match_score: 94, hourly_rate: 380 },
    { id: '3', name: 'David Chen', specialty: ['Cloud Infrastructure', 'AWS'], bio: 'Cloud Infrastructure expert. AWS/Azure specialist for scaling SaaS.', match_score: 91, hourly_rate: 420 },
];

export default function LuminalLanding() {
    const navigate = useNavigate();
    const { experts, fetchExperts } = useExpertStore();
    const [query, setQuery] = useState('');
    const [nodeCount, setNodeCount] = useState(4200);
    const displayExperts = experts.length > 0 ? experts : EXPERTS;

    useEffect(() => {
        fetchExperts().catch(() => { });
        // Animate node counter
        const interval = setInterval(() => {
            setNodeCount(n => n + Math.floor(Math.random() * 3 - 1));
        }, 1800);
        return () => clearInterval(interval);
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        navigate(`/search${query ? `?q=${encodeURIComponent(query)}` : ''}`);
    };

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
            <div className="blob blob-1" />
            <div className="blob blob-2" />

            {/* Topnav */}
            <nav className="topnav">
                <Link to="/" className="topnav-logo" style={{ textDecoration: 'none' }}>⚡ Match & Flow</Link>
                <div className="topnav-links">
                    <Link to="/search" className="topnav-link">Explore</Link>
                    <a href="#concierge" className="topnav-link">AI Concierge</a>
                    <Link to="/workspace" className="topnav-link">Workspace</Link>
                    <Link to="/explore" className="topnav-link">Experts</Link>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <Link to="/login" className="btn-ghost" style={{ textDecoration: 'none' }}>Sign in</Link>
                    <Link to="/register" className="btn-primary" style={{ textDecoration: 'none' }}>
                        <span className="material-icons" style={{ fontSize: 16 }}>rocket_launch</span>Get started
                    </Link>
                </div>
            </nav>

            {/* ── Hero ── */}
            <section style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '120px 0 80px', position: 'relative', zIndex: 1 }}>
                <div className="container">
                    <div style={{ maxWidth: '780px' }}>
                        {/* Active pulse badge */}
                        <div className="animate-fadeInUp" style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', background: 'rgba(143,0,255,0.1)', border: '1px solid rgba(218,185,255,0.15)', padding: '8px 18px', borderRadius: 'var(--radius-full)', marginBottom: '2rem' }}>
                            <div style={{ display: 'flex', gap: 4 }}>
                                {[0, 0.2, 0.4].map((d, i) => (
                                    <div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--primary)', opacity: 0.8, animation: `pulse 1.4s ${d}s ease-in-out infinite` }} />
                                ))}
                            </div>
                            <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--primary)', fontFamily: 'var(--font-body)', letterSpacing: '0.05em' }}>
                                ACTIVE PULSE · Matching logic optimizing {nodeCount.toLocaleString()} active nodes…
                            </span>
                        </div>

                        <h1 className="animate-fadeInUp" style={{ animationDelay: '80ms', fontSize: 'clamp(2.6rem, 5vw, 4rem)', marginBottom: '1.25rem', lineHeight: 1.1 }}>
                            The{' '}
                            <span style={{ background: 'linear-gradient(135deg, var(--primary-c), var(--primary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                                Intelligent Flow State
                            </span>
                        </h1>

                        <p className="animate-fadeInUp" style={{ animationDelay: '160ms', fontSize: '1.1rem', maxWidth: '580px', marginBottom: '2.5rem', lineHeight: 1.75 }}>
                            A collaborative ecosystem where AI orchestrates the perfect alignment between high-level expertise and complex project needs.
                        </p>

                        {/* Search bar */}
                        <form onSubmit={handleSearch} className="animate-fadeInUp" style={{ animationDelay: '240ms', marginBottom: '3rem' }}>
                            <div style={{ display: 'flex', gap: '12px', maxWidth: '640px' }}>
                                <div style={{ flex: 1, position: 'relative' }}>
                                    <span className="material-icons" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--outline)', fontSize: '20px' }}>search</span>
                                    <input
                                        className="input"
                                        style={{ paddingLeft: '44px', height: '52px', fontSize: '0.95rem' }}
                                        placeholder="Who do you need to flow with today?"
                                        value={query}
                                        onChange={e => setQuery(e.target.value)}
                                    />
                                </div>
                                <button type="submit" className="btn-primary" style={{ padding: '0 24px', height: '52px', flexShrink: 0 }}>
                                    <span className="material-icons" style={{ fontSize: 20 }}>bolt</span>
                                    Find Match
                                </button>
                            </div>
                        </form>

                        {/* Stats row */}
                        <div className="animate-fadeInUp" style={{ animationDelay: '320ms', display: 'flex', gap: '2.5rem', flexWrap: 'wrap' }}>
                            {[['2,400+', 'Vetted Experts'], ['98.4%', 'Match Rate'], ['84%', 'Faster Hiring'], ['< 30s', 'Match Time']].map(([val, lbl]) => (
                                <div key={lbl}>
                                    <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.5rem', color: 'var(--primary)' }}>{val}</div>
                                    <div style={{ fontSize: '0.72rem', color: 'var(--on-surface-var)', marginTop: '2px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{lbl}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Top Expert Matches ── */}
            <section style={{ padding: '60px 0 80px', position: 'relative', zIndex: 1 }}>
                <div className="container">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem' }}>
                        <div>
                            <span className="section-label">TOP EXPERT MATCHES</span>
                            <p style={{ marginTop: '0.5rem', fontSize: '0.875rem', maxWidth: '480px' }}>Real-time matching based on global innovation trends and collaborative performance.</p>
                        </div>
                        <Link to="/search" className="btn-ghost" style={{ textDecoration: 'none', flexShrink: 0 }}>
                            View all <span className="material-icons" style={{ fontSize: 16 }}>arrow_forward</span>
                        </Link>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }} className="stagger">
                        {displayExperts.slice(0, 3).map((expert, i) => {
                            const initials = expert.name?.split(' ').map(n => n[0]).join('') || '?';
                            return (
                                <Link key={expert.id || i} to={`/experts/${expert.id}`} style={{ textDecoration: 'none' }}>
                                    <div className="card animate-fadeInUp" style={{ cursor: 'pointer' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                            <div className="avatar">{initials}</div>
                                            <div style={{ background: 'rgba(218,185,255,0.1)', color: 'var(--primary)', padding: '4px 10px', borderRadius: 'var(--radius-full)', fontSize: '0.75rem', fontWeight: 700, fontFamily: 'var(--font-display)' }}>
                                                {expert.match_score || 94}% match
                                            </div>
                                        </div>
                                        <h3 style={{ marginBottom: '0.25rem' }}>{expert.name}</h3>
                                        <p style={{ fontSize: '0.85rem', marginBottom: '1rem', lineHeight: 1.5 }}>{expert.bio}</p>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '1.25rem' }}>
                                            {(expert.specialty || []).map(s => <span key={s} className="chip">{s}</span>)}
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ fontSize: '0.85rem', fontFamily: 'var(--font-display)', fontWeight: 700 }}>${expert.hourly_rate}/hr</span>
                                            <span style={{ color: 'var(--primary)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: 4 }}>View profile <span className="material-icons" style={{ fontSize: 14 }}>arrow_forward</span></span>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>

                    {/* Collaborative standard */}
                    <div className="card" style={{ marginTop: '2rem', background: 'rgba(143,0,255,0.05)', border: '1px solid rgba(218,185,255,0.08)', display: 'flex', gap: '2rem', alignItems: 'center', flexWrap: 'wrap' }}>
                        <div style={{ flex: 1, minWidth: 200 }}>
                            <h3 style={{ marginBottom: '0.5rem' }}>The Collaborative Standard</h3>
                            <p style={{ fontSize: '0.875rem', lineHeight: 1.6 }}>Every expert is vetted through a peer-review protocol designed for high-end studio environments.</p>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '14px 20px', background: 'rgba(143,0,255,0.08)', borderRadius: 'var(--radius-md)' }}>
                            <div className="pulse-dot" />
                            <div>
                                <div style={{ fontSize: '0.78rem', color: 'var(--primary)', fontWeight: 600, fontFamily: 'var(--font-display)' }}>AI Concierge Active</div>
                                <div style={{ fontSize: '0.72rem', color: 'var(--on-surface-var)' }}>Synthesizing workspace connections…</div>
                            </div>
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--on-surface-var)', maxWidth: 220 }}>
                            Connecting context, skills, and availability in real-time.
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer style={{ borderTop: '1px solid rgba(218,185,255,0.06)', padding: '2rem 0', position: 'relative', zIndex: 1 }}>
                <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                    <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--primary)' }}>⚡ Match & Flow</div>
                    <p style={{ fontSize: '0.8rem', color: 'var(--on-surface-var)' }}>© 2024 Match & Flow. All rights reserved. Powered by Fluid Intelligence.</p>
                    <div style={{ display: 'flex', gap: '1.5rem' }}>
                        {[['Privacy', '#'], ['Terms', '#'], ['Contact', '#']].map(([l, h]) => (
                            <a key={l} href={h} style={{ fontSize: '0.8rem', color: 'var(--on-surface-var)', textDecoration: 'none' }}>{l}</a>
                        ))}
                    </div>
                </div>
            </footer>
        </div>
    );
}
