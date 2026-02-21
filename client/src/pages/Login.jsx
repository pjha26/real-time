import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Loader2, Calendar } from 'lucide-react';
import useAuthStore from '../store/useAuthStore';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login, user, loading, error, clearError } = useAuthStore();
    const navigate = useNavigate();

    useEffect(() => {
        if (user) navigate('/experts');
        return () => clearError();
    }, [user, navigate, clearError]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        await login(email, password);
    };

    return (
        <div className="min-h-[80vh] flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="flex justify-center text-indigo-600 mb-6">
                    <Calendar className="w-12 h-12" />
                </div>
                <h2 className="text-center text-3xl font-extrabold text-slate-900 mb-2">Welcome back</h2>
                <p className="text-center text-sm text-slate-600 mb-8">
                    Sign in to your account to manage your expert sessions
                </p>
            </div>

            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-10 px-8 shadow-sm border border-slate-100 rounded-2xl sm:px-10">
                    {error && (
                        <div className="mb-6 bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-sm font-medium">
                            {error}
                        </div>
                    )}

                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email address</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-slate-400" />
                                </div>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="block w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 transition-all outline-none"
                                    placeholder="you@example.com"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Password</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-slate-400" />
                                </div>
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="block w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 transition-all outline-none"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-70 disabled:cursor-wait transition-all"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Sign in'}
                        </button>
                    </form>

                    <div className="mt-8 text-center text-sm">
                        <span className="text-slate-500">Don't have an account? </span>
                        <Link to="/register" className="font-semibold text-indigo-600 hover:text-indigo-500">
                            Sign up today
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
