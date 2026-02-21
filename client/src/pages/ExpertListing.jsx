import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Search, Filter, Star, Briefcase, ChevronLeft, ChevronRight, Loader2, User } from 'lucide-react';

const ExpertListing = () => {
    const [experts, setExperts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Pagination & Filters
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('');
    const limit = 6;

    const categories = ['', 'Therapy', 'Career Coaching', 'Fitness Mentor', 'Consulting'];

    const fetchExperts = async () => {
        try {
            setLoading(true);
            setError(null);
            const res = await axios.get(`https://real-time-x3n3.onrender.com/api/experts`, {
                params: { page, limit, search, category }
            });
            setExperts(res.data.experts);
            setTotalPages(res.data.totalPages);
        } catch (err) {
            setError('Failed to fetch experts. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            setPage(1);
            fetchExperts();
        }, 500);
        return () => clearTimeout(timer);
    }, [search, category]);

    useEffect(() => {
        if (!search && !category) {
            fetchExperts();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page]);

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Search experts by name..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                    />
                </div>
                <div className="relative w-full md:w-64">
                    <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 appearance-none rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all bg-white"
                    >
                        <option value="">All Categories</option>
                        {categories.slice(1).map(c => (
                            <option key={c} value={c}>{c}</option>
                        ))}
                    </select>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
                </div>
            ) : error ? (
                <div className="bg-red-50 text-red-600 p-6 rounded-2xl border border-red-100 text-center">
                    <p className="font-medium">{error}</p>
                    <button onClick={fetchExperts} className="mt-4 px-4 py-2 bg-red-100 hover:bg-red-200 rounded-lg text-sm font-semibold transition-colors">Retry</button>
                </div>
            ) : experts.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl border border-slate-100 shadow-sm">
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Search className="w-8 h-8 text-slate-400" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-700">No experts found</h3>
                    <p className="text-slate-500 mt-2">Try adjusting your search or filters.</p>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {experts.map(expert => (
                            <div key={expert._id} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow group flex flex-col">
                                <div className="flex justify-between items-start mb-4">
                                    <h3 className="text-xl font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">
                                        {expert.name}
                                    </h3>
                                    <div className="flex items-center gap-1 bg-amber-50 text-amber-600 px-2 py-1 rounded-md text-sm font-bold">
                                        <Star className="w-4 h-4 fill-amber-500" />
                                        <span>{expert.rating}</span>
                                    </div>
                                </div>

                                <div className="space-y-3 flex-grow text-slate-600 border-b border-slate-100 pb-4 mb-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                                            <User className="w-4 h-4" />
                                        </div>
                                        <span className="font-medium">{expert.category}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
                                            <Briefcase className="w-4 h-4" />
                                        </div>
                                        <span>{expert.experience} years experience</span>
                                    </div>
                                </div>

                                <Link
                                    to={`/expert/${expert._id}`}
                                    className="w-full text-center bg-indigo-50 hover:bg-indigo-600 hover:text-white text-indigo-600 font-semibold py-3 rounded-xl transition-all"
                                >
                                    View Availability
                                </Link>
                            </div>
                        ))}
                    </div>

                    {totalPages > 1 && (
                        <div className="flex justify-center items-center gap-4 mt-12">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <span className="text-sm font-medium text-slate-600">
                                Page {page} of {totalPages}
                            </span>
                            <button
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default ExpertListing;
