import { useState, useEffect } from 'react';
import { Plus, Link as LinkIcon, Edit2, Trash2, Clock, MapPin, ExternalLink, Calendar as CalendarIcon, Loader2 } from 'lucide-react';
import useAuthStore from '../store/useAuthStore';
import axios from 'axios';
import { Link } from 'react-router-dom';

const ExpertDashboard = () => {
    const { user } = useAuthStore();
    const [eventTypes, setEventTypes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expertData, setExpertData] = useState(null);

    // Form states
    const [showModal, setShowModal] = useState(false);
    const [title, setTitle] = useState('');
    const [duration, setDuration] = useState(30);
    const [location, setLocation] = useState('Video Call');
    const [description, setDescription] = useState('');
    const [urlSlug, setUrlSlug] = useState('');
    const [bufferTime, setBufferTime] = useState(0);

    const [formLoading, setFormLoading] = useState(false);

    useEffect(() => {
        // Fetch expert ID from user email mapping (temporary MVP workaround)
        const initDashboard = async () => {
            try {
                // In full implementation, User holds an expert reference. For MVP, we search experts list for matching email/name.
                // Assuming we get the expert ID directly or create a quick mapping:
                const { data: experts } = await axios.get('http://localhost:5000/api/experts?limit=100');
                const matchedExpert = experts.find(e => e.name === user.name) || experts[0]; // Fallback to first expert for demo

                if (matchedExpert) {
                    setExpertData(matchedExpert);
                    setBufferTime(matchedExpert.bufferTime || 0);

                    const { data } = await axios.get(`http://localhost:5000/api/event-types/expert/${matchedExpert._id}`);
                    setEventTypes(data);
                }
            } catch (error) {
                console.error("Failed to load dashboard data", error);
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            initDashboard();
        }
    }, [user]);

    const handleCreateEvent = async (e) => {
        e.preventDefault();
        setFormLoading(true);
        try {
            const { data } = await axios.post('http://localhost:5000/api/event-types', {
                expertId: expertData._id,
                title, duration, location, description, urlSlug
            }, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            setEventTypes([...eventTypes, data]);
            setShowModal(false);
            resetForm();
        } catch (error) {
            console.error(error);
            alert("Failed to create event type");
        } finally {
            setFormLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this event type?')) return;
        try {
            await axios.delete(`http://localhost:5000/api/event-types/${id}`, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            setEventTypes(eventTypes.filter(et => et._id !== id));
        } catch (error) {
            console.error(error);
        }
    };

    const resetForm = () => {
        setTitle(''); setDuration(30); setLocation('Video Call'); setDescription(''); setUrlSlug('');
    };

    if (loading) {
        return <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-indigo-500" /></div>;
    }

    if (!expertData) {
        return <div className="text-center py-20 text-slate-500">You must be logged in as an Expert to view this dashboard.</div>;
    }

    const publicUrl = `http://localhost:5173/${expertData.username || `expert/${expertData._id}`}`;

    return (
        <div className="max-w-6xl mx-auto py-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Event Types</h1>
                    <p className="text-slate-500 flex items-center gap-2">
                        <LinkIcon className="w-4 h-4" />
                        Share your link: <a href={publicUrl} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline">{publicUrl}</a>
                    </p>
                </div>
                <div className="flex gap-4">
                    <button className="px-5 py-2.5 bg-white border border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition shadow-sm flex items-center gap-2" onClick={() => alert('Buffer time update coming soon')}>
                        <Clock className="w-4 h-4" /> Buffer Time: {bufferTime}m
                    </button>
                    <button onClick={() => setShowModal(true)} className="px-5 py-2.5 bg-indigo-600 text-white font-bold rounded-xl shadow-md hover:bg-indigo-700 transition flex items-center gap-2">
                        <Plus className="w-5 h-5" /> New Event Type
                    </button>
                </div>
            </div>

            {eventTypes.length === 0 ? (
                <div className="text-center py-20 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                    <CalendarIcon className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-slate-700 mb-2">No event types yet</h3>
                    <p className="text-slate-500 mb-6 max-w-sm mx-auto">Create event types (like a 15-min discovery call or 1-hour coaching session) so invitees can book time with you.</p>
                    <button onClick={() => setShowModal(true)} className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-sm hover:bg-indigo-700 transition inline-flex items-center gap-2">
                        <Plus className="w-5 h-5" /> Create Your First Event
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {eventTypes.map(event => (
                        <div key={event._id} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition group overflow-hidden relative">
                            <div className="absolute top-0 left-0 w-full h-1.5 bg-indigo-500"></div>
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="text-xl font-bold text-slate-900 group-hover:text-indigo-600 transition">{event.title}</h3>
                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition">
                                    <button onClick={() => handleDelete(event._id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                                </div>
                            </div>

                            <p className="text-slate-500 text-sm mb-6 line-clamp-2 min-h-[40px]">{event.description || 'No description provided.'}</p>

                            <div className="space-y-3 mb-6">
                                <div className="flex items-center text-sm font-medium text-slate-700 gap-3">
                                    <Clock className="w-4 h-4 text-slate-400" /> {event.duration} mins
                                </div>
                                <div className="flex items-center text-sm font-medium text-slate-700 gap-3">
                                    <MapPin className="w-4 h-4 text-slate-400" /> {event.location}
                                </div>
                            </div>

                            <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                                <span className="text-xs font-mono bg-slate-100 text-slate-600 px-2 py-1 rounded">/{event.urlSlug}</span>
                                <Link to={`/${expertData.username || `expert/${expertData._id}`}/${event.urlSlug}`} target="_blank" className="text-indigo-600 font-semibold text-sm hover:underline flex items-center gap-1">
                                    View Booking Page <ExternalLink className="w-3 h-3" />
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showModal && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-xl animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold">Add Event Type</h2>
                            <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 p-2 text-xl">&times;</button>
                        </div>

                        <form onSubmit={handleCreateEvent} className="space-y-5">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Event Name</label>
                                <input type="text" value={title} onChange={e => { setTitle(e.target.value); setUrlSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-')); }} placeholder="e.g. 30 Minute Interview" required className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-200 outline-none" />
                            </div>
                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Duration (mins)</label>
                                    <select value={duration} onChange={e => setDuration(Number(e.target.value))} className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-200 outline-none bg-white">
                                        <option value={15}>15</option>
                                        <option value={30}>30</option>
                                        <option value={45}>45</option>
                                        <option value={60}>60</option>
                                        <option value={90}>90</option>
                                        <option value={120}>120</option>
                                    </select>
                                </div>
                                <div className="flex-1">
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Location</label>
                                    <select value={location} onChange={e => setLocation(e.target.value)} className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-200 outline-none bg-white">
                                        <option value="Video Call">Video Call</option>
                                        <option value="Phone Call">Phone Call</option>
                                        <option value="In-Person">In-Person</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">URL Slug</label>
                                <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-indigo-200">
                                    <span className="bg-slate-50 text-slate-500 px-3 py-3 border-r border-slate-200 text-sm">/{expertData.username || 'expert'}/</span>
                                    <input type="text" value={urlSlug} onChange={e => setUrlSlug(e.target.value)} required placeholder="30min" className="w-full px-3 py-3 outline-none" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Description / Instructions</label>
                                <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Please prepare questions..." className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-200 outline-none h-24 resize-none" />
                            </div>
                            <button type="submit" disabled={formLoading} className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-md hover:bg-indigo-700 transition flex items-center justify-center gap-2">
                                {formLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Save Event Type"}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ExpertDashboard;
