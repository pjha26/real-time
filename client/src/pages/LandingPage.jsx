import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useExpertStore } from '../store/useStore';

const MOCK_EXPERTS = [
    { id: '1', name: 'Marcus Thorne', specialty: ['Product Strategy', 'Growth'], bio: 'Ex-Apple strategist specializing in fluid transactional experiences and high-growth ecosystems.', match_score: 97, hourly_rate: 450 },
    { id: '2', name: 'Elena Vance', specialty: ['UI/UX', 'Motion Systems', 'Accessibility'], bio: 'Senior UI Architect with focus on accessibility and motion systems. Creator of the Flux Framework.', match_score: 94, hourly_rate: 380 },
    { id: '3', name: 'David Chen', specialty: ['Cloud Infrastructure', 'AWS', 'Azure'], bio: 'Cloud Infrastructure expert. AWS/Azure specialist for scaling SaaS platforms to millions.', match_score: 91, hourly_rate: 420 },
];

export default function LandingPage() {
    const { experts, fetchExperts } = useExpertStore();
    const [search, setSearch] = useState('');
    const [displayExperts, setDisplayExperts] = useState(MOCK_EXPERTS);
    const navigate = useNavigate();

    useEffect(() => {
        fetchExperts().catch(() => { });
    }, []);

    useEffect(() => {
        if (experts.length > 0) setDisplayExperts(experts);
    }, [experts]);

    const handleSearch = (e) => {
        e.preventDefault();
        if (search.trim()) navigate(`/explore?search=${encodeURIComponent(search)}`);
        else navigate('/explore');
    };

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg)', position: 'relative', overflow: 'hidden' }}>
            {/* Blobs */}
            <div className="blob blob-1" />
            <div className="blob blob-2" />

            {/* Top Nav */}
            <nav className="topnav">
                <div className="topnav-logo">⚡ Match & Flow</div>
                <div className="topnav-links">
                    <Link to="/explore" className="topnav-link">Explore</Link>
                    <Link to="/workspace" className="topnav-link">Workspace</Link>
                    <Link to="/explore" className="topnav-link">My Experts</Link>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <Link to="/login" className="btn-ghost" style={{ textDecoration: 'none' }}>Sign in</Link>
                    <Link to="/register" className="btn-primary" style={{ textDecoration: 'none' }}>Get started</Link>
                </div>
            </nav>

            {/* Hero */}
            <section style={{ paddingTop: '120px', paddingBottom: '80px', position: 'relative', zIndex: 1 }}>
                <div className="container">
                    <div style={{ maxWidth: '860px' }}>
                        <span className="section-label animate-fadeInUp" style={{ display: 'inline-block', marginBottom: '1rem' }}>
                            AI CONCIERGE ACTIVE
                        </span>
                        <h1 className="animate-fadeInUp" style={{ animationDelay: '80ms', marginBottom: '1.5rem', color: 'var(--on-surface)' }}>
                            Who do you need to{' '}
                            <span style={{ background: 'linear-gradient(135deg, var(--primary-c), var(--primary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                                flow with
                            </span>{' '}
                            today?
                        </h1>
                        <p className="animate-fadeInUp" style={{ animationDelay: '160ms', fontSize: '1.1rem', maxWidth: '560px', marginBottom: '2.5rem' }}>
                            Match & Flow connects you with world-class experts through fluid AI intelligence — curated for your exact project state.
                        </p>

                        {/* Search */}
                        <form onSubmit={handleSearch} className="animate-fadeInUp" style={{ animationDelay: '240ms', display: 'flex', gap: '12px', maxWidth: '600px' }}>
                            <div style={{ flex: 1, position: 'relative' }}>
                                <span className="material-icons" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--outline)', fontSize: '20px' }}>search</span>
                                <input
                                    className="input"
                                    placeholder="Search by skill, domain, or outcome…"
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    style={{ paddingLeft: '48px', fontSize: '1rem' }}
                                />
                            </div>
                            <button type="submit" className="btn-primary">
                                <span className="material-icons" style={{ fontSize: 18 }}>arrow_forward</span>
                                Match me
                            </button>
                        </form>

                        {/* AI Indicator */}
                        <div className="animate-fadeInUp" style={{ animationDelay: '320ms', marginTop: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div className="pulse-dot" />
                            <span style={{ fontSize: '0.8rem', color: 'var(--on-surface-var)' }}>
                                AI Concierge is synthesizing your workspace connections… connecting context, skills, and availability in real-time.
                            </span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Expert Match Cards */}
            <section style={{ padding: '0 0 80px', position: 'relative', zIndex: 1 }}>
                <div className="container">
                    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '2rem' }}>
                        <div>
                            <span className="section-label">↑ TOP MATCHES</span>
                            <h2 style={{ marginTop: '0.5rem' }}>Top Expert Matches</h2>
                            <p style={{ fontSize: '0.9rem', marginTop: '4px' }}>Real-time matching based on global innovation trends and collaborative performance.</p>
                        </div>
                        <Link to="/explore" className="btn-secondary" style={{ textDecoration: 'none', flexShrink: 0 }}>
                            View all experts
                            <span className="material-icons" style={{ fontSize: 16 }}>arrow_forward</span>
                        </Link>
                    </div>

                    {/* Staggered grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1.2fr', gap: '1.5rem' }} className="stagger">
                        {displayExperts.slice(0, 3).map((expert, i) => (
                            <ExpertMatchCard key={expert.id || i} expert={expert} featured={i === 0} />
                        ))}
                    </div>
                </div>
            </section>

            {/* Why Match Scoring */}
            <section style={{ padding: '80px 0', background: 'var(--surface-low)', position: 'relative', zIndex: 1 }}>
                <div className="container">
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'center' }}>
                        <div>
                            <span className="section-label">WHY MATCH SCORING?</span>
                            <h2 style={{ marginTop: '0.75rem', marginBottom: '1rem' }}>400+ data points for perfect collaboration</h2>
                            <p style={{ marginBottom: '2rem' }}>
                                Our AI analyzes over 400 data points including past collaboration velocity, technical depth, and cultural alignment to ensure your project's flow is never interrupted.
                            </p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {[
                                    { label: 'Collaboration Velocity', pct: 97 },
                                    { label: 'Technical Depth', pct: 89 },
                                    { label: 'Cultural Alignment', pct: 94 },
                                ].map(item => (
                                    <div key={item.label}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                            <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--on-surface)' }}>{item.label}</span>
                                            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary)', fontFamily: 'var(--font-display)' }}>{item.pct}%</span>
                                        </div>
                                        <div className="progress-bar">
                                            <div className="progress-fill" style={{ width: `${item.pct}%` }} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            {[
                                { icon: 'verified', label: 'Peer-reviewed experts', val: '2,400+' },
                                { icon: 'speed', label: 'Avg. match time', val: '< 30s' },
                                { icon: 'star', label: 'Satisfaction rate', val: '98.4%' },
                                { icon: 'bolt', label: 'Active collaborations', val: '12K+' },
                            ].map(stat => (
                                <div key={stat.label} className="card animate-fadeInUp">
                                    <span className="material-icons" style={{ color: 'var(--primary)', marginBottom: '8px', display: 'block' }}>{stat.icon}</span>
                                    <div className="stat-number" style={{ fontSize: '1.8rem' }}>{stat.val}</div>
                                    <div className="stat-label">{stat.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Collaborative Standard */}
            <section style={{ padding: '80px 0', position: 'relative', zIndex: 1 }}>
                <div className="container" style={{ textAlign: 'center' }}>
                    <span className="section-label">THE COLLABORATIVE STANDARD</span>
                    <h2 style={{ marginTop: '0.75rem', marginBottom: '1rem', maxWidth: '600px', margin: '0.75rem auto 1rem' }}>
                        Every expert is peer-reviewed for studio-grade work
                    </h2>
                    <p style={{ maxWidth: '500px', margin: '0 auto 2.5rem' }}>
                        Every expert on Match & Flow is vetted through a peer-review protocol designed for high-end studio environments.
                    </p>
                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <Link to="/register" className="btn-primary" style={{ textDecoration: 'none' }}>
                            <span className="material-icons" style={{ fontSize: 18 }}>rocket_launch</span>
                            Start matching
                        </Link>
                        <Link to="/explore" className="btn-secondary" style={{ textDecoration: 'none' }}>Browse experts</Link>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer style={{ padding: '2rem', borderTop: '1px solid var(--outline-var)', opacity: 0.4 }}>
                <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--primary)', fontSize: '0.9rem' }}>⚡ Match & Flow</span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--on-surface-var)' }}>The future of collaborative expert matching, powered by fluid intelligence.</span>
                    <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem' }}>
                        <a href="#" style={{ color: 'var(--on-surface-var)' }}>Privacy</a>
                        <a href="#" style={{ color: 'var(--on-surface-var)' }}>Legal</a>
                        <a href="#" style={{ color: 'var(--on-surface-var)' }}>Support</a>
                    </div>
                </div>
            </footer>
        </div>
    );
}

function ExpertMatchCard({ expert, featured }) {
    const initials = expert.name?.split(' ').map(n => n[0]).join('') || '?';
    return (
        <Link to={`/experts/${expert.id}`} style={{ textDecoration: 'none' }}>
            <div className="card animate-fadeInUp" style={{ height: '100%', cursor: 'pointer', padding: featured ? '2rem' : '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
                    <div className="avatar" style={{ width: featured ? 52 : 44, height: featured ? 52 : 44, fontSize: featured ? '1.1rem' : '0.9rem' }}>
                        {initials}
                    </div>
                    <div style={{
                        background: 'rgba(218,185,255,0.1)', color: 'var(--primary)',
                        padding: '4px 10px', borderRadius: 'var(--radius-full)',
                        fontSize: '0.75rem', fontWeight: 700, fontFamily: 'var(--font-display)',
                    }}>
                        {expert.match_score || 95}% match
                    </div>
                </div>
                <h3 style={{ marginBottom: '0.25rem', fontSize: featured ? '1.25rem' : '1rem' }}>{expert.name}</h3>
                <p style={{ fontSize: '0.85rem', marginBottom: '1rem', lineHeight: 1.5 }}>{expert.bio}</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '1.25rem' }}>
                    {(expert.specialty || []).slice(0, 3).map(s => (
                        <span key={s} className="chip">{s}</span>
                    ))}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.85rem', fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--on-surface)' }}>
                        ${expert.hourly_rate || 400}/hr
                    </span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '4px' }}>
                        View profile <span className="material-icons" style={{ fontSize: 14 }}>arrow_forward</span>
                    </span>
                </div>
            </div>
        </Link>
    );
}
