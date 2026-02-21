import { Link } from 'react-router-dom';
import { Calendar, Users, Zap, ShieldCheck, ArrowRight, PlayCircle } from 'lucide-react';
import useAuthStore from '../store/useAuthStore';

const LandingPage = () => {
    const { user } = useAuthStore();

    return (
        <div className="flex flex-col min-h-[85vh]">
            {/* Hero Section */}
            <section className="flex-1 flex flex-col justify-center items-center text-center px-4 py-20 relative overflow-hidden">
                <div className="absolute inset-0 z-0 bg-grid-slate-100/[0.04] bg-[bottom_1px_center] dark:bg-grid-slate-900/[0.04] dark:bg-[bottom_1px_center]"></div>
                <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
                    <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"></div>
                </div>

                <div className="z-10 max-w-4xl max-auto space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-sm font-semibold mb-4">
                        <Zap className="w-4 h-4 fill-indigo-500" /> Introducing Real-Time Scheduling
                    </div>

                    <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 tracking-tight leading-tight">
                        Book top experts with <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                            zero friction.
                        </span>
                    </h1>

                    <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
                        Connect instantly with industry leaders, therapists, and mentors. Our platform ensures you never double-book, with real-time slot synchronization.
                    </p>

                    <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-6">
                        <Link
                            to={user ? "/experts" : "/register"}
                            className="w-full sm:w-auto px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-lg shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2 group"
                        >
                            {user ? 'Find an Expert' : 'Get Started for Free'}
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <Link
                            to="/experts"
                            className="w-full sm:w-auto px-8 py-4 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2"
                        >
                            <PlayCircle className="w-5 h-5 text-slate-400" /> View Directory
                        </Link>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20 bg-white border-t border-slate-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-slate-900">Why choose ExpertBook?</h2>
                        <p className="mt-4 text-slate-600 max-w-2xl mx-auto">Everything you need to schedule, manage, and conduct professional sessions seamlessly.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                        <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100 hover:shadow-md transition-shadow">
                            <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mb-6">
                                <Calendar className="w-7 h-7 text-blue-600" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-3">Real-Time Sync</h3>
                            <p className="text-slate-600 leading-relaxed">
                                Our Socket.IO architecture guarantees that once a slot is clicked, it's instantly unavailable to everyone else. No double bookings.
                            </p>
                        </div>

                        <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100 hover:shadow-md transition-shadow">
                            <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center mb-6">
                                <Users className="w-7 h-7 text-purple-600" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-3">Vetted Experts</h3>
                            <p className="text-slate-600 leading-relaxed">
                                Connect directly with top professionals across various fields, from career coaching to mental health therapy.
                            </p>
                        </div>

                        <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100 hover:shadow-md transition-shadow">
                            <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center mb-6">
                                <ShieldCheck className="w-7 h-7 text-emerald-600" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-3">Secure & Private</h3>
                            <p className="text-slate-600 leading-relaxed">
                                Enterprise-grade JWT authentication and secure MongoDB transactions keep your data and your appointments completely safe.
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default LandingPage;
