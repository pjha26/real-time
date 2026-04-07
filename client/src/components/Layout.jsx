import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useStore';

const navItems = [
    { to: '/workspace', icon: 'grid_view', label: 'Dashboard' },
    { to: '/explore', icon: 'explore', label: 'Explore' },
    { to: '/bookings', icon: 'event', label: 'My Bookings' },
    { to: '/collaborations', icon: 'group', label: 'Collaborations' },
    { to: '/curator', icon: 'psychology', label: 'AI Curator' },
];

const bottomItems = [
    { to: '/settings', icon: 'settings', label: 'Settings' },
    { to: '/support', icon: 'help_outline', label: 'Support' },
];

export default function Layout({ children }) {
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="app-layout">
            {/* Sidebar */}
            <aside className="sidebar">
                {/* Logo */}
                <Link to="/" className="sidebar-logo" style={{ textDecoration: 'none' }}>
                    <span style={{ fontSize: '1.4rem' }}>📘</span>
                    ExpertBook
                    <span className="sidebar-ai-badge">AI Online</span>
                </Link>

                {/* Curator card */}
                <div className="card" style={{ marginBottom: '1.5rem', padding: '0.75rem 1rem', background: 'rgba(143,0,255,0.08)' }}>
                    <div className="flex items-center gap-1" style={{ gap: '8px' }}>
                        <div className="pulse-dot"></div>
                        <span style={{ fontSize: '0.8rem', fontFamily: 'var(--font-display)', fontWeight: 600, color: 'var(--primary)' }}>The Curator</span>
                    </div>
                    <p style={{ fontSize: '0.7rem', marginTop: '4px', color: 'var(--on-surface-var)' }}>AI synthesizing connections…</p>
                </div>

                {/* Main nav */}
                <nav style={{ flex: 1 }}>
                    {navItems.map(item => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
                        >
                            <span className="material-icons">{item.icon}</span>
                            {item.label}
                        </NavLink>
                    ))}
                </nav>

                {/* Bottom */}
                <div>
                    {bottomItems.map(item => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
                        >
                            <span className="material-icons">{item.icon}</span>
                            {item.label}
                        </NavLink>
                    ))}

                    {user && (
                        <div style={{ marginTop: '1rem', padding: '12px', borderRadius: 'var(--radius-md)', background: 'var(--surface-ch)' }}>
                            <div className="flex items-center" style={{ gap: '10px', marginBottom: '8px' }}>
                                <div className="avatar" style={{ width: 32, height: 32, fontSize: '0.8rem' }}>
                                    {user.name?.[0]?.toUpperCase()}
                                </div>
                                <div>
                                    <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--on-surface)', fontFamily: 'var(--font-display)' }}>
                                        {user.name}
                                    </div>
                                    <div style={{ fontSize: '0.65rem', color: 'var(--outline)', textTransform: 'capitalize' }}>{user.role}</div>
                                </div>
                            </div>
                            <button className="btn-ghost" style={{ width: '100%', fontSize: '0.75rem', padding: '6px' }} onClick={handleLogout}>
                                <span className="material-icons" style={{ fontSize: 16 }}>logout</span>
                                Sign out
                            </button>
                        </div>
                    )}
                </div>
            </aside>

            {/* Main */}
            <main className="main-content">{children}</main>
        </div>
    );
}
