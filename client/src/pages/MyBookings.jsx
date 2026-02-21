import { useState } from 'react';
import axios from 'axios';
import { Search, Loader2, Calendar as CalendarIcon, Clock, User, CheckCircle, Clock3 } from 'lucide-react';

const MyBookings = () => {
    const [email, setEmail] = useState('');
    const [searchedEmail, setSearchedEmail] = useState('');
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchBookings = async (e) => {
        e.preventDefault();
        if (!email.trim()) return;

        setLoading(true);
        setError(null);
        setSearchedEmail(email);

        try {
            const res = await axios.get(`http://localhost:5000/api/bookings`, {
                params: { email: email.trim() }
            });
            setBookings(res.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch bookings');
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'Confirmed': return <span className="flex items-center gap-1 bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold"><CheckCircle className="w-3 h-3" /> {status}</span>;
            case 'Completed': return <span className="flex items-center gap-1 bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold"><CheckCircle className="w-3 h-3" /> {status}</span>;
            default: return <span className="flex items-center gap-1 bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-bold"><Clock3 className="w-3 h-3" /> Pending</span>;
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-slate-100">
                <div className="text-center max-w-xl mx-auto mb-8">
                    <h1 className="text-3xl font-bold text-slate-900 mb-4">Find Your Bookings</h1>
                    <p className="text-slate-600">Enter the email address you used to book your expert sessions to view their current status.</p>
                </div>

                <form onSubmit={fetchBookings} className="relative max-w-md mx-auto flex gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                        <input
                            type="email"
                            required
                            placeholder="name@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all shadow-sm"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3.5 rounded-xl font-bold transition-colors shadow-sm disabled:opacity-70 flex items-center justify-center min-w-[120px]"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Search'}
                    </button>
                </form>
            </div>

            {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 text-center font-medium">
                    {error}
                </div>
            )}

            {searchedEmail && !loading && !error && (
                <div className="space-y-4">
                    <h2 className="text-xl font-bold text-slate-800 px-2 flex justify-between items-center">
                        <span>Results for {searchedEmail}</span>
                        <span className="text-sm font-medium bg-slate-200 text-slate-700 px-3 py-1 rounded-full">{bookings.length} found</span>
                    </h2>

                    {bookings.length === 0 ? (
                        <div className="text-center py-16 bg-white rounded-2xl border border-slate-100 shadow-sm">
                            <CalendarIcon className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                            <h3 className="text-lg font-bold text-slate-700">No bookings found</h3>
                            <p className="text-slate-500 mt-1">We couldn&apos;t find any bookings associated with this email.</p>
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            {bookings.map(booking => (
                                <div key={booking._id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col sm:flex-row gap-6 justify-between items-start sm:items-center hover:shadow-md transition-shadow">
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2">
                                            {getStatusBadge(booking.status)}
                                            <span className="text-xs font-semibold text-slate-400">ID: {booking._id.slice(-6).toUpperCase()}</span>
                                        </div>
                                        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                            <User className="w-5 h-5 text-indigo-500" />
                                            Session with {booking.expert?.name}
                                        </h3>
                                    </div>

                                    <div className="flex items-center gap-6 text-sm font-medium text-slate-600 bg-slate-50 px-5 py-3 rounded-xl border border-slate-100 w-full sm:w-auto">
                                        <div className="flex items-center gap-2">
                                            <CalendarIcon className="w-4 h-4 text-slate-400" />
                                            {new Date(booking.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </div>
                                        <div className="w-px h-6 bg-slate-200 hidden sm:block"></div>
                                        <div className="flex items-center gap-2">
                                            <Clock className="w-4 h-4 text-slate-400" />
                                            {booking.timeSlot}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default MyBookings;
