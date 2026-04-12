import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    BarChart3, TrendingUp, Users, Calendar, DollarSign, Star, Clock,
    ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import {
    LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import Layout from '../components/Layout';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const COLORS = ['#f59e0b', '#8F00FF', '#4ade80', '#ef4444'];

export default function AnalyticsDashboard() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`${API}/api/analytics/overview`)
            .then(r => r.json())
            .then(d => { setData(d); setLoading(false); })
            .catch(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <Layout>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
                    <div className="spinner" style={{ width: 40, height: 40 }} />
                </div>
            </Layout>
        );
    }

    const kpis = data?.kpis || {};
    const trends = data?.trends || [];
    const peakHours = data?.peakHours || [];
    const statusDist = data?.statusDist || [];
    const revenue = data?.revenue || [];

    const kpiCards = [
        { label: 'Total Bookings', value: kpis.totalBookings || 47, icon: Calendar, change: '+12%', up: true, color: '#8F00FF' },
        { label: 'Total Users', value: kpis.totalUsers || 156, icon: Users, change: '+8%', up: true, color: '#4ade80' },
        { label: 'Revenue', value: kpis.revenue || '$18,400', icon: DollarSign, change: '+23%', up: true, color: '#f59e0b' },
        { label: 'Avg Rating', value: kpis.avgRating || 4.8, icon: Star, change: '+0.2', up: true, color: '#a78bfa' },
    ];

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload?.length) {
            return (
                <div style={{ background: 'var(--surface-lowest)', border: '1px solid var(--surface-ch)', borderRadius: 'var(--radius-md)', padding: '10px 14px', fontSize: '0.8rem' }}>
                    <p style={{ color: 'var(--on-surface)', fontWeight: 600, marginBottom: '4px' }}>{label}</p>
                    {payload.map((p, i) => (
                        <p key={i} style={{ color: p.color || 'var(--primary)', fontSize: '0.78rem' }}>{p.name}: {p.value}</p>
                    ))}
                </div>
            );
        }
        return null;
    };

    return (
        <Layout>
            <div style={{ position: 'relative', overflow: 'hidden', minHeight: '100vh' }}>
                <div className="blob blob-1" style={{ width: '500px', height: '500px', top: '-150px', right: '-50px', opacity: 0.5 }} />

                <div style={{ position: 'relative', zIndex: 1 }}>
                    {/* Header */}
                    <div style={{ padding: '2.5rem 2rem 1.5rem', borderBottom: '1px solid var(--surface-ch)' }}>
                        <span className="section-label">ANALYTICS</span>
                        <h1 style={{ marginTop: '0.5rem', fontSize: '2rem', color: 'var(--on-surface)' }}>
                            Platform <span style={{ color: 'var(--primary)' }}>Intelligence</span>
                        </h1>
                        <p style={{ color: 'var(--on-surface-var)', fontFamily: 'var(--font-mono)', marginTop: '0.5rem' }}>
                            Real-time metrics across all ExpertBook operations.
                        </p>
                    </div>

                    {/* KPI Cards */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', padding: '1.5rem 2rem' }}>
                        {kpiCards.map(kpi => (
                            <div key={kpi.label} className="card animate-fadeInUp" style={{ background: 'var(--surface-lowest)', border: '1px solid var(--surface-ch)', borderRadius: 'var(--radius-xl)', padding: '1.25rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                    <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-md)', background: `${kpi.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <kpi.icon size={20} color={kpi.color} />
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', fontWeight: 600, color: kpi.up ? '#4ade80' : '#ef4444' }}>
                                        {kpi.up ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                                        {kpi.change}
                                    </div>
                                </div>
                                <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: '1.75rem', color: 'var(--on-surface)' }}>{kpi.value}</div>
                                <div style={{ fontSize: '0.78rem', color: 'var(--on-surface-var)', marginTop: '4px' }}>{kpi.label}</div>
                            </div>
                        ))}
                    </div>

                    {/* Charts Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1.5rem', padding: '0 2rem 2rem' }}>
                        {/* Booking Trends */}
                        <div className="card" style={{ background: 'var(--surface-lowest)', border: '1px solid var(--surface-ch)', borderRadius: 'var(--radius-xl)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.5rem' }}>
                                <TrendingUp size={20} color="var(--primary)" />
                                <h3 style={{ color: 'var(--on-surface)', fontFamily: 'var(--font-body)', fontWeight: 700 }}>Booking Trends</h3>
                            </div>
                            <ResponsiveContainer width="100%" height={250}>
                                <AreaChart data={trends}>
                                    <defs>
                                        <linearGradient id="colorBookings" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#8F00FF" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#8F00FF" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(77,67,86,0.15)" />
                                    <XAxis dataKey="date" tick={{ fill: 'var(--on-surface-var)', fontSize: 10 }} tickFormatter={v => v.slice(5)} />
                                    <YAxis tick={{ fill: 'var(--on-surface-var)', fontSize: 10 }} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Area type="monotone" dataKey="bookings" stroke="#8F00FF" strokeWidth={2} fillOpacity={1} fill="url(#colorBookings)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Status Distribution */}
                        <div className="card" style={{ background: 'var(--surface-lowest)', border: '1px solid var(--surface-ch)', borderRadius: 'var(--radius-xl)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.5rem' }}>
                                <BarChart3 size={20} color="var(--primary)" />
                                <h3 style={{ color: 'var(--on-surface)', fontFamily: 'var(--font-body)', fontWeight: 700 }}>Status Breakdown</h3>
                            </div>
                            <ResponsiveContainer width="100%" height={200}>
                                <PieChart>
                                    <Pie data={statusDist} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value">
                                        {statusDist.map((entry, i) => (
                                            <Cell key={i} fill={entry.color || COLORS[i % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip content={<CustomTooltip />} />
                                </PieChart>
                            </ResponsiveContainer>
                            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                                {statusDist.map((s, i) => (
                                    <div key={s.name} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--on-surface-var)' }}>
                                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: s.color || COLORS[i] }} />
                                        {s.name}: {s.value}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Peak Hours */}
                        <div className="card" style={{ background: 'var(--surface-lowest)', border: '1px solid var(--surface-ch)', borderRadius: 'var(--radius-xl)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.5rem' }}>
                                <Clock size={20} color="var(--primary)" />
                                <h3 style={{ color: 'var(--on-surface)', fontFamily: 'var(--font-body)', fontWeight: 700 }}>Peak Hours</h3>
                            </div>
                            <ResponsiveContainer width="100%" height={220}>
                                <BarChart data={peakHours.filter((_, i) => i >= 7 && i <= 20)}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(77,67,86,0.15)" />
                                    <XAxis dataKey="hour" tick={{ fill: 'var(--on-surface-var)', fontSize: 10 }} />
                                    <YAxis tick={{ fill: 'var(--on-surface-var)', fontSize: 10 }} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Bar dataKey="count" fill="#8F00FF" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Revenue Trend */}
                        <div className="card" style={{ background: 'var(--surface-lowest)', border: '1px solid var(--surface-ch)', borderRadius: 'var(--radius-xl)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.5rem' }}>
                                <DollarSign size={20} color="#4ade80" />
                                <h3 style={{ color: 'var(--on-surface)', fontFamily: 'var(--font-body)', fontWeight: 700 }}>Revenue Trend</h3>
                            </div>
                            <ResponsiveContainer width="100%" height={220}>
                                <LineChart data={revenue}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(77,67,86,0.15)" />
                                    <XAxis dataKey="week" tick={{ fill: 'var(--on-surface-var)', fontSize: 11 }} />
                                    <YAxis tick={{ fill: 'var(--on-surface-var)', fontSize: 10 }} tickFormatter={v => `$${v / 1000}k`} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Line type="monotone" dataKey="amount" stroke="#4ade80" strokeWidth={2.5} dot={{ fill: '#4ade80', r: 4 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
