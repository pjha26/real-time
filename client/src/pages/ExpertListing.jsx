import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useExpertStore } from '../store/useStore';
import Layout from '../components/Layout';

const MOCK_EXPERTS = [
    { id: '1', name: 'Marcus Thorne', specialty: ['Product Strategy', 'Growth', 'FinTech'], bio: 'Ex-Apple strategist specializing in fluid transactional experiences and high-growth ecosystems.', match_score: 97, hourly_rate: 450 },
    { id: '2', name: 'Elena Vance', specialty: ['UI/UX', 'Motion Systems', 'Accessibility'], bio: 'Senior UI Architect with focus on accessibility and motion systems. Creator of the Flux Framework.', match_score: 94, hourly_rate: 380 },
    { id: '3', name: 'David Chen', specialty: ['Cloud Infrastructure', 'AWS', 'Azure'], bio: 'Cloud Infrastructure expert. AWS/Azure specialist for scaling SaaS platforms to millions.', match_score: 91, hourly_rate: 420 },
    { id: '4', name: 'Zoe Nakamura', specialty: ['AI/ML', 'Python', 'Data Science'], bio: 'Lead AI researcher. Deployed ML pipelines for 3 Fortune 500 companies. Ethics-first approach.', match_score: 89, hourly_rate: 500 },
    { id: '5', name: 'Alex Rivera', specialty: ['Blockchain', 'DeFi', 'Smart Contracts'], bio: 'Web3 pioneer with 6 years building decentralized finance infrastructure at scale.', match_score: 87, hourly_rate: 460 },
    { id: '6', name: 'Sarah Kim', specialty: ['Growth Marketing', 'SEO', 'Analytics'], bio: 'Growth architect who scaled 4 SaaS companies from 0 to $10M ARR. Data-obsessed.', match_score: 85, hourly_rate: 340 },
];

const FILTERS = ['All', 'Product Strategy', 'UI/UX', 'Cloud Infrastructure', 'AI/ML', 'Blockchain', 'Growth Marketing'];

export default function ExpertListing() {
    const { experts, fetchExperts, loading } = useExpertStore();
    const [activeFilter, setActiveFilter] = useState('All');
    const [search, setSearch] = useState('');
    const [displayExperts, setDisplayExperts] = useState(MOCK_EXPERTS);
    const [searchParams] = useSearchParams();

    useEffect(() => {
        const q = searchParams.get('search');
        if (q) setSearch(q);
        fetchExperts().catch(() => { });
    }, []);

    useEffect(() => {
        if (experts.length > 0) setDisplayExperts(experts);
    }, [experts]);

    const filtered = displayExperts.filter(e => {
        const matchFilter = activeFilter === 'All' || e.specialty?.some(s => s.toLowerCase().includes(activeFilter.toLowerCase()));
        const matchSearch = !search || e.name?.toLowerCase().includes(search.toLowerCase()) || e.bio?.toLowerCase().includes(search.toLowerCase()) || e.specialty?.some(s => s.toLowerCase().includes(search.toLowerCase()));
        return matchFilter && matchSearch;
    });

    return (
        <Layout>
            <div style={{ position: 'relative', overflow: 'hidden' }}>
                <div className="blob blob-1" style={{ width: '400px', height: '400px', top: '-100px' }} />

                {/* Header */}
                <div style={{ padding: '2.5rem 2rem 0', position: 'relative', zIndex: 1 }}>
                    <span className="section-label">EXPLORE</span>
                    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: '0.5rem', marginBottom: '2rem' }}>
                        <div>
                            <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Discover Your Expert</h1>
                            <p style={{ fontSize: '0.9rem' }}>AI-curated matches based on your project's unique fingerprint.</p>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(218,185,255,0.08)', padding: '8px 16px', borderRadius: 'var(--radius-full)' }}>
                            <div className="pulse-dot" />
                            <span style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600, fontFamily: 'var(--font-display)' }}>98.4% Match Rate</span>
                        </div>
                    </div>

                    {/* Search */}
                    <div style={{ position: 'relative', marginBottom: '1.5rem', maxWidth: '500px' }}>
                        <span className="material-icons" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--outline)', fontSize: '20px' }}>search</span>
                        <input
                            className="input"
                            placeholder="Search experts, skills, domains…"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            style={{ paddingLeft: '48px' }}
                        />
                    </div>

                    {/* Filter chips */}
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '2rem' }}>
                        {FILTERS.map(f => (
                            <button
                                key={f}
                                onClick={() => setActiveFilter(f)}
                                style={{
                                    padding: '6px 16px', borderRadius: 'var(--radius-sm)', border: 'none', cursor: 'pointer',
                                    fontFamily: 'var(--font-body)', fontSize: '0.8rem', fontWeight: 600, letterSpacing: '0.04em',
                                    transition: 'all var(--transition)',
                                    background: activeFilter === f ? 'linear-gradient(135deg, var(--primary-c), var(--secondary-c))' : 'var(--surface-ch)',
                                    color: activeFilter === f ? '#fff' : 'var(--on-surface-var)',
                                }}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Grid */}
                <div style={{ padding: '0 2rem 3rem', position: 'relative', zIndex: 1 }}>
                    {loading ? (
                        <div className="grid-auto stagger">
                            {Array.from({ length: 6 }).map((_, i) => <ExpertCardSkeleton key={i} />)}
                        </div>
                    ) : (
                        <>
                            <p style={{ fontSize: '0.85rem', color: 'var(--outline)', marginBottom: '1.5rem' }}>
                                Showing <strong style={{ color: 'var(--primary)' }}>{filtered.length}</strong> experts
                            </p>
                            <div className="grid-auto stagger">
                                {filtered.map((expert, i) => (
                                    <ExpertCard key={expert.id || i} expert={expert} />
                                ))}
                            </div>
                            {filtered.length === 0 && (
                                <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--on-surface-var)' }}>
                                    <span className="material-icons" style={{ fontSize: '3rem', marginBottom: '1rem', display: 'block', color: 'var(--outline)' }}>search_off</span>
                                    <p>No experts match your search. Try different filters.</p>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </Layout>
    );
}

function ExpertCardSkeleton() {
    return (
        <div className="card skeleton-card" style={{ height: '260px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div className="skeleton skeleton-avatar" style={{ width: 48, height: 48 }} />
                <div className="skeleton skeleton-text" style={{ width: 64 }} />
            </div>
            <div className="skeleton skeleton-title" style={{ width: '60%' }} />
            <div className="skeleton skeleton-text" style={{ width: '100%' }} />
            <div className="skeleton skeleton-text" style={{ width: '80%' }} />
            <div style={{ display: 'flex', gap: '8px' }}>
                <div className="skeleton" style={{ height: 22, width: 70, borderRadius: 'var(--radius-sm)' }} />
                <div className="skeleton" style={{ height: 22, width: 90, borderRadius: 'var(--radius-sm)' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'auto' }}>
                <div className="skeleton skeleton-text" style={{ width: 80 }} />
                <div className="skeleton" style={{ height: 32, width: 100, borderRadius: 'var(--radius-full)' }} />
            </div>
        </div>
    );
}

function ExpertCard({ expert }) {
    const initials = expert.name?.split(' ').map(n => n[0]).join('') || '?';
    return (
        <Link to={`/experts/${expert.id}`} style={{ textDecoration: 'none' }}>
            <div className="card animate-fadeInUp" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                    <div className="avatar" style={{ width: 48, height: 48, fontSize: '1rem' }}>{initials}</div>
                    <div style={{ background: 'rgba(218,185,255,0.1)', color: 'var(--primary)', padding: '4px 10px', borderRadius: 'var(--radius-full)', fontSize: '0.75rem', fontWeight: 700, fontFamily: 'var(--font-display)', alignSelf: 'flex-start' }}>
                        {expert.match_score || 90}%
                    </div>
                </div>
                <h3 style={{ marginBottom: '0.25rem' }}>{expert.name}</h3>
                <p style={{ fontSize: '0.85rem', marginBottom: '1rem', flex: 1, lineHeight: 1.5 }}>{expert.bio}</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '1.25rem' }}>
                    {(expert.specialty || []).slice(0, 3).map(s => <span key={s} className="chip">{s}</span>)}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.9rem', fontFamily: 'var(--font-display)', fontWeight: 700 }}>${expert.hourly_rate || 400}/hr</span>
                    <button className="btn-primary" style={{ padding: '8px 16px', fontSize: '0.8rem' }}>
                        View Profile
                    </button>
                </div>
            </div>
        </Link>
    );
}
