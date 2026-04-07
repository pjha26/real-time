import { NavLink, Link, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    Search,
    Calendar,
    Users,
    Brain,
    Settings,
    HelpCircle,
    LogOut,
    Zap
} from 'lucide-react';
import { SignedIn, UserButton, useUser } from '@clerk/clerk-react';
import { useAuthStore } from '../store/useStore';

const navItems = [
    { to: '/workspace', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/explore', icon: Search, label: 'Explore' },
    { to: '/bookings', icon: Calendar, label: 'My Bookings' },
    { to: '/collaborations', icon: Users, label: 'Collaborations' },
    { to: '/curator', icon: Brain, label: 'AI Curator' },
];

const bottomItems = [
    { to: '/settings', icon: Settings, label: 'Settings' },
    { to: '/support', icon: HelpCircle, label: 'Support' },
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
                <Link to="/" className="sidebar-logo" style={{ textDecoration: 'none', marginBottom: '1.5rem' }}>
                    <img src="/src/assets/logo.svg" alt="ExpertBook" style={{ width: 28, height: 28 }} />
                    <span style={{ color: 'var(--on-surface)', fontWeight: 800 }}>ExpertBook</span>
                    <span className="sidebar-ai-badge" style={{ color: 'var(--primary)', background: 'var(--tertiary-c)' }}>Live</span>
                </Link>

                {/* Curator card */}
                <div className="card" style={{ marginBottom: '1.5rem', padding: '0.75rem 1rem', background: 'var(--surface-lowest)', border: '1px solid var(--surface-ch)' }}>
                    <div className="flex items-center gap-1" style={{ gap: '8px' }}>
                        <div className="pulse-dot"></div>
                        <span style={{ fontSize: '0.8rem', fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--primary)' }}>THE CURATOR</span>
                    </div>
                    <p style={{ fontSize: '0.65rem', marginTop: '4px', color: 'var(--on-surface-var)', fontFamily: 'var(--font-mono)' }}>Synthesizing network flow…</p>
                </div>

                {/* Main nav */}
                <nav style={{ flex: 1 }}>
                    {navItems.map(item => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
                        >
                            <item.icon size={20} />
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
                            <item.icon size={20} />
                            {item.label}
                        </NavLink>
                    ))}

                    <SignedIn>
                        <div style={{ marginTop: '1rem', padding: '12px', borderRadius: 'var(--radius-xl)', background: 'var(--surface-lowest)', border: '1px solid var(--surface-ch)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <UserButton afterSignOutUrl="/" showName />
                        </div>
                    </SignedIn>
                </div>
            </aside>

            {/* Main */}
            <main className="main-content">{children}</main>
        </div>
    );
}
