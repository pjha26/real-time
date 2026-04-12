import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
    Brain, Sparkles, Search, ArrowRight, Loader2, Star, DollarSign, Award
} from 'lucide-react';
import Layout from '../components/Layout';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function AIMatchPage() {
    const [description, setDescription] = useState('');
    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);

    const handleMatch = async () => {
        if (!description.trim()) return;
        setLoading(true);
        setSearched(false);
        try {
            const res = await fetch(`${API}/api/ai/match`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ projectDescription: description }),
            });
            const data = await res.json();
            setMatches(data.matches || []);
        } catch (err) {
            console.error('AI Match error:', err);
            setMatches([]);
        } finally {
            setLoading(false);
            setSearched(true);
        }
    };

    return (
        <Layout>
            <div style={{ position: 'relative', overflow: 'hidden', minHeight: '100vh' }}>
                <div className="blob blob-1" style={{ width: '600px', height: '600px', top: '-200px', right: '-100px', opacity: 0.5 }} />

                <div style={{ position: 'relative', zIndex: 1 }}>
                    {/* Header */}
                    <div style={{ padding: '2.5rem 2rem 1.5rem', borderBottom: '1px solid var(--surface-ch)' }}>
                        <span className="section-label">AI-POWERED MATCHING</span>
                        <h1 style={{ marginTop: '0.5rem', fontSize: '2rem', color: 'var(--on-surface)' }}>
                            Find Your <span style={{ color: 'var(--primary)' }}>Perfect Expert</span>
                        </h1>
                        <p style={{ color: 'var(--on-surface-var)', fontFamily: 'var(--font-mono)', marginTop: '0.5rem' }}>
                            Describe your project and our AI Curator will match you with the best experts.
                        </p>
                    </div>

                    {/* Input Section */}
                    <div style={{ padding: '2rem', maxWidth: '900px' }}>
                        <div className="card" style={{ background: 'var(--surface-lowest)', border: '1px solid var(--surface-ch)', borderRadius: 'var(--radius-xl)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
                                <Brain size={20} color="var(--primary)" />
                                <span style={{ fontFamily: 'var(--font-body)', fontWeight: 700, color: 'var(--on-surface)' }}>Project Description</span>
                            </div>
                            <textarea
                                className="input"
                                rows={5}
                                placeholder="Describe your project in detail. For example: 'I need help building a scalable SaaS dashboard with real-time analytics, user management, and payment integration. Tech stack: React, Node.js, PostgreSQL...'"
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                                style={{ resize: 'vertical', borderRadius: 'var(--radius-lg)', background: 'var(--surface-low)', border: '1px solid var(--surface-ch)', fontFamily: 'var(--font-body)', fontSize: '0.9rem', lineHeight: 1.6 }}
                            />
                            <button
                                className="btn-primary"
                                onClick={handleMatch}
                                disabled={loading || !description.trim()}
                                style={{ marginTop: '1rem', width: '100%', padding: '14px', fontSize: '1rem', justifyContent: 'center', gap: '10px', opacity: loading ? 0.7 : 1 }}
                            >
                                {loading ? (
                                    <><Loader2 size={20} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} /> Analyzing with Gemini AI...</>
                                ) : (
                                    <><Sparkles size={20} /> Find My Experts</>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Results */}
                    {searched && (
                        <div style={{ padding: '0 2rem 2rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.5rem' }}>
                                <Search size={18} color="var(--primary)" />
                                <span className="section-label" style={{ margin: 0 }}>
                                    {matches.length} EXPERTS RANKED
                                </span>
                            </div>

                            {matches.length === 0 ? (
                                <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--on-surface-var)' }}>
                                    <p>No matches found. Try a more detailed description.</p>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    {matches.map((expert, i) => (
                                        <div key={expert.id || i} className="card animate-fadeInUp" style={{
                                            background: 'var(--surface-lowest)', border: '1px solid var(--surface-ch)',
                                            borderRadius: 'var(--radius-xl)', display: 'flex', gap: '1.5rem', alignItems: 'flex-start',
                                            animationDelay: `${i * 0.1}s`,
                                        }}>
                                            {/* Rank + Score */}
                                            <div style={{ flexShrink: 0, textAlign: 'center', minWidth: '60px' }}>
                                                <div style={{
                                                    width: 56, height: 56, borderRadius: '50%',
                                                    background: i === 0 ? 'linear-gradient(135deg, #8F00FF, #B366FF)' : 'var(--surface-low)',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: '1.1rem',
                                                    color: i === 0 ? '#fff' : 'var(--primary)',
                                                    border: i === 0 ? 'none' : '2px solid var(--surface-ch)',
                                                }}>
                                                    {expert.score}%
                                                </div>
                                                <div style={{ fontSize: '0.68rem', color: 'var(--on-surface-var)', marginTop: '6px', fontWeight: 600 }}>
                                                    #{i + 1} Match
                                                </div>
                                            </div>

                                            {/* Info */}
                                            <div style={{ flex: 1 }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                                    <h3 style={{ fontSize: '1.1rem', color: 'var(--on-surface)', fontFamily: 'var(--font-body)', fontWeight: 700 }}>
                                                        {expert.name}
                                                    </h3>
                                                    {i === 0 && (
                                                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '2px 10px', borderRadius: 'var(--radius-full)', background: 'rgba(143,0,255,0.15)', color: 'var(--primary)', fontSize: '0.7rem', fontWeight: 700 }}>
                                                            <Award size={12} /> Best Match
                                                        </span>
                                                    )}
                                                </div>
                                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginBottom: '10px' }}>
                                                    {(expert.specialty || []).map(s => (
                                                        <span key={s} className="chip" style={{ fontSize: '0.68rem', padding: '3px 10px' }}>{s}</span>
                                                    ))}
                                                </div>
                                                <p style={{ fontSize: '0.85rem', color: 'var(--on-surface-var)', lineHeight: 1.6, marginBottom: '12px', fontStyle: 'italic', borderLeft: '3px solid var(--primary)', paddingLeft: '12px' }}>
                                                    "{expert.justification}"
                                                </p>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                                                    {expert.hourly_rate && (
                                                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--on-surface)' }}>
                                                            <DollarSign size={14} color="var(--primary)" /> ${expert.hourly_rate}/hr
                                                        </span>
                                                    )}
                                                    <Link to={`/book/${expert.id}`} className="btn-primary" style={{ fontSize: '0.82rem', padding: '8px 20px', gap: '6px', textDecoration: 'none' }}>
                                                        Book Now <ArrowRight size={14} />
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
}
