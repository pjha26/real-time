import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useExpertStore } from '../store/useStore';

const MOCK = [
    { id: '1', name: 'Marcus Thorne', specialty: ['Product Strategy', 'Growth', 'FinTech'], bio: 'Ex-Apple strategist specializing in fluid transactional experiences.', match_score: 97, hourly_rate: 450, impact: 'Top 2%' },
    { id: '2', name: 'Elena Vance', specialty: ['UI/UX', 'Motion Systems', 'Accessibility'], bio: 'Senior UI Architect. Creator of the Flux Framework, adopted by 12 enterprise teams.', match_score: 94, hourly_rate: 380, impact: 'Top 1%' },
    { id: '3', name: 'David Chen', specialty: ['Cloud Infrastructure', 'AWS', 'Azure'], bio: 'Cloud Infrastructure expert. AWS/Azure specialist for scaling SaaS.', match_score: 91, hourly_rate: 420, impact: 'Top 3%' },
    { id: '4', name: 'Zoe Nakamura', specialty: ['AI/ML', 'Python', 'Data Science'], bio: 'Lead AI researcher. Ethics-first approach to model governance.', match_score: 89, hourly_rate: 500, impact: 'Top 1%' },
    { id: '5', name: 'Alex Rivera', specialty: ['Blockchain', 'DeFi', 'Smart Contracts'], bio: 'Web3 pioneer with 6 years building decentralized finance infrastructure at scale.', match_score: 87, hourly_rate: 460, impact: 'Top 4%' },
    { id: '6', name: 'Sarah Kim', specialty: ['Growth Marketing', 'SEO', 'Analytics'], bio: 'Growth architect who scaled 4 SaaS companies from 0 to $10M ARR.', match_score: 85, hourly_rate: 340, impact: 'Top 5%' },
];

const WHY_ITEMS = [
    'Collaboration Velocity Score',
    'Technical Depth Index',
    'Cultural Alignment Profile',
    'Peer-Reviewed Track Record',
];

export default function LuminalMatchSearch() {
    const [searchParams] = useSearchParams();
    const { experts, fetchExperts, loading } = useExpertStore();
    const [query, setQuery] = useState(searchParams.get('q') || '');
    const [showWhy, setShowWhy] = useState(false);

    useEffect(() => { fetchExperts().catch(() => { }); }, []);

    const displayExperts = experts.length > 0 ? experts : MOCK;
    const filtered = query
        ? displayExperts.filter(e =>
            e.name?.toLowerCase().includes(query.toLowerCase()) ||
            (e.specialty || []).some(s => s.toLowerCase().includes(query.toLowerCase()))
        )
        : displayExperts;

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', position: 'relative', overflow: 'hidden' }}>
            <div className="blob blob-1" style={{ opacity: 0.5 }} />

            {/* ── Left sidebar ── */}
            <aside style={{ width: '260px', flexShrink: 0, borderRight: '1px solid rgba(218,185,255,0.08)', padding: '2rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', position: 'sticky', top: 0, height: '100vh', overflowY: 'auto' }}>
                <Link to="/" style={{ textDecoration: 'none' }}>
                    <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--primary)', fontSize: '1rem', marginBottom: '0.5rem' }}>⚡ ExpertBook</div>
                </Link>

                {/* Nav */}
                <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {[
                        { icon: 'explore', label: 'Explore', to: '/search', active: true },
                        { icon: 'grid_view', label: 'Workspace', to: '/workspace' },
                        { icon: 'workspace_premium', label: 'Experts', to: '/explore' },
                    ].map(item => (
                        <Link key={item.label} to={item.to} style={{ textDecoration: 'none' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: 'var(--radius-md)', background: item.active ? 'rgba(218,185,255,0.08)' : 'transparent', color: item.active ? 'var(--primary)' : 'var(--on-surface-var)', fontFamily: 'var(--font-body)', fontSize: '0.875rem', fontWeight: item.active ? 600 : 400, transition: 'all var(--transition)' }}>
                                <span className="material-icons" style={{ fontSize: 18 }}>{item.icon}</span>
                                {item.label}
                            </div>
                        </Link>
                    ))}
                </nav>

                {/* Expert Portal section lable */}
                <div style={{ borderTop: '1px solid rgba(218,185,255,0.08)', paddingTop: '1rem' }}>
                    <div style={{ fontSize: '0.68rem', color: 'var(--outline)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.75rem', fontFamily: 'var(--font-body)' }}>Expert Portal</div>
                    <div style={{ fontSize: '0.85rem', fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--on-surface)', marginBottom: '1rem' }}>ExpertBook</div>
                    {[
                        { icon: 'waves', label: 'Flow', to: '/workspace' },
                        { icon: 'auto_awesome', label: 'Opportunities', to: '/portal' },
                        { icon: 'handshake', label: 'Engagements', to: '/workspace' },
                        { icon: 'analytics', label: 'Analytics', to: '/workspace' },
                        { icon: 'settings', label: 'Settings', to: '/workspace' },
                        { icon: 'help', label: 'Support', to: '#' },
                    ].map(item => (
                        <Link key={item.label} to={item.to} style={{ textDecoration: 'none' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 10px', borderRadius: 'var(--radius)', color: 'var(--on-surface-var)', fontSize: '0.82rem', transition: 'all var(--transition)' }}
                                onMouseEnter={e => e.currentTarget.style.color = 'var(--primary)'}
                                onMouseLeave={e => e.currentTarget.style.color = 'var(--on-surface-var)'}
                            >
                                <span className="material-icons" style={{ fontSize: 16 }}>{item.icon}</span>
                                {item.label}
                            </div>
                        </Link>
                    ))}
                </div>

                {/* AI concierge mini */}
                <div style={{ marginTop: 'auto', background: 'rgba(143,0,255,0.08)', borderRadius: 'var(--radius-md)', padding: '12px', border: '1px solid rgba(218,185,255,0.1)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                        <div className="pulse-dot" />
                        <span style={{ fontSize: '0.72rem', color: 'var(--primary)', fontWeight: 600 }}>AI Concierge</span>
                    </div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--on-surface-var)', lineHeight: 1.5 }}>Connecting context, skills, and availability in real-time.</p>
                </div>
            </aside>

            {/* ── Main content ── */}
            <main style={{ flex: 1, padding: '2.5rem 2rem', overflowY: 'auto' }}>
                {/* Search header */}
                <div style={{ marginBottom: '2rem' }}>
                    <h1 style={{ fontSize: '1.75rem', marginBottom: '1rem' }}>Who do you need to flow with today?</h1>
                    <div style={{ position: 'relative', maxWidth: '600px' }}>
                        <span className="material-icons" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--outline)', fontSize: '20px' }}>search</span>
                        <input
                            className="input"
                            style={{ paddingLeft: '44px', height: '50px' }}
                            placeholder="Search by skill, name, or domain…"
                            value={query}
                            onChange={e => setQuery(e.target.value)}
                        />
                    </div>
                </div>

                {/* Section header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <div>
                        <span className="section-label">TOP EXPERT MATCHES</span>
                        <p style={{ marginTop: '0.25rem', fontSize: '0.82rem' }}>Real-time matching based on global innovation trends and collaborative performance.</p>
                    </div>
                    <button className="btn-ghost" onClick={() => setShowWhy(!showWhy)} style={{ fontSize: '0.8rem' }}>
                        <span className="material-icons" style={{ fontSize: 16 }}>info</span>
                        Why Match Scoring?
                    </button>
                </div>

                {/* Why panel */}
                {showWhy && (
                    <div className="card animate-fadeInUp" style={{ marginBottom: '1.5rem', background: 'rgba(143,0,255,0.05)', border: '1px solid rgba(218,185,255,0.1)' }}>
                        <p style={{ fontSize: '0.875rem', marginBottom: '1rem' }}>Our AI analyzes over 400 data points to ensure your project's flow is never interrupted:</p>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                            {WHY_ITEMS.map(item => (
                                <div key={item} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span className="material-icons" style={{ color: 'var(--primary)', fontSize: '16px' }}>check_circle</span>
                                    <span style={{ fontSize: '0.82rem' }}>{item}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Expert grid */}
                {loading ? (
                    <div className="grid-auto stagger">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className="card skeleton-card" style={{ height: '240px' }} />
                        ))}
                    </div>
                ) : filtered.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--on-surface-var)' }}>
                        <span className="material-icons" style={{ fontSize: '3rem', display: 'block', marginBottom: '1rem', color: 'var(--outline)' }}>search_off</span>
                        <p>No experts found matching "<strong>{query}</strong>"</p>
                        <button className="btn-ghost" onClick={() => setQuery('')} style={{ marginTop: '1rem' }}>Clear search</button>
                    </div>
                ) : (
                    <div className="grid-auto stagger">
                        {filtered.map((expert, i) => {
                            const initials = expert.name?.split(' ').map(n => n[0]).join('') || '?';
                            return (
                                <Link key={expert.id || i} to={`/experts/${expert.id}`} style={{ textDecoration: 'none' }}>
                                    <div className="card animate-fadeInUp" style={{ cursor: 'pointer', height: '100%', display: 'flex', flexDirection: 'column' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                            <div className="avatar">{initials}</div>
                                            <div style={{ textAlign: 'right' }}>
                                                <div style={{ background: 'rgba(218,185,255,0.1)', color: 'var(--primary)', padding: '3px 10px', borderRadius: 'var(--radius-full)', fontSize: '0.75rem', fontWeight: 700 }}>{expert.match_score || 90}% match</div>
                                                {expert.impact && <div style={{ fontSize: '0.68rem', color: 'var(--on-surface-var)', marginTop: '4px' }}>{expert.impact}</div>}
                                            </div>
                                        </div>
                                        <h3 style={{ marginBottom: '0.25rem', fontSize: '1rem' }}>{expert.name}</h3>
                                        <p style={{ fontSize: '0.82rem', flex: 1, lineHeight: 1.5, marginBottom: '1rem' }}>{expert.bio}</p>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginBottom: '1rem' }}>
                                            {(expert.specialty || []).slice(0, 3).map(s => <span key={s} className="chip" style={{ fontSize: '0.68rem', padding: '3px 10px' }}>{s}</span>)}
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.85rem' }}>${expert.hourly_rate || 400}/hr</span>
                                            <span style={{ color: 'var(--primary)', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: 4 }}>
                                                View profile <span className="material-icons" style={{ fontSize: 14 }}>arrow_forward</span>
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </main>
        </div>
    );
}

