import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { io } from 'socket.io-client';
import { User, Briefcase, Star, ArrowLeft, Loader2, Calendar as CalendarIcon, Clock, CheckCircle } from 'lucide-react';
import useAuthStore from '../store/useAuthStore';
import { format, addDays, startOfDay, endOfDay, addMinutes, isBefore } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';

const socket = io('https://real-time-x3n3.onrender.com');

const ExpertDetail = () => {
    const { id } = useParams();
    const { user } = useAuthStore();
    const [expert, setExpert] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Bookings state
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [groupedSlots, setGroupedSlots] = useState({});
    const [bookedSlots, setBookedSlots] = useState([]); // Array of {date, time}

    // Form State
    const [formData, setFormData] = useState({ name: '', email: '', phone: '', notes: '' });
    const [bookingLoading, setBookingLoading] = useState(false);
    const [bookingSuccess, setBookingSuccess] = useState(false);
    const [bookingError, setBookingError] = useState(null);

    useEffect(() => {
        const fetchExpert = async () => {
            try {
                const res = await axios.get(`https://real-time-x3n3.onrender.com/api/experts/${id}`);
                setExpert(res.data);

                // Generate dynamic slots for the next 7 days in User's timezone based on Expert's timezone availability
                const expertTz = res.data.timezone || 'UTC';
                const grouped = {};
                const today = new Date();

                for (let i = 0; i < 7; i++) {
                    const checkDate = addDays(today, i);
                    const dateStr = format(checkDate, 'yyyy-MM-dd');
                    const dayStart = startOfDay(checkDate);
                    const dayEnd = endOfDay(checkDate);

                    const newAvailableTimes = [];
                    let currentSlot = dayStart;

                    while (isBefore(currentSlot, dayEnd)) {
                        const expertTimeStr = formatInTimeZone(currentSlot, expertTz, 'HH:mm');
                        const expertIsoDay = parseInt(formatInTimeZone(currentSlot, expertTz, 'i'), 10);
                        const expertDayOfWeek = expertIsoDay === 7 ? 0 : expertIsoDay;

                        const dayRule = res.data.availability?.find(a => a.dayOfWeek === expertDayOfWeek);

                        if (dayRule && dayRule.isAvailable) {
                            if (expertTimeStr >= dayRule.startTime && expertTimeStr < dayRule.endTime) {
                                newAvailableTimes.push(format(currentSlot, 'HH:mm'));
                            }
                        }
                        // Default generic 30 min duration for profile booking
                        currentSlot = addMinutes(currentSlot, 30);
                    }

                    if (newAvailableTimes.length > 0) {
                        grouped[dateStr] = newAvailableTimes;
                    }
                }

                setGroupedSlots(grouped);

                if (Object.keys(grouped).length > 0) {
                    setSelectedDate(Object.keys(grouped).sort()[0]);
                }
            } catch (err) {
                setError('Failed to fetch expert details.');
            } finally {
                setLoading(false);
            }
        };
        fetchExpert();
    }, [id]);

    useEffect(() => {
        // Listen for real-time slot booking updates
        socket.on('slotBooked', (data) => {
            if (data.expertId === id) {
                setBookedSlots(prev => {
                    // Avoid duplicates
                    if (prev.some(s => s.date === data.date && s.time === data.timeSlot)) return prev;
                    return [...prev, { date: data.date, time: data.timeSlot }];
                });

                if (selectedDate === data.date && selectedSlot === data.timeSlot) {
                    setSelectedSlot(null);
                    setBookingError('The slot you selected was just booked by someone else!');
                }
            }
        });

        return () => {
            socket.off('slotBooked');
        };
    }, [id, selectedDate, selectedSlot]);

    const isSlotBooked = (date, time) => {
        return bookedSlots.some(slot => slot.date === date && slot.time === time);
    };

    const handleBooking = async (e) => {
        e.preventDefault();
        setBookingError(null);
        setBookingLoading(true);

        try {
            await axios.post('https://real-time-x3n3.onrender.com/api/bookings', {
                expertId: id,
                date: selectedDate,
                timeSlot: selectedSlot,
                ...formData
            });
            setBookingSuccess(true);
        } catch (err) {
            setBookingError(err.response?.data?.message || 'Booking failed');
        } finally {
            setBookingLoading(false);
        }
    };

    if (loading) return (
        <div className="flex justify-center items-center h-64">
            <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
        </div>
    );

    if (error || !expert) return (
        <div className="bg-red-50 text-red-600 p-6 rounded-2xl border border-red-100 text-center">
            <p className="font-medium">{error || 'Expert not found'}</p>
            <Link to="/" className="text-indigo-600 hover:underline mt-4 inline-block">Back to listings</Link>
        </div>
    );

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-12">
            {/* Left Column: Details */}
            <div className="lg:col-span-1 space-y-6">
                <Link to="/" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors">
                    <ArrowLeft className="w-4 h-4 mr-1" /> Back to experts
                </Link>

                <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                    <h1 className="text-2xl font-bold text-slate-900 mb-2">{expert.name}</h1>
                    <div className="flex items-center gap-1 bg-amber-50 text-amber-600 px-3 py-1 rounded-md text-sm font-bold w-max mb-6">
                        <Star className="w-4 h-4 fill-amber-500" />
                        <span>{expert.rating} Rating</span>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center gap-3 text-slate-600">
                            <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                                <User className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Category</p>
                                <p className="font-medium">{expert.category}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 text-slate-600">
                            <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                                <Briefcase className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Experience</p>
                                <p className="font-medium">{expert.experience} years</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Column: Booking System */}
            <div className="lg:col-span-2">
                <div className="bg-white rounded-2xl p-6 md:p-8 border border-slate-100 shadow-sm">
                    {bookingSuccess ? (
                        <div className="text-center py-12 px-4 animate-in zoom-in duration-300">
                            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <CheckCircle className="w-10 h-10 text-emerald-600" />
                            </div>
                            <h2 className="text-3xl font-bold text-slate-900 mb-4">Booking Confirmed!</h2>
                            <p className="text-slate-600 mb-8 max-w-md mx-auto">
                                Your session with {expert.name} on {selectedDate} at {selectedSlot} has been successfully scheduled.
                            </p>
                            <div className="flex justify-center gap-4">
                                <Link to="/my-bookings" className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-200">
                                    View My Bookings
                                </Link>
                                <Link to="/" className="px-6 py-3 bg-white text-slate-700 border border-slate-200 font-semibold rounded-xl hover:bg-slate-50 transition-colors">
                                    Browse More
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-8">
                            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2 pb-4 border-b border-slate-100">
                                <CalendarIcon className="w-6 h-6 text-indigo-500" />
                                Select a Time
                            </h2>

                            {/* Date Selector */}
                            {Object.keys(groupedSlots).length > 0 ? (
                                <div className="flex gap-2 p-1 bg-slate-100 rounded-xl overflow-x-auto w-max">
                                    {Object.keys(groupedSlots).sort().map(dateStr => (
                                        <button
                                            type="button"
                                            key={dateStr}
                                            onClick={() => { setSelectedDate(dateStr); setSelectedSlot(null); setBookingError(null); }}
                                            className={`px-5 py-2.5 rounded-lg font-semibold text-sm whitespace-nowrap transition-all ${selectedDate === dateStr ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-900'}`}
                                        >
                                            {new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-slate-500 italic">No available slots.</p>
                            )}

                            {/* Slots Selector */}
                            {selectedDate && groupedSlots[selectedDate] && (
                                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                                    {groupedSlots[selectedDate].sort().map(time => {
                                        const booked = isSlotBooked(selectedDate, time);
                                        return (
                                            <button
                                                key={time}
                                                type="button"
                                                disabled={booked}
                                                onClick={() => { setSelectedSlot(time); setBookingError(null); }}
                                                className={`flex items-center justify-center gap-1.5 py-3 rounded-xl border font-medium text-sm transition-all ${booked ? 'bg-slate-50 border-slate-100 text-slate-400 cursor-not-allowed opacity-50 relative'
                                                    : selectedSlot === time
                                                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-200 scale-[1.02]'
                                                        : 'bg-white border-slate-200 text-slate-700 hover:border-indigo-300 hover:bg-indigo-50'
                                                    }`}
                                            >
                                                {!booked && <Clock className="w-3.5 h-3.5 opacity-70" />}
                                                <span className={booked ? 'line-through' : ''}>{time}</span>
                                                {booked && <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 bg-slate-800 text-white rounded-xl text-[10px] uppercase font-bold tracking-widest transition-opacity">Booked</div>}
                                            </button>
                                        )
                                    })}
                                </div>
                            )}

                            {/* Booking Form */}
                            {selectedSlot && (
                                <div className="pt-8 mt-8 border-t border-slate-100 animate-in fade-in duration-300 slide-in-from-bottom-4">
                                    <h3 className="text-lg font-bold text-slate-900 mb-6">Complete Booking</h3>

                                    {bookingError && (
                                        <div className="mb-6 bg-red-50 text-red-600 px-4 py-3 rounded-xl border border-red-100 font-medium text-sm">
                                            {bookingError}
                                        </div>
                                    )}

                                    {!user ? (
                                        <div className="text-center p-6 bg-indigo-50 rounded-2xl border border-indigo-100">
                                            <p className="text-slate-700 font-medium mb-4">You need an account to book sessions with experts.</p>
                                            <Link to="/login" className="inline-block bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700 transition shadow-sm">Log In to Book</Link>
                                        </div>
                                    ) : (
                                        <form onSubmit={handleBooking} className="space-y-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Full Name</label>
                                                    <input required type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all" placeholder="John Doe" />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email Address</label>
                                                    <input required type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all" placeholder="john@example.com" />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Phone Number</label>
                                                <input required type="tel" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all" placeholder="+1 (555) 000-0000" />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Additional Notes</label>
                                                <textarea value={formData.notes} onChange={e => setFormData({ ...formData, notes: e.target.value })} rows="3" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all resize-none" placeholder="Any topics you'd like to discuss..."></textarea>
                                            </div>
                                            <button
                                                type="submit"
                                                disabled={bookingLoading}
                                                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl mt-4 transition-all shadow-sm shadow-indigo-200 disabled:opacity-70 disabled:cursor-wait flex justify-center items-center"
                                            >
                                                {bookingLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : `Confirm Session for ${selectedSlot}`}
                                            </button>
                                        </form>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default ExpertDetail;
