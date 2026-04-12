import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    ShieldCheck, Users, Calendar, DollarSign, BarChart3, Search,
    ChevronDown, UserCog, XCircle, CheckCircle2, Clock, AlertTriangle,
    ArrowUpRight
} from 'lucide-react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const ROLE_COLORS = {
    admin: { bg: 'rgba(245,158,11,0.15)', color: '#f59e0b' },
    expert: { bg: 'rgba(74,222,128,0.15)', color: '#4ade80' },
    client: { bg: 'rgba(143,0,255,0.15)', color: '#8F00FF' },
};

export default function AdminPanel() {
    const navigate = useNavigate();
    const [tab, setTab] = useState('overview');
    const [stats, setStats] = useState(null);
    const [users, setUsers] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    const role = localStorage.getItem('user_role');

    useEffect(() => {
        if (role !== 'admin') {
            navigate('/login');
            return;
        }
        fetchAll();
    }, [role]);

    const headers = {
        'Content-Type': 'application/json',
        'x-user-role': 'admin',
    };

    const fetchAll = async () => {
        setLoading(true);
        try {
            const [statsRes, usersRes, bookingsRes] = await Promise.all([
                fetch(`${API}/api/admin/stats`, { headers }).then(r => r.json()),
                fetch(`${API}/api/admin/users`, { headers }).then(r => r.json()),
                fetch(`${API}/api/admin/bookings`, { headers }).then(r => r.json()),
            ]);
            setStats(statsRes);
            setUsers(usersRes);
            setBookings(bookingsRes);
        } catch (err) {
            console.error('Admin fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleRoleChange = async (userId, newRole) => {
        try {
            await fetch(`${API}/api/admin/users/${userId}/role`, {
                method: 'PATCH', headers, body: JSON.stringify({ role: newRole }),
            });
            setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
        } catch (err) { alert('Failed to update role'); }
    };

    const handleBookingStatus = async (bookingId, newStatus) => {
        try {
            await fetch(`${API}/api/admin/bookings/${bookingId}/status`, {
                method: 'PATCH', headers, body: JSON.stringify({ status: newStatus }),
            });
            setBookings(bookings.map(b => b.id === bookingId ? { ...b, status: newStatus } : b));
        } catch (err) { alert('Failed to update status'); }
    };

    const filteredUsers = searchQuery
        ? users.filter(u => u.name?.toLowerCase().includes(searchQuery.toLowerCase()) || u.email?.toLowerCase().includes(searchQuery.toLowerCase()))
        : users;

    const statusIcon = (status) => {
        switch (status) {
            case 'confirmed': return <CheckCircle2 size={14} color="#4ade80" />;
            case 'completed': return <CheckCircle2 size={14} color="#8F00FF" />;
            case 'cancelled': return <XCircle size={14} color="#ef4444" />;
            default: return <Clock size={14} color="#f59e0b" />;
        }
    };

    const tabs = [
        { id: 'overview', label: 'Overview', icon: BarChart3 },
        { id: 'users', label: 'Users', icon: Users },
        { id: 'bookings', label: 'Bookings', icon: Calendar },
    ];

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div className="spinner" style={{ width: 40, height: 40 }} />
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex' }}>
            {/* Sidebar */}
            <aside style={{ width: '240px', flexShrink: 0, borderRight: '1px solid var(--surface-ch)', padding: '2rem 1rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingLeft: '12px' }}>
                    <ShieldCheck size={24} color="#f59e0b" />
                    <div>
                        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1rem', color: 'var(--on-surface)' }}>Admin Panel</div>
                        <div style={{ fontSize: '0.68rem', color: 'var(--on-surface-var)', fontFamily: 'var(--font-mono)' }}>ExpertBook Platform</div>
                    </div>
                </div>

                <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {tabs.map(t => (
                        <button key={t.id} onClick={() => setTab(t.id)}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px',
                                borderRadius: 'var(--radius-md)', border: 'none', cursor: 'pointer',
                                background: tab === t.id ? 'rgba(245,158,11,0.1)' : 'transparent',
                                color: tab === t.id ? '#f59e0b' : 'var(--on-surface-var)',
                                fontFamily: 'var(--font-body)', fontSize: '0.85rem', fontWeight: tab === t.id ? 600 : 400,
                                transition: 'all var(--transition)',
                            }}
                        >
                            <t.icon size={18} />
                            {t.label}
                        </button>
                    ))}
                </nav>

                <div style={{ marginTop: 'auto' }}>
                    <Link to="/workspace" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', borderRadius: 'var(--radius-md)', color: 'var(--on-surface-var)', fontSize: '0.82rem' }}>
                        ← Back to Dashboard
                    </Link>
                </div>
            </aside>

            {/* Main */}
            <main style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
                {/* OVERVIEW TAB */}
                {tab === 'overview' && stats && (
                    <div className="animate-fadeInUp">
                        <h2 style={{ fontSize: '1.5rem', color: 'var(--on-surface)', marginBottom: '1.5rem' }}>Platform Overview</h2>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
                            {[
                                { label: 'Total Users', value: stats.totalUsers, icon: Users, color: '#8F00FF' },
                                { label: 'Total Experts', value: stats.totalExperts, icon: UserCog, color: '#4ade80' },
                                { label: 'Total Bookings', value: stats.totalBookings, icon: Calendar, color: '#f59e0b' },
                                { label: 'Active Today', value: stats.activeToday, icon: ArrowUpRight, color: '#a78bfa' },
                                { label: 'Revenue', value: stats.revenue, icon: DollarSign, color: '#4ade80' },
                                { label: 'Avg Rating', value: stats.avgSessionRating, icon: BarChart3, color: '#f59e0b' },
                            ].map(kpi => (
                                <div key={kpi.label} className="card" style={{ background: 'var(--surface-lowest)', border: '1px solid var(--surface-ch)', borderRadius: 'var(--radius-xl)', padding: '1.25rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '0.75rem' }}>
                                        <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', background: `${kpi.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <kpi.icon size={18} color={kpi.color} />
                                        </div>
                                        <span style={{ fontSize: '0.78rem', color: 'var(--on-surface-var)' }}>{kpi.label}</span>
                                    </div>
                                    <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: '1.75rem', color: 'var(--on-surface)' }}>{kpi.value}</div>
                                </div>
                            ))}
                        </div>

                        <div className="card" style={{ background: 'var(--surface-lowest)', border: '1px solid var(--surface-ch)', borderRadius: 'var(--radius-xl)', padding: '1.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
                                <AlertTriangle size={18} color="#f59e0b" />
                                <span style={{ fontWeight: 700, color: 'var(--on-surface)' }}>Quick Actions</span>
                            </div>
                            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                                <button className="btn-secondary" onClick={() => setTab('users')} style={{ fontSize: '0.82rem', gap: '6px' }}>
                                    <Users size={16} /> Manage Users
                                </button>
                                <button className="btn-secondary" onClick={() => setTab('bookings')} style={{ fontSize: '0.82rem', gap: '6px' }}>
                                    <Calendar size={16} /> View Bookings
                                </button>
                                <Link to="/analytics" className="btn-secondary" style={{ fontSize: '0.82rem', gap: '6px', textDecoration: 'none' }}>
                                    <BarChart3 size={16} /> Analytics Dashboard
                                </Link>
                            </div>
                        </div>
                    </div>
                )}

                {/* USERS TAB */}
                {tab === 'users' && (
                    <div className="animate-fadeInUp">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h2 style={{ fontSize: '1.5rem', color: 'var(--on-surface)' }}>User Management</h2>
                            <span style={{ fontSize: '0.82rem', color: 'var(--on-surface-var)', fontFamily: 'var(--font-mono)' }}>{users.length} total</span>
                        </div>

                        {/* Search */}
                        <div style={{ position: 'relative', maxWidth: '400px', marginBottom: '1.5rem' }}>
                            <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--outline)' }} />
                            <input className="input" style={{ paddingLeft: '42px' }} placeholder="Search users by name or email…" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                        </div>

                        {/* Table */}
                        <div style={{ borderRadius: 'var(--radius-xl)', overflow: 'hidden', border: '1px solid var(--surface-ch)' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ background: 'var(--surface-lowest)' }}>
                                        {['Name', 'Email', 'Role', 'Joined', 'Actions'].map(h => (
                                            <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.75rem', color: 'var(--on-surface-var)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid var(--surface-ch)' }}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredUsers.map(user => (
                                        <tr key={user.id} style={{ borderBottom: '1px solid var(--surface-ch)' }}>
                                            <td style={{ padding: '12px 16px', fontSize: '0.88rem', fontWeight: 600, color: 'var(--on-surface)' }}>{user.name}</td>
                                            <td style={{ padding: '12px 16px', fontSize: '0.82rem', color: 'var(--on-surface-var)', fontFamily: 'var(--font-mono)' }}>{user.email}</td>
                                            <td style={{ padding: '12px 16px' }}>
                                                <span style={{
                                                    display: 'inline-block', padding: '3px 12px', borderRadius: 'var(--radius-full)',
                                                    fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em',
                                                    background: ROLE_COLORS[user.role]?.bg || 'var(--surface-low)',
                                                    color: ROLE_COLORS[user.role]?.color || 'var(--on-surface-var)',
                                                }}>
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td style={{ padding: '12px 16px', fontSize: '0.78rem', color: 'var(--on-surface-var)', fontFamily: 'var(--font-mono)' }}>
                                                {user.created_at ? new Date(user.created_at).toLocaleDateString('en', { month: 'short', day: 'numeric' }) : '—'}
                                            </td>
                                            <td style={{ padding: '12px 16px' }}>
                                                <select
                                                    value={user.role}
                                                    onChange={e => handleRoleChange(user.id, e.target.value)}
                                                    style={{
                                                        padding: '6px 10px', borderRadius: 'var(--radius)', fontSize: '0.78rem',
                                                        background: 'var(--surface-low)', color: 'var(--on-surface)', border: '1px solid var(--surface-ch)',
                                                        cursor: 'pointer',
                                                    }}
                                                >
                                                    <option value="client">Client</option>
                                                    <option value="expert">Expert</option>
                                                    <option value="admin">Admin</option>
                                                </select>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* BOOKINGS TAB */}
                {tab === 'bookings' && (
                    <div className="animate-fadeInUp">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h2 style={{ fontSize: '1.5rem', color: 'var(--on-surface)' }}>Booking Management</h2>
                            <span style={{ fontSize: '0.82rem', color: 'var(--on-surface-var)', fontFamily: 'var(--font-mono)' }}>{bookings.length} total</span>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {bookings.map(b => (
                                <div key={b.id} className="card" style={{ background: 'var(--surface-lowest)', border: '1px solid var(--surface-ch)', borderRadius: 'var(--radius-xl)', padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--on-surface)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            {statusIcon(b.status)}
                                            {b.event_title || b.event_types?.title || 'Session'}
                                        </div>
                                        <div style={{ fontSize: '0.78rem', color: 'var(--on-surface-var)', fontFamily: 'var(--font-mono)', marginTop: '4px' }}>
                                            {b.client_name && `${b.client_name} → `}{b.expert_name || ''} · {b.start_time ? new Date(b.start_time).toLocaleDateString('en', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'}
                                        </div>
                                    </div>
                                    <span style={{
                                        padding: '4px 14px', borderRadius: 'var(--radius-full)',
                                        fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase',
                                        background: b.status === 'confirmed' ? 'rgba(74,222,128,0.15)' : b.status === 'cancelled' ? 'rgba(239,68,68,0.15)' : 'rgba(245,158,11,0.15)',
                                        color: b.status === 'confirmed' ? '#4ade80' : b.status === 'cancelled' ? '#ef4444' : '#f59e0b',
                                    }}>
                                        {b.status || 'pending'}
                                    </span>
                                    <select
                                        value={b.status || 'pending'}
                                        onChange={e => handleBookingStatus(b.id, e.target.value)}
                                        style={{
                                            padding: '6px 10px', borderRadius: 'var(--radius)', fontSize: '0.78rem',
                                            background: 'var(--surface-low)', color: 'var(--on-surface)', border: '1px solid var(--surface-ch)',
                                            cursor: 'pointer',
                                        }}
                                    >
                                        <option value="pending">Pending</option>
                                        <option value="confirmed">Confirmed</option>
                                        <option value="completed">Completed</option>
                                        <option value="cancelled">Cancelled</option>
                                    </select>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
