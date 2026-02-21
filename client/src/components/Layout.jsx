import { Link, useLocation } from 'react-router-dom';
import { Calendar, User, Clock } from 'lucide-react';

const Layout = ({ children }) => {
    const location = useLocation();

    return (
        <div className="min-h-screen flex flex-col font-sans bg-slate-50 text-slate-900">
            <header className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <Link to="/" className="flex items-center gap-2 text-indigo-600 font-bold text-xl tracking-tight">
                            <Calendar className="w-6 h-6" />
                            <span>ExpertBook</span>
                        </Link>
                        <nav className="flex gap-6">
                            <Link
                                to="/"
                                className={`flex items-center gap-2 text-sm font-medium transition-colors ${location.pathname === '/' ? 'text-indigo-600' : 'text-slate-600 hover:text-indigo-600'}`}
                            >
                                <User className="w-4 h-4" />
                                Experts
                            </Link>
                            <Link
                                to="/my-bookings"
                                className={`flex items-center gap-2 text-sm font-medium transition-colors ${location.pathname === '/my-bookings' ? 'text-indigo-600' : 'text-slate-600 hover:text-indigo-600'}`}
                            >
                                <Clock className="w-4 h-4" />
                                My Bookings
                            </Link>
                        </nav>
                    </div>
                </div>
            </header>
            <main className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-500">
                {children}
            </main>
            <footer className="bg-white border-t border-slate-200 py-6 text-center text-slate-500 text-sm mt-auto">
                &copy; {new Date().getFullYear()} ExpertBook Platform. All rights reserved.
            </footer>
        </div>
    );
};

export default Layout;
