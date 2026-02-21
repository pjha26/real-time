import { useState, useEffect } from 'react';
import axios from 'axios';
import { Loader2, Calendar as CalendarIcon, Clock, User, CheckCircle, Clock3 } from 'lucide-react';
import useAuthStore from '../store/useAuthStore';
import { Link } from 'react-router-dom';

const MyBookings = () => {
    const { user } = useAuthStore();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (user) {
            fetchBookings();
        } else {
            setLoading(false);
        }
    }, [user]);

    const fetchBookings = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`http://localhost:5000/api/bookings`, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            setBookings(res.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch bookings');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (id, newStatus) => {
        try {
            await axios.patch(`http://localhost:5000/api/bookings/${id}/status`, { status: newStatus }, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            fetchBookings(); // Refresh list to get updated status
        } catch (err) {
            alert(err.response?.data?.message || 'Update failed');
        }
    };

    const handleDownloadICS = async (id, expertName) => {
        try {
            const res = await axios.get(`http://localhost:5000/api/bookings/${id}/calendar`, {
                headers: { Authorization: `Bearer ${user.token}` },
                responseType: 'blob'
            });

            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Booking_${expertName.replace(/\s+/g, '_')}.ics`);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
        } catch (err) {
            alert('Failed to download calendar file.');
        }
    };


    const getStatusBadge = (status) => {
        switch (status) {
            case 'Confirmed': return <span className="flex items-center gap-1 bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold"><CheckCircle className="w-3 h-3" /> {status}</span>;
            case 'Completed': return <span className="flex items-center gap-1 bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold"><CheckCircle className="w-3 h-3" /> {status}</span>;
            case 'Cancelled': return <span className="flex items-center gap-1 bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold"><CheckCircle className="w-3 h-3" /> {status}</span>;
            case 'Rescheduled': return <span className="flex items-center gap-1 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold"><CheckCircle className="w-3 h-3" /> {status}</span>;
            default: return <span className="flex items-center gap-1 bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-bold"><Clock3 className="w-3 h-3" /> Pending</span>;
        }
    };

    if (!user) {
        return (
            <div className="text-center py-20">
                <h2 className="text-2xl font-bold text-slate-800 mb-4">Please log in to view your bookings</h2>
                <Link to="/login" className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700">Log in</Link>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-slate-100">
                <div className="text-center max-w-xl mx-auto">
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">My Bookings</h1>
                    <p className="text-slate-600">Review and manage your scheduled expert sessions below.</p>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-32">
                    <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
                </div>
            ) : error ? (
                <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 text-center font-medium">
                    {error}
                </div>
            ) : (
                <div className="space-y-4">
                    <h2 className="text-xl font-bold text-slate-800 px-2 flex justify-between items-center">
                        <span>Your Schedule</span>
                        <span className="text-sm font-medium bg-slate-200 text-slate-700 px-3 py-1 rounded-full">{bookings.length} upcoming</span>
                    </h2>

                    {bookings.length === 0 ? (
                        <div className="text-center py-16 bg-white rounded-2xl border border-slate-100 shadow-sm">
                            <CalendarIcon className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                            <h3 className="text-lg font-bold text-slate-700">No bookings found</h3>
                            <p className="text-slate-500 mt-2 mb-6">You haven't scheduled any sessions yet.</p>
                            <Link to="/experts" className="px-6 py-3 bg-indigo-50 text-indigo-600 font-semibold rounded-xl hover:bg-indigo-100">Find an Expert</Link>
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            {bookings.map(booking => (
                                <div key={booking._id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-6 justify-between items-start md:items-center hover:shadow-md transition-shadow">
                                    <div className="space-y-3 flex-1">
                                        <div className="flex items-center gap-2">
                                            {getStatusBadge(booking.status)}
                                            <span className="text-xs font-semibold text-slate-400">ID: {booking._id.slice(-6).toUpperCase()}</span>
                                        </div>
                                        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                            <User className="w-5 h-5 text-indigo-500" />
                                            Session with {booking.expert?.name || 'an Expert'}
                                        </h3>

                                        <div className="flex flex-wrap items-center gap-3 text-sm font-medium text-slate-600 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100 w-fit">
                                            <div className="flex items-center gap-2">
                                                <CalendarIcon className="w-4 h-4 text-slate-400" />
                                                {new Date(booking.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </div>
                                            <div className="w-px h-4 bg-slate-200 hidden sm:block"></div>
                                            <div className="flex items-center gap-2">
                                                <Clock className="w-4 h-4 text-slate-400" />
                                                {booking.timeSlot}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-2 md:justify-end shrink-0 w-full md:w-auto mt-4 md:mt-0 pt-4 md:pt-0 border-t md:border-t-0 border-slate-100">
                                        <button
                                            onClick={() => handleDownloadICS(booking._id, booking.expert?.name || 'Expert')}
                                            className="px-4 py-2 bg-indigo-50 text-indigo-600 text-sm font-bold rounded-xl hover:bg-indigo-100 transition whitespace-nowrap"
                                        >
                                            Add to Calendar
                                        </button>

                                        {(booking.googleMeetLink || booking.meetingLink) && booking.status !== 'Cancelled' && (
                                            <a
                                                href={booking.googleMeetLink || booking.meetingLink}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="px-4 py-2 bg-emerald-50 text-emerald-600 border border-emerald-200 text-sm font-bold rounded-xl hover:bg-emerald-100 transition flex items-center gap-2 whitespace-nowrap"
                                            >
                                                Google Meet
                                            </a>
                                        )}

                                        {booking.zoomLink && booking.status !== 'Cancelled' && (
                                            <a
                                                href={booking.zoomLink}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="px-4 py-2 bg-blue-50 text-blue-600 border border-blue-200 text-sm font-bold rounded-xl hover:bg-blue-100 transition flex items-center gap-2 whitespace-nowrap"
                                            >
                                                Zoom
                                            </a>
                                        )}

                                        {booking.status !== 'Cancelled' && booking.status !== 'Completed' && (
                                            <>
                                                <button
                                                    onClick={() => handleStatusUpdate(booking._id, 'Cancelled')}
                                                    className="px-4 py-2 bg-white border border-red-200 text-red-600 text-sm font-bold rounded-xl hover:bg-red-50 transition"
                                                >
                                                    Cancel
                                                </button>
                                                {/* Reschedule in MVP simply calls a prompt or ideally opens a new selection logic. For MVP we will just show it's possible. */}
                                                <button
                                                    onClick={() => alert('To reschedule, please cancel this booking and create a new one.')}
                                                    className="px-4 py-2 bg-white border border-slate-200 text-slate-700 text-sm font-bold rounded-xl hover:bg-slate-50 transition"
                                                >
                                                    Reschedule
                                                </button>
                                            </>
                                        )}
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
