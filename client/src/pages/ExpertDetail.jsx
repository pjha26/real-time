import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useExpertStore } from '../store/useStore';
import Layout from '../components/Layout';

const MOCK = {
    '1': { id: '1', name: 'Marcus Thorne', specialty: ['Product Strategy', 'Growth', 'FinTech'], bio: 'Ex-Apple strategist specializing in fluid transactional experiences and high-growth ecosystems. Former Head of Product at two unicorn startups.', match_score: 97, hourly_rate: 450, retention: 96, impact: 'Top 2%', velocity: '+110%', case_studies: ['Zenith Growth Platform', 'NovaPay UX Overhaul', 'Global Sync Engine'] },
    '2': { id: '2', name: 'Elena Vance', specialty: ['UI/UX', 'Motion Systems', 'Accessibility'], bio: 'Senior UI Architect with focus on accessibility and motion systems. Creator of the Flux Framework, adopted by 12 enterprise teams.', match_score: 94, hourly_rate: 380, retention: 94, impact: 'Top 1%', velocity: '+120%', case_studies: ['Aether Wallet Core', 'CloudOS Interface', 'Global Sync Engine'] },
    '3': { id: '3', name: 'David Chen', specialty: ['Cloud Infrastructure', 'AWS', 'Azure'], bio: 'Cloud Infrastructure expert. AWS/Azure specialist for scaling SaaS platforms to millions of concurrent users. 8 years in distributed systems.', match_score: 91, hourly_rate: 420, retention: 91, impact: 'Top 3%', velocity: '+90%', case_studies: ['CloudOS Migration', 'DataStream v3', 'EdgeNet Deployment'] },
    '4': { id: '4', name: 'Zoe Nakamura', specialty: ['AI/ML', 'Python', 'Data Science'], bio: 'Lead AI researcher. Deployed ML pipelines for 3 Fortune 500 companies. Ethics-first approach to model governance.', match_score: 89, hourly_rate: 500, retention: 92, impact: 'Top 1%', velocity: '+140%', case_studies: ['Momentum AI Engine', 'PredictIQ System', 'Ethical ML Framework'] },
    '5': { id: '5', name: 'Alex Rivera', specialty: ['Blockchain', 'DeFi', 'Smart Contracts'], bio: 'Web3 pioneer with 6 years building decentralized finance infrastructure at scale. Audited 40+ smart contracts.', match_score: 87, hourly_rate: 460, retention: 88, impact: 'Top 4%', velocity: '+95%', case_studies: ['DeFi Liquidity Protocol', 'NFT Marketplace Core', 'DAO Governance Tools'] },
    '6': { id: '6', name: 'Sarah Kim', specialty: ['Growth Marketing', 'SEO', 'Analytics'], bio: 'Growth architect who scaled 4 SaaS companies from 0 to $10M ARR. Data-obsessed, ROI-driven.', match_score: 85, hourly_rate: 340, retention: 90, impact: 'Top 5%', velocity: '+80%', case_studies: ['SaaS Launch Sprint', 'SEO Architecture v2', 'Funnel Optimization Suite'] },
};

export default function ExpertDetail() {
    const { id } = useParams();
    const { expert, fetchExpert, loading } = useExpertStore();

    useEffect(() => { if (id) fetchExpert(id).catch(() => { }); }, [id]);

    const data = expert || MOCK[id] || MOCK['2'];
    const initials = data.name?.split(' ').map(n => n[0]).join('') || '?';

    if (loading) {
        return (
            <Layout>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
                    <div className="spinner" />
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div style={{ position: 'relative', overflow: 'hidden', minHeight: '100vh' }}>
                <div className="blob blob-1" style={{ width: '500px', height: '500px', top: '-150px' }} />

                {/* Hero — asymmetric 60/40 */}
                <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem', padding: '2.5rem 2rem', alignItems: 'start', position: 'relative', zIndex: 1 }}>

                    {/* Left — Expert profile */}
                    <div>
                        <span className="section-label" style={{ marginBottom: '1rem', display: 'block' }}>EXPERT LIVE PORTFOLIO</span>

                        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', marginBottom: '2rem' }}>
                            <div className="avatar" style={{ width: 80, height: 80, fontSize: '1.8rem', flexShrink: 0 }}>{initials}</div>
                            <div>
                                <h1 style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>{data.name}</h1>
                                <p style={{ fontSize: '0.9rem', color: 'var(--on-surface-var)', marginBottom: '0.75rem' }}>
                                    {data.specialty?.[0]} · {data.specialty?.[1]}
                                </p>
                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                    <div className="pulse-dot" />
                                    <span style={{ fontSize: '0.8rem', color: '#4ade80' }}>Available today</span>
                                    <span style={{ color: 'var(--outline-var)', margin: '0 4px' }}>·</span>
                                    <span style={{ fontSize: '0.8rem', color: 'var(--on-surface-var)', fontFamily: 'var(--font-display)', fontWeight: 700 }}>${data.hourly_rate}/hr</span>
                                </div>
                            </div>
                        </div>

                        <p style={{ fontSize: '1rem', lineHeight: 1.7, marginBottom: '2rem', color: 'var(--on-surface-var)' }}>{data.bio}</p>

                        {/* Specialties */}
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '2rem' }}>
                            {(data.specialty || []).map(s => <span key={s} className="chip">{s}</span>)}
                        </div>

                        {/* AI Skill Insight */}
                        <div className="card" style={{ background: 'rgba(143,0,255,0.06)', marginBottom: '2rem', border: '1px solid rgba(218,185,255,0.1)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
                                <span className="material-icons" style={{ color: 'var(--primary)', fontSize: '20px' }}>psychology</span>
                                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.9rem' }}>AI Skill Insight</span>
                            </div>
                            <p style={{ fontSize: '0.875rem', lineHeight: 1.6, marginBottom: '1.25rem' }}>
                                Peer analysis indicates {data.name?.split(' ')[0]} excels in Abstract Systems Thinking. Recent contributions resulted in a 40% reduction in interaction latency across 12 verified projects.
                            </p>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                                {[
                                    { label: 'Retention', value: `${data.retention || 94}%` },
                                    { label: 'Impact', value: data.impact || 'Top 1%' },
                                    { label: 'Velocity', value: data.velocity || '+120%' },
                                ].map(stat => (
                                    <div key={stat.label} style={{ textAlign: 'center' }}>
                                        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.5rem', color: 'var(--primary)' }}>{stat.value}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--on-surface-var)', marginTop: '2px' }}>{stat.label}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Case Studies */}
                        <div>
                            <span className="section-label" style={{ marginBottom: '1rem', display: 'block' }}>SELECTED CASE STUDIES</span>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {(data.case_studies || ['Project Alpha', 'Interface Redesign', 'Scaling Engine']).map((study, i) => (
                                    <div key={study} className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.25rem' }}>
                                        <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', background: 'linear-gradient(135deg, var(--primary-c), var(--secondary-c))', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                            <span className="material-icons" style={{ fontSize: 18, color: '#fff' }}>folder_open</span>
                                        </div>
                                        <div>
                                            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '0.9rem' }}>{study}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--on-surface-var)' }}>Reimagining through a lens of extreme simplicity.</div>
                                        </div>
                                        <span className="material-icons" style={{ marginLeft: 'auto', color: 'var(--outline)', fontSize: 18 }}>arrow_forward</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right — Sidebar actions */}
                    <div style={{ position: 'sticky', top: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {/* Match score */}
                        <div className="card" style={{ textAlign: 'center', background: 'linear-gradient(135deg, rgba(143,0,255,0.1), rgba(94,40,153,0.1))', border: '1px solid rgba(218,185,255,0.15)' }}>
                            <span className="section-label">COMPATIBILITY SCORE</span>
                            <div style={{ fontFamily: 'var(--font-display)', fontSize: '4rem', fontWeight: 800, color: 'var(--primary)', lineHeight: 1, margin: '0.75rem 0' }}>
                                {data.match_score || 94}%
                            </div>
                            <p style={{ fontSize: '0.8rem', color: 'var(--on-surface-var)', lineHeight: 1.5 }}>
                                "{data.name?.split(' ')[0]}'s expertise perfectly bridges your project's technical gap."
                            </p>
                        </div>

                        {/* Live Availability */}
                        <div className="card">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.9rem' }}>Live Availability</span>
                                <div className="pulse-dot" />
                            </div>
                            <div style={{ background: 'var(--surface-lowest)', borderRadius: 'var(--radius-md)', padding: '1rem', marginBottom: '1rem', textAlign: 'center' }}>
                                <span className="material-icons" style={{ color: 'var(--primary)', fontSize: '2rem', display: 'block' }}>schedule</span>
                                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--on-surface)', marginTop: '4px' }}>Next Slot: Today, 3:00 PM</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--on-surface-var)', marginTop: '4px' }}>60-min session · ${data.hourly_rate}</div>
                            </div>
                            <Link to={`/book/${data.id}`} className="btn-primary" style={{ display: 'flex', justifyContent: 'center', textDecoration: 'none', width: '100%' }}>
                                <span className="material-icons" style={{ fontSize: 18 }}>rocket_launch</span>
                                Initialize Workspace
                            </Link>
                        </div>

                        {/* Project velocity */}
                        <div className="card" style={{ padding: '1.25rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.5rem' }}>
                                <span className="material-icons" style={{ color: 'var(--tertiary)', fontSize: '20px' }}>trending_up</span>
                                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--on-surface-var)' }}>Project Velocity Impact</span>
                            </div>
                            <div style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', fontWeight: 800, color: 'var(--tertiary)' }}>{data.velocity || '+120%'}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--on-surface-var)' }}>Efficiency boost in sprint delivery</div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
