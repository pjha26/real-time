import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useExpertStore } from '../store/useStore';

const MOCK_EXPERTS = [
    { id: '1', name: 'Marcus Thorne', specialty: ['Product Strategy', 'Growth'], bio: 'Ex-Apple strategist specializing in fluid transactional experiences and high-growth ecosystems.', match_score: 97, hourly_rate: 450 },
    { id: '2', name: 'Elena Vance', specialty: ['UI/UX', 'Motion Systems'], bio: 'Senior UI Architect with focus on accessibility and motion systems. Creator of the Flux Framework.', match_score: 94, hourly_rate: 380 },
    { id: '3', name: 'David Chen', specialty: ['Cloud Infrastructure', 'AWS'], bio: 'Cloud Infrastructure expert. AWS/Azure specialist for scaling SaaS platforms to millions.', match_score: 91, hourly_rate: 420 },
];

const IMPACT_STATS = [
    { icon: 'bolt', label: 'Compatibility Scores', val: '98%', desc: 'Deep-level chemistry and technical overlap before the first meeting.' },
    { icon: 'verified', label: 'AI Skill Endorsements', val: '40+', desc: 'Dynamic verification through portfolio analysis and peer-review scanning.' },
    { icon: 'speed', label: 'Velocity Metrics', val: '84%', desc: 'Reduce time-to-hire. Our system automates vetting and delivers pre-aligned results.' },
];

const WORKSPACE_FEATURES = [
    { icon: 'dynamic_feed', title: 'Flow Prioritization', desc: 'AI-sorted tasks based on your peak productivity cycles.' },
    { icon: 'auto_stories', title: 'Automated Prep Summaries', desc: 'Instant briefings on stakeholders and project context.' },
    { icon: 'hub', title: 'Network Intelligence', desc: 'Live map of your active collaborations and connection health.' },
    { icon: 'psychology', title: 'AI Curator', desc: 'Proactive suggestions to keep your work sessions uninterrupted.' },
];

export default function LandingPage() {
    const { experts, fetchExperts } = useExpertStore();
    const [query, setQuery] = useState('');
    const [typed, setTyped] = useState('');
    const [displayExperts, setDisplayExperts] = useState(MOCK_EXPERTS);
    const [heroLoaded, setHeroLoaded] = useState(false);
    const navigate = useNavigate();

    const PLACEHOLDER = 'I need a technical architect who understands high-frequency trading and sustainable data centers.';

    // Typewriter effect for placeholder
    useEffect(() => {
        let i = 0;
        const interval = setInterval(() => {
            setTyped(PLACEHOLDER.slice(0, i));
            i++;
            if (i > PLACEHOLDER.length) clearInterval(interval);
        }, 28);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        fetchExperts().catch(() => { });
        const t = setTimeout(() => setHeroLoaded(true), 300);
        return () => clearTimeout(t);
    }, []);

    useEffect(() => {
        if (experts.length > 0) setDisplayExperts(experts);
    }, [experts]);

    const handleSearch = (e) => {
        e.preventDefault();
        if (query.trim()) navigate(`/explore?search=${encodeURIComponent(query)}`);
        else navigate('/explore');
    };

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg)', position: 'relative', overflow: 'hidden' }}>
            {/* Blobs */}
            <div className="blob blob-1" />
            <div className="blob blob-2" />
            <div className="blob" style={{ width: 300, height: 300, background: 'rgba(255,182,139,0.04)', top: '60%', left: '60%', animation: 'floatBlob 12s ease-in-out infinite' }} />

            {/* ── Navbar ── */}
            <nav className="topnav">
                <div className="topnav-logo">⚡ ExpertBook</div>
                <div className="topnav-links">
                    <Link to="/explore" className="topnav-link">Expert Network</Link>
                    <a href="#concierge" className="topnav-link">AI Concierge</a>
                    <Link to="/workspace" className="topnav-link">Workspace</Link>
                    <a href="#pricing" className="topnav-link">Pricing</a>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <Link to="/login" className="btn-ghost" style={{ textDecoration: 'none' }}>Sign in</Link>
                    <Link to="/register" className="btn-primary" style={{ textDecoration: 'none' }}>
                        <span className="material-icons" style={{ fontSize: 16 }}>rocket_launch</span>
                        Get started
                    </Link>
                </div>
            </nav>

            {/* ── HERO: The Intelligent Flow State ── */}
            <section style={{ paddingTop: '130px', paddingBottom: '100px', position: 'relative', zIndex: 1 }}>
                <div className="container">
                    <div style={{ maxWidth: '820px' }}>
                        {/* Eyebrow */}
                        <div className={`animate-fadeInUp`} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(143,0,255,0.12)', border: '1px solid rgba(218,185,255,0.15)', borderRadius: 'var(--radius-full)', padding: '6px 16px', marginBottom: '1.75rem' }}>
                            <div className="pulse-dot" />
                            <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--primary)', fontFamily: 'var(--font-body)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>AI Flow Intelligence Active</span>
                        </div>

                        <h1 className="animate-fadeInUp" style={{ animationDelay: '80ms', marginBottom: '1.5rem', fontSize: 'clamp(2.8rem, 5vw, 4rem)' }}>
                            The{' '}
                            <span style={{ background: 'linear-gradient(135deg, var(--primary-c), var(--primary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                                Intelligent
                            </span>{' '}
                            Flow State
                        </h1>

                        <p className="animate-fadeInUp" style={{ animationDelay: '160ms', fontSize: '1.15rem', maxWidth: '600px', marginBottom: '3rem', lineHeight: 1.7 }}>
                            Not a directory. Not a marketplace. A living intelligence that curates the exact expert your project needs — before you even know to ask.
                        </p>

                        {/* CTA row */}
                        <div className="animate-fadeInUp" style={{ animationDelay: '240ms', display: 'flex', gap: '1rem', marginBottom: '3.5rem', flexWrap: 'wrap' }}>
                            <Link to="/register" className="btn-primary" style={{ textDecoration: 'none', padding: '14px 32px', fontSize: '1rem' }}>
                                <span className="material-icons" style={{ fontSize: 20 }}>rocket_launch</span>
                                Enter your flow state
                            </Link>
                            <Link to="/explore" className="btn-secondary" style={{ textDecoration: 'none', padding: '14px 28px', fontSize: '1rem' }}>
                                Explore the network
                                <span className="material-icons" style={{ fontSize: 18 }}>arrow_forward</span>
                            </Link>
                        </div>

                        {/* Trust badges */}
                        <div className="animate-fadeInUp" style={{ animationDelay: '320ms', display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
                            {[['2,400+', 'Vetted Experts'], ['98.4%', 'Match Rate'], ['< 30s', 'Avg. Match Time'], ['84%', 'Faster Hiring']].map(([val, lbl]) => (
                                <div key={lbl}>
                                    <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.4rem', color: 'var(--primary)' }}>{val}</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--on-surface-var)', marginTop: '2px' }}>{lbl}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ── AI Concierge Section ── */}
            <section id="concierge" style={{ padding: '80px 0', background: 'var(--surface-low)', position: 'relative', zIndex: 1 }}>
                <div className="container">
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.1fr', gap: '4rem', alignItems: 'start' }}>
                        {/* Left */}
                        <div>
                            <span className="section-label">AI CONCIERGE — BEYOND SEARCH</span>
                            <h2 style={{ marginTop: '0.75rem', marginBottom: '1.25rem' }}>Describe your vision in natural language</h2>
                            <p style={{ marginBottom: '2rem' }}>Our neural engine deconstructs your intent, identifying the exact sub-skills and personality types required for success.</p>

                            {/* NLP Input demo */}
                            <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
                                <div style={{ background: 'var(--surface-lowest)', borderRadius: 'var(--radius-md)', padding: '16px 20px', border: '1.5px solid rgba(218,185,255,0.2)', minHeight: '80px', fontSize: '0.9rem', color: 'var(--on-surface-var)', lineHeight: 1.6, fontFamily: 'var(--font-body)', fontStyle: 'italic' }}>
                                    "{typed}<span style={{ display: 'inline-block', width: 2, height: '1em', background: 'var(--primary)', marginLeft: 2, animation: 'pulse 1s infinite', verticalAlign: 'middle' }} />"
                                </div>
                            </div>

                            {/* Extraction chips */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {[
                                    { icon: 'memory', label: 'Skill Extraction', val: 'Latent logic analysis mapping 14 key domains.' },
                                    { icon: 'people', label: 'Cultural Sync', val: 'Cognitive profile alignment with team values.' },
                                ].map(item => (
                                    <div key={item.label} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', padding: '12px 16px', background: 'var(--surface-c)', borderRadius: 'var(--radius-md)' }}>
                                        <span className="material-icons" style={{ color: 'var(--primary)', fontSize: '20px', flexShrink: 0 }}>{item.icon}</span>
                                        <div>
                                            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.9rem', marginBottom: '2px' }}>{item.label}</div>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--on-surface-var)' }}>{item.val}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Right — AI Expert card result */}
                        <div>
                            <div style={{ marginBottom: '1rem' }}>
                                <span style={{ fontSize: '0.75rem', color: 'var(--on-surface-var)' }}>AI Match Result</span>
                            </div>
                            <div className="card" style={{ border: '1px solid rgba(218,185,255,0.15)', background: 'var(--surface-ch)', position: 'relative', overflow: 'visible' }}>
                                {/* Glow ring */}
                                <div style={{ position: 'absolute', inset: -1, borderRadius: 'var(--radius-lg)', background: 'linear-gradient(135deg, rgba(143,0,255,0.3), transparent)', zIndex: -1, filter: 'blur(8px)' }} />

                                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
                                    <div className="avatar" style={{ width: 56, height: 56, fontSize: '1.2rem', flexShrink: 0 }}>AV</div>
                                    <div style={{ flex: 1 }}>
                                        <h3 style={{ marginBottom: '2px' }}>Dr. Aris Varma</h3>
                                        <p style={{ fontSize: '0.82rem', color: 'var(--on-surface-var)', margin: 0 }}>Principal Quant Architect</p>
                                    </div>
                                    <div style={{ background: 'linear-gradient(135deg, var(--primary-c), var(--secondary-c))', color: '#fff', padding: '6px 14px', borderRadius: 'var(--radius-full)', fontSize: '0.8rem', fontWeight: 800, fontFamily: 'var(--font-display)', flexShrink: 0 }}>
                                        98% Match
                                    </div>
                                </div>

                                <p style={{ fontSize: '0.875rem', lineHeight: 1.6, marginBottom: '1.25rem' }}>
                                    Aris specializes in low-latency infrastructure design with a recent focus on immersion cooling for high-density compute clusters.
                                </p>

                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '1.5rem' }}>
                                    {['High-Freq Trading', 'Low Latency Infra', 'Sustainable Data Centers', 'eBPF'].map(s => <span key={s} className="chip">{s}</span>)}
                                </div>

                                {/* Match flow SVG */}
                                <div style={{ marginBottom: '1.25rem' }}>
                                    <div style={{ fontSize: '0.72rem', color: 'var(--on-surface-var)', marginBottom: '8px' }}>MATCH FLOW ANALYSIS</div>
                                    <svg width="100%" height="40" viewBox="0 0 300 40">
                                        <defs>
                                            <linearGradient id="mfGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                                                <stop offset="0%" stopColor="#8f00ff" />
                                                <stop offset="100%" stopColor="#dab9ff" />
                                            </linearGradient>
                                        </defs>
                                        <path d="M 0 20 Q 75 5 150 20 Q 225 35 300 20" stroke="url(#mfGrad)" strokeWidth="2.5" fill="none" strokeDasharray="6,3">
                                            <animate attributeName="stroke-dashoffset" from="0" to="-36" dur="1.5s" repeatCount="indefinite" />
                                        </path>
                                        {[0, 60, 120, 180, 240, 300].map((x, i) => (
                                            <circle key={i} cx={x} cy={20} r="4" fill="#8f00ff" opacity="0.7" />
                                        ))}
                                    </svg>
                                </div>

                                <Link to="/experts/1" className="btn-primary" style={{ textDecoration: 'none', display: 'flex', justifyContent: 'center', width: '100%' }}>
                                    <span className="material-icons" style={{ fontSize: 18 }}>workspace_premium</span>
                                    Initialize Workspace
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Real-Time Impact ── */}
            <section style={{ padding: '80px 0', position: 'relative', zIndex: 1 }}>
                <div className="container">
                    <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
                        <span className="section-label">REAL-TIME IMPACT</span>
                        <h2 style={{ marginTop: '0.75rem' }}>Three pillars of fluid intelligence</h2>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }} className="stagger">
                        {IMPACT_STATS.map((stat, i) => (
                            <div key={stat.label} className="card animate-fadeInUp" style={{ textAlign: 'center', padding: '2.5rem 2rem' }}>
                                <div style={{ width: 56, height: 56, borderRadius: 'var(--radius-lg)', background: 'linear-gradient(135deg, rgba(143,0,255,0.2), rgba(94,40,153,0.2))', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem', overflow: 'hidden' }}>
                                    <span className="material-icons" style={{ color: 'var(--primary)', fontSize: '24px' }}>{stat.icon}</span>
                                </div>
                                <div className="stat-number" style={{ fontSize: '2.5rem', marginBottom: '0.25rem' }}>{stat.val}</div>
                                <h3 style={{ fontSize: '1rem', marginBottom: '0.75rem' }}>{stat.label}</h3>
                                <p style={{ fontSize: '0.85rem', lineHeight: 1.6 }}>{stat.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Expert Cards Preview ── */}
            <section style={{ padding: '0 0 80px', position: 'relative', zIndex: 1 }}>
                <div className="container">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem' }}>
                        <div>
                            <span className="section-label">TOP MATCHES</span>
                            <h2 style={{ marginTop: '0.5rem' }}>Your curated flow network</h2>
                        </div>
                        <Link to="/explore" className="btn-ghost" style={{ textDecoration: 'none' }}>
                            View all <span className="material-icons" style={{ fontSize: 16 }}>arrow_forward</span>
                        </Link>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1.2fr', gap: '1.5rem' }} className="stagger">
                        {displayExperts.slice(0, 3).map((expert, i) => (
                            <ExpertCard key={expert.id || i} expert={expert} featured={i === 0} />
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Workspace Features ── */}
            <section style={{ padding: '80px 0', background: 'var(--surface-low)', position: 'relative', zIndex: 1 }}>
                <div className="container">
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '5rem', alignItems: 'center' }}>
                        <div>
                            <span className="section-label">A WORKSPACE THAT THINKS WITH YOU</span>
                            <h2 style={{ marginTop: '0.75rem', marginBottom: '1.25rem' }}>The ExpertBook Dashboard</h2>
                            <p style={{ marginBottom: '2rem' }}>It's not just a list of tasks. It's an intelligent workspace that prioritizes your cognitive energy and keeps your flow state uninterrupted.</p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {WORKSPACE_FEATURES.map(f => (
                                    <div key={f.title} style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start' }}>
                                        <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-md)', background: 'rgba(143,0,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' }}>
                                            <span className="material-icons" style={{ color: 'var(--primary)', fontSize: '20px', fontFamily: "'Material Icons', sans-serif" }}>{f.icon}</span>
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: '4px', fontSize: '0.95rem' }}>{f.title}</div>
                                            <div style={{ fontSize: '0.875rem', color: 'var(--on-surface-var)', lineHeight: 1.5 }}>{f.desc}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        {/* Today's Flow preview */}
                        <div className="card" style={{ border: '1px solid rgba(218,185,255,0.1)', padding: '2rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--on-surface-var)' }}>Oct 24, 2024</div>
                                    <h3 style={{ fontSize: '1rem', marginTop: '2px' }}>Today's Flow</h3>
                                </div>
                                <div style={{ background: 'rgba(218,185,255,0.08)', padding: '4px 12px', borderRadius: 'var(--radius-full)', fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 600 }}>3 High-Impact Alignments</div>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {[
                                    { title: 'Nexus Project: Deep Tech Audit', conf: '99%', priority: 'Critical', desc: 'The client is scaling their Kubernetes cluster to 10k nodes. They lack expertise in eBPF observability…' },
                                    { title: 'Strategy Alignment: FinTech UX', conf: '94%', priority: 'High', desc: null },
                                    { title: 'Architecture Review: CloudOS', conf: '91%', priority: 'Medium', desc: null },
                                ].map((item, i) => (
                                    <div key={i} style={{ padding: '12px 14px', background: 'var(--surface-lowest)', borderRadius: 'var(--radius-md)' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: item.desc ? '8px' : 0 }}>
                                            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '0.875rem' }}>{item.title}</div>
                                            <div style={{ display: 'flex', gap: '6px', flexShrink: 0, marginLeft: '8px' }}>
                                                <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: 'var(--radius-full)', background: 'rgba(218,185,255,0.1)', color: 'var(--primary)', fontWeight: 700 }}>{item.conf}</span>
                                                <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: 'var(--radius-full)', background: item.priority === 'Critical' ? 'rgba(255,182,139,0.1)' : 'rgba(218,185,255,0.06)', color: item.priority === 'Critical' ? 'var(--tertiary)' : 'var(--on-surface-var)', fontWeight: 600 }}>{item.priority}</span>
                                            </div>
                                        </div>
                                        {item.desc && <div style={{ fontSize: '0.78rem', color: 'var(--on-surface-var)', lineHeight: 1.5, fontStyle: 'italic' }}>"{item.desc}"</div>}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Final CTA ── */}
            <section style={{ padding: '100px 0', position: 'relative', zIndex: 1 }}>
                <div className="container" style={{ textAlign: 'center' }}>
                    <div style={{ maxWidth: '640px', margin: '0 auto' }}>
                        <span className="section-label">BEGIN YOUR FLOW STATE</span>
                        <h2 style={{ marginTop: '0.75rem', marginBottom: '1.25rem', fontSize: 'clamp(2rem, 4vw, 2.8rem)' }}>
                            Your next expert is already waiting in the network.
                        </h2>
                        <p style={{ marginBottom: '3rem', fontSize: '1.05rem' }}>Join 12,000+ collaborations already happening at the speed of thought.</p>
                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                            <Link to="/register" className="btn-primary" style={{ textDecoration: 'none', padding: '16px 40px', fontSize: '1.05rem' }}>
                                <span className="material-icons" style={{ fontSize: 20 }}>rocket_launch</span>
                                Start for free
                            </Link>
                            <Link to="/explore" className="btn-secondary" style={{ textDecoration: 'none', padding: '16px 32px', fontSize: '1.05rem' }}>Browse experts</Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Footer ── */}
            <footer style={{ borderTop: '1px solid rgba(218,185,255,0.08)', padding: '3rem 0' }}>
                <div className="container">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '2rem' }}>
                        <div>
                            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--primary)', fontSize: '1.1rem', marginBottom: '0.5rem' }}>⚡ ExpertBook</div>
                            <p style={{ fontSize: '0.82rem', maxWidth: '240px' }}>Powered by fluid intelligence. © 2024 ExpertBook.</p>
                        </div>
                        <div style={{ display: 'flex', gap: '3rem', flexWrap: 'wrap' }}>
                            {[['Product', [['Expert Network', '/explore'], ['AI Concierge', '#concierge'], ['Workspace', '/workspace']]], ['Company', [['Privacy Policy', '#'], ['Terms of Service', '#'], ['Contact Support', '#']]], ['Experts', [['Expert Portal', '/register'], ['Client FAQ', '#']]]].map(([section, links]) => (
                                <div key={section}>
                                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--on-surface)', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'var(--font-body)' }}>{section}</div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                        {links.map(([label, href]) => (
                                            <a key={label} href={href} style={{ fontSize: '0.82rem', color: 'var(--on-surface-var)', textDecoration: 'none', transition: 'color var(--transition)' }}
                                                onMouseEnter={e => e.target.style.color = 'var(--primary)'}
                                                onMouseLeave={e => e.target.style.color = 'var(--on-surface-var)'}
                                            >{label}</a>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}

function ExpertCard({ expert, featured }) {
    const initials = expert.name?.split(' ').map(n => n[0]).join('') || '?';
    return (
        <Link to={`/experts/${expert.id}`} style={{ textDecoration: 'none' }}>
            <div className="card animate-fadeInUp" style={{ height: '100%', cursor: 'pointer', padding: featured ? '2rem' : '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
                    <div className="avatar" style={{ width: featured ? 52 : 44, height: featured ? 52 : 44, fontSize: featured ? '1.1rem' : '0.9rem' }}>{initials}</div>
                    <div style={{ background: 'rgba(218,185,255,0.1)', color: 'var(--primary)', padding: '4px 10px', borderRadius: 'var(--radius-full)', fontSize: '0.75rem', fontWeight: 700, fontFamily: 'var(--font-display)' }}>
                        {expert.match_score || 95}% match
                    </div>
                </div>
                <h3 style={{ marginBottom: '0.25rem', fontSize: featured ? '1.25rem' : '1rem' }}>{expert.name}</h3>
                <p style={{ fontSize: '0.85rem', marginBottom: '1rem', lineHeight: 1.5 }}>{expert.bio}</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '1.25rem' }}>
                    {(expert.specialty || []).slice(0, 3).map(s => <span key={s} className="chip">{s}</span>)}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.85rem', fontFamily: 'var(--font-display)', fontWeight: 700 }}>${expert.hourly_rate || 400}/hr</span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '4px' }}>View profile <span className="material-icons" style={{ fontSize: 14 }}>arrow_forward</span></span>
                </div>
            </div>
        </Link>
    );
}

