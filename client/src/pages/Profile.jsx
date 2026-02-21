import { User, Mail, Calendar, LogOut } from 'lucide-react';
import useAuthStore from '../store/useAuthStore';
import { useNavigate, Link } from 'react-router-dom';

const Profile = () => {
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();

    if (!user) {
        return (
            <div className="text-center py-20">
                <h2 className="text-2xl font-bold text-slate-800 mb-4">Please log in to view your profile</h2>
                <Link to="/login" className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700">Log in</Link>
            </div>
        );
    }

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-500 pt-8">
            <div className="bg-white rounded-3xl p-8 sm:p-12 shadow-sm border border-slate-100 flex flex-col items-center relative">
                <div className="w-24 h-24 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-4xl mb-6 shadow-inner mx-auto ring-4 ring-white border border-indigo-50">
                    {user.name.charAt(0).toUpperCase()}
                </div>
                <h1 className="text-3xl font-extrabold text-slate-900 mb-2">{user.name}</h1>
                <p className="text-slate-500 flex items-center gap-2 justify-center mb-8">
                    <Mail className="w-4 h-4" />
                    {user.email}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full mb-10">
                    <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 text-center hover:bg-slate-100 transition-colors cursor-pointer" onClick={() => navigate('/my-bookings')}>
                        <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl flex justify-center items-center mx-auto mb-3">
                            <Calendar className="w-6 h-6" />
                        </div>
                        <p className="font-semibold text-slate-900 text-lg">My Sessions</p>
                        <p className="text-sm text-slate-500 mt-1">Manage scheduled experts</p>
                        <span className="text-indigo-600 font-semibold text-sm mt-3 inline-block hover:underline">View Bookings →</span>
                    </div>
                    <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 text-center hover:bg-slate-100 transition-colors">
                        <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-xl flex justify-center items-center mx-auto mb-3">
                            <User className="w-6 h-6" />
                        </div>
                        <p className="font-semibold text-slate-900 text-lg">Account Info</p>
                        <p className="text-sm text-slate-500 mt-1">Standard User Plan</p>
                        <span className="text-slate-400 font-semibold text-sm mt-3 inline-block">Active</span>
                    </div>
                </div>

                <div className="w-full pt-8 border-t border-slate-100 text-center">
                    <button
                        onClick={handleLogout}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-red-50 text-red-600 font-bold rounded-xl hover:bg-red-100 transition-colors shadow-sm"
                    >
                        <LogOut className="w-5 h-5" />
                        Sign Out of Account
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Profile;
