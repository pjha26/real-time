import { Link, useLocation } from 'react-router-dom';
import { Calendar, User, Clock, LogOut } from 'lucide-react';
import useAuthStore from '../store/useAuthStore';

const Layout = ({ children }) => {
    const location = useLocation();
    const { user, logout } = useAuthStore();

    return (
        <div className="min-h-screen flex flex-col font-sans bg-slate-50 text-slate-900">
            <header className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <Link to="/" className="flex items-center gap-2 text-indigo-600 font-bold text-xl tracking-tight">
                            <Calendar className="w-6 h-6" />
                            <span>ExpertBook</span>
                        </Link>
                        <nav className="flex items-center gap-6">
                            <Link
                                to="/experts"
                                className={`flex items-center gap-2 text-sm font-medium transition-colors ${location.pathname === '/experts' ? 'text-indigo-600' : 'text-slate-600 hover:text-indigo-600'}`}
                            >
                                <User className="w-4 h-4" />
                                Experts
                            </Link>
                            {user ? (
                                <>
                                    <Link
                                        to="/my-bookings"
                                        className={`flex items-center gap-2 text-sm font-medium transition-colors ${location.pathname === '/my-bookings' ? 'text-indigo-600' : 'text-slate-600 hover:text-indigo-600'}`}
                                    >
                                        <Clock className="w-4 h-4" />
                                        My Bookings
                                    </Link>
                                    <button
                                        onClick={logout}
                                        className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-red-600 transition-colors ml-4"
                                    >
                                        <LogOut className="w-4 h-4" />
                                        Logout
                                    </button>
                                    <div className="hidden sm:flex items-center gap-2 ml-4 pl-4 border-l border-slate-200">
                                        <Link to="/profile" className="w-8 h-8 rounded-full bg-indigo-100 hover:bg-indigo-200 text-indigo-700 flex items-center justify-center font-bold text-xs ring-2 ring-transparent hover:ring-indigo-100 transition-all">
                                            {user.name.charAt(0).toUpperCase()}
                                        </Link>
                                    </div>
                                </>
                            ) : (
                                <div className="flex items-center gap-4 ml-4">
                                    <Link to="/login" className="text-sm font-semibold text-slate-700 hover:text-indigo-600 transition-colors">
                                        Log in
                                    </Link>
                                    <Link to="/register" className="text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors shadow-sm">
                                        Sign up
                                    </Link>
                                </div>
                            )}
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
