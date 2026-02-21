import { useState } from 'react';
import { User, Mail, Calendar, LogOut, Lock, CheckCircle } from 'lucide-react';
import useAuthStore from '../store/useAuthStore';
import { useNavigate, Link } from 'react-router-dom';

const Profile = () => {
    const { user, logout, updateUser, updatePassword, becomeExpert } = useAuthStore();
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState('overview');
    const [name, setName] = useState(user?.name || '');
    const [email, setEmail] = useState(user?.email || '');
    const [password, setPassword] = useState('');
    const [updateMsg, setUpdateMsg] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

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

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setUpdateMsg(''); setErrorMsg('');
        const res = await updateUser(name, email);
        if (res.success) setUpdateMsg('Profile updated successfully!');
        else setErrorMsg(res.error || 'Failed to update profile');
    };

    const handleUpdatePassword = async (e) => {
        e.preventDefault();
        setUpdateMsg(''); setErrorMsg('');
        const res = await updatePassword(password);
        if (res.success) {
            setUpdateMsg('Password updated successfully!');
            setPassword('');
        } else setErrorMsg(res.error || 'Failed to update password');
    };

    const handleBecomeExpert = async () => {
        setUpdateMsg(''); setErrorMsg('');
        const res = await becomeExpert();
        if (res.success) {
            setUpdateMsg('You are now an Expert! Access the dashboard to set up your profile.');
        } else {
            setErrorMsg(res.error || 'Failed to upgrade role');
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 pt-8">
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 flex flex-col md:flex-row gap-8">

                {/* Sidebar Menu */}
                <div className="w-full md:w-64 flex flex-col gap-2 shrink-0 border-r border-slate-100 pr-4">
                    <button onClick={() => setActiveTab('overview')} className={`text-left px-4 py-3 rounded-xl font-semibold transition-colors flex items-center gap-3 ${activeTab === 'overview' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-600 hover:bg-slate-50'}`}>
                        <User className="w-5 h-5" /> Overview
                    </button>
                    <button onClick={() => setActiveTab('security')} className={`text-left px-4 py-3 rounded-xl font-semibold transition-colors flex items-center gap-3 ${activeTab === 'security' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-600 hover:bg-slate-50'}`}>
                        <Lock className="w-5 h-5" /> Security
                    </button>
                    <button onClick={() => navigate('/expert-dashboard')} className={`text-left px-4 py-3 rounded-xl font-semibold transition-colors flex items-center gap-3 text-slate-600 hover:bg-slate-50`}>
                        <Calendar className="w-5 h-5" /> Expert Dashboard
                    </button>
                    <button onClick={() => navigate('/my-bookings')} className={`text-left px-4 py-3 rounded-xl font-semibold transition-colors flex items-center gap-3 text-slate-600 hover:bg-slate-50`}>
                        <Calendar className="w-5 h-5" /> My Bookings
                    </button>
                    <div className="mt-auto pt-8">
                        <button onClick={handleLogout} className="w-full text-left px-4 py-3 rounded-xl font-semibold transition-colors flex items-center gap-3 text-red-600 hover:bg-red-50">
                            <LogOut className="w-5 h-5" /> Sign Out
                        </button>
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1">
                    {updateMsg && <div className="mb-6 bg-emerald-50 text-emerald-600 px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2"><CheckCircle className="w-4 h-4" /> {updateMsg}</div>}
                    {errorMsg && <div className="mb-6 bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm font-medium">{errorMsg}</div>}

                    {activeTab === 'overview' && (
                        <div className="animate-in fade-in duration-300">
                            <h2 className="text-2xl font-bold text-slate-900 mb-6">Profile Information</h2>
                            <div className="flex items-center gap-6 mb-8">
                                <div className="w-20 h-20 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-3xl shadow-inner border border-indigo-50">
                                    {user.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold">{user.name}</h3>
                                    <p className="text-slate-500">{user.email}</p>
                                </div>
                            </div>

                            <form onSubmit={handleUpdateProfile} className="space-y-5 max-w-md">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Full Name</label>
                                    <input type="text" value={name} onChange={e => setName(e.target.value)} required className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-200 outline-none" />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email Address</label>
                                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-200 outline-none" />
                                </div>
                                <button type="submit" className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition">Update Profile</button>
                            </form>

                            {!user?.isExpert && (
                                <div className="mt-12 pt-8 border-t border-slate-100 max-w-md">
                                    <h3 className="text-xl font-bold text-slate-900 mb-2">Upgrade to Expert</h3>
                                    <p className="text-slate-600 mb-4 text-sm">Unlock the ability to create event types, set your availability, and let clients book sessions with you.</p>
                                    <button
                                        onClick={handleBecomeExpert}
                                        className="w-full px-6 py-3 bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold rounded-xl hover:bg-emerald-100 transition"
                                    >
                                        Become an Expert
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'security' && (
                        <div className="animate-in fade-in duration-300">
                            <h2 className="text-2xl font-bold text-slate-900 mb-2">Security Settings</h2>
                            <p className="text-slate-500 mb-8">Change your password here. You will remain logged in after updating.</p>

                            <form onSubmit={handleUpdatePassword} className="space-y-5 max-w-md">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">New Password</label>
                                    <input type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} placeholder="••••••••" className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-200 outline-none" />
                                </div>
                                <button type="submit" className="px-6 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition">Change Password</button>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Profile;
