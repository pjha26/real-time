import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Calendar, Clock, MapPin, User, Loader2, ArrowRight } from 'lucide-react';
import useAuthStore from '../store/useAuthStore';
import { format, addMinutes, isBefore, endOfDay, parseISO } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';

// Note: This MVP component handles the public booking view `/:username/:urlSlug` 
// It simulates the Calendly public link booking flow.

const PublicBookingPage = () => {
    const { username, urlSlug } = useParams();
    const navigate = useNavigate();
    const [expert, setExpert] = useState(null);
    const [eventType, setEventType] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Booking Form State
    const { user } = useAuthStore();
    const [name, setName] = useState(user?.name || '');
    const [email, setEmail] = useState(user?.email || '');
    const [phone, setPhone] = useState('');
    const [notes, setNotes] = useState('');
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedTime, setSelectedTime] = useState('');
    const [availableTimes, setAvailableTimes] = useState([]);

    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                // Fetch all experts (MVP workaround instead of strict username lookup)
                const { data: experts } = await axios.get('https://real-time-x3n3.onrender.com/api/experts?limit=100');

                // Find expert by username OR fallback to matching by the ID string if the username route parameter was an ID
                const foundExpert = experts.find(e => e.username === username || e._id === username);

                if (!foundExpert) {
                    setError('Expert not found.');
                    setLoading(false);
                    return;
                }
                setExpert(foundExpert);

                const { data: events } = await axios.get(`https://real-time-x3n3.onrender.com/api/event-types/expert/${foundExpert._id}`);
                const foundEvent = events.find(e => e.urlSlug === urlSlug);

                if (!foundEvent) {
                    setError('Event type not found or is no longer available.');
                    setLoading(false);
                    return;
                }
                setEventType(foundEvent);
            } catch (err) {
                setError('Failed to load booking page.');
            } finally {
                setLoading(false);
            }
        };

        fetchDetails();
    }, [username, urlSlug]);

    useEffect(() => {
        if (!expert || !eventType || !selectedDate) return;

        const expertTz = expert.timezone || 'UTC';
        const duration = eventType.duration || 30;

        // Parse the selected date in the user's local timezone (start of that day)
        const dateUser = parseISO(`${selectedDate}T00:00:00`);
        const newAvailableTimes = [];
        let currentSlot = dateUser;
        const end = endOfDay(dateUser);

        while (isBefore(currentSlot, end)) {
            // Get the time in the expert's timezone
            const expertTimeStr = formatInTimeZone(currentSlot, expertTz, 'HH:mm');
            // Get the day of the week in the expert's timezone (1=Mon ... 7=Sun)
            const expertIsoDay = parseInt(formatInTimeZone(currentSlot, expertTz, 'i'), 10);
            const expertDayOfWeek = expertIsoDay === 7 ? 0 : expertIsoDay; // convert to 0=Sun

            // Check if expert is available at this time in their timezone
            const dayRule = expert.availability?.find(a => a.dayOfWeek === expertDayOfWeek);

            if (dayRule && dayRule.isAvailable) {
                if (expertTimeStr >= dayRule.startTime && expertTimeStr < dayRule.endTime) {
                    // For a complete MVP, we should also check if currentSlot+duration < endTime
                    // We'll add the slot mapped to the user's local timezone
                    newAvailableTimes.push(format(currentSlot, 'HH:mm'));
                }
            }

            currentSlot = addMinutes(currentSlot, duration);
        }

        setAvailableTimes(newAvailableTimes);
    }, [selectedDate, expert, eventType]);

    const handleBooking = async (e) => {
        e.preventDefault();

        // MVP Check: Must be logged in to book for simplicity in this demo,
        // though true Calendly lets anyone book. Our backend currently requires a User ID for Bookings.
        if (!user) {
            alert("You must log in or register before booking. Redirecting to login...");
            navigate('/login');
            return;
        }

        if (!selectedDate || !selectedTime) {
            alert('Please select a date and time.');
            return;
        }

        setSubmitting(true);
        try {
            await axios.post('https://real-time-x3n3.onrender.com/api/bookings', {
                expertId: expert._id,
                email,
                name,
                phone,
                date: selectedDate,
                timeSlot: selectedTime,
                notes,
            }, {
                headers: { Authorization: `Bearer ${user.token}` }
            });

            setSuccess(true);
        } catch (err) {
            alert(err.response?.data?.message || 'Booking failed');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return <div className="flex justify-center py-32"><Loader2 className="w-12 h-12 animate-spin text-indigo-500" /></div>;
    }

    if (error || !expert || !eventType) {
        return (
            <div className="flex justify-center items-center py-32">
                <div className="bg-red-50 text-red-600 p-8 rounded-3xl text-center max-w-md w-full border border-red-100 shadow-sm">
                    <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <h2 className="text-xl font-bold mb-2">Unavailable</h2>
                    <p>{error}</p>
                    <button onClick={() => navigate('/')} className="mt-6 px-6 py-2 bg-white text-red-600 font-semibold rounded-xl hover:bg-red-50 transition shadow-sm border border-red-100">Go Home</button>
                </div>
            </div>
        );
    }

    // Generate dummy time slots for demo
    // const availableTimes = ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00'];

    if (success) {
        return (
            <div className="max-w-2xl mx-auto py-20 px-4 animate-in fade-in zoom-in-95 duration-500">
                <div className="bg-white rounded-3xl p-10 shadow-sm border border-slate-100 text-center">
                    <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="w-10 h-10" />
                    </div>
                    <h1 className="text-3xl font-extrabold text-slate-900 mb-4">You are scheduled</h1>
                    <p className="text-slate-600 mb-8 max-w-md mx-auto">
                        A calendar invitation has been sent to your email address.
                    </p>

                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 mb-8 text-left max-w-sm mx-auto">
                        <h3 className="font-bold text-slate-900 mb-4">{eventType.title}</h3>
                        <div className="space-y-3 text-sm text-slate-600">
                            <div className="flex items-center gap-3"><User className="w-4 h-4 text-slate-400" /> {expert.name}</div>
                            <div className="flex items-center gap-3"><Calendar className="w-4 h-4 text-slate-400" /> {selectedDate}</div>
                            <div className="flex items-center gap-3"><Clock className="w-4 h-4 text-slate-400" /> {selectedTime}</div>
                            <div className="flex items-center gap-3"><MapPin className="w-4 h-4 text-slate-400" /> {eventType.location}</div>
                        </div>
                    </div>

                    <button onClick={() => navigate('/my-bookings')} className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition">
                        View My Bookings
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto py-10 px-4">
            <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden flex flex-col md:flex-row min-h-[600px]">

                {/* Left side: Event Details */}
                <div className="w-full md:w-1/3 bg-slate-50 p-8 md:p-10 border-r border-slate-200 flex flex-col">
                    <h4 className="text-slate-500 font-bold tracking-wider uppercase text-xs mb-3">{expert.name}</h4>
                    <h1 className="text-3xl font-extrabold text-slate-900 mb-6">{eventType.title}</h1>

                    <div className="space-y-4 mb-8">
                        <div className="flex items-center gap-3 text-slate-600 font-medium">
                            <Clock className="w-5 h-5 text-slate-400" />
                            {eventType.duration} min
                        </div>
                        <div className="flex items-center gap-3 text-slate-600 font-medium">
                            <MapPin className="w-5 h-5 text-slate-400" />
                            {eventType.location}
                        </div>
                    </div>

                    <p className="text-slate-600 leading-relaxed mb-auto whitespace-pre-wrap">
                        {eventType.description || "Join me for this session."}
                    </p>
                </div>

                {/* Right side: Form & Selection */}
                <div className="w-full md:w-2/3 p-8 md:p-10 flex flex-col">
                    <h2 className="text-xl font-bold text-slate-900 mb-6">Select a Date & Time</h2>

                    {!selectedDate || !selectedTime ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-auto">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-3">Date</label>
                                <input
                                    type="date"
                                    min={new Date().toISOString().split('T')[0]}
                                    value={selectedDate}
                                    onChange={e => setSelectedDate(e.target.value)}
                                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-200 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-3">Time Slot</label>
                                <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-2">
                                    {availableTimes.map((t) => (
                                        <button
                                            key={t}
                                            disabled={!selectedDate}
                                            onClick={() => setSelectedTime(t)}
                                            className={`py-3 px-2 rounded-xl border text-sm font-bold transition-all ${!selectedDate ? 'opacity-50 cursor-not-allowed bg-slate-50 border-slate-200 text-slate-400' : selectedTime === t ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-indigo-100 text-indigo-600 hover:border-indigo-600 hover:bg-indigo-50'}`}
                                        >
                                            {t}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleBooking} className="space-y-5 animate-in slide-in-from-right-4 duration-300">

                            <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 flex justify-between items-center mb-6">
                                <div>
                                    <p className="text-sm text-slate-500 font-medium">Selected Slot</p>
                                    <p className="text-indigo-900 font-bold">{selectedDate} at {selectedTime}</p>
                                </div>
                                <button type="button" onClick={() => setSelectedTime('')} className="text-sm font-semibold text-indigo-600 hover:underline">Change</button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Name *</label>
                                    <input type="text" value={name} onChange={e => setName(e.target.value)} required className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-200 outline-none" />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email *</label>
                                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-200 outline-none" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Phone Number *</label>
                                <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} required placeholder="+1 (555) 000-0000" className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-200 outline-none" />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Please share anything that will help prepare for our meeting.</label>
                                <textarea value={notes} onChange={e => setNotes(e.target.value)} className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-200 outline-none h-24 resize-none" />
                            </div>

                            <button type="submit" disabled={submitting} className="w-full py-4 bg-indigo-600 text-white font-bold text-lg rounded-xl shadow-md hover:bg-indigo-700 transition flex items-center justify-center gap-2 mt-4">
                                {submitting ? <Loader2 className="w-6 h-6 animate-spin" /> : "Confirm Reservation"}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PublicBookingPage;
