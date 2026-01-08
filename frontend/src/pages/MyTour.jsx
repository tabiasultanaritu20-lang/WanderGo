import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
    MapPin,
    Calendar,
    DollarSign,
    Edit2,
    Trash2,
    Plus,
    AlertCircle,
    Search
} from 'lucide-react';
import tourApi from '../api/tourApi'; // Adjust path as needed
import { toast } from 'react-hot-toast'; // Optional: for notifications

export default function AgencyTours() {
    const [tours, setTours] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // --- Fetch Tours on Mount ---
    useEffect(() => {
        fetchMyTours();
    }, []);

    const fetchMyTours = async () => {
        try {
            setLoading(true);
            const response = await tourApi.getMyTours();
            // Adjust depending on if backend returns { data: [...] } or { data: { data: [...] } }
            // Based on previous patterns, it's usually response.data.data
            setTours(response.data.data || response.data);
        } catch (error) {
            console.error("Failed to fetch agency tours:", error);
            toast.error("Failed to load your tours.");
        } finally {
            setLoading(false);
        }
    };

    // --- Handle Delete ---
    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this tour? This action cannot be undone.")) {
            return;
        }

        try {
            await tourApi.remove(id);
            // Update UI immediately by removing the deleted tour from state
            setTours(prev => prev.filter(tour => tour._id !== id && tour.id !== id));
            toast.success("Tour deleted successfully");
        } catch (error) {
            console.error("Delete failed:", error);
            toast.error("Failed to delete tour");
        }
    };

    // --- Helper for Date Formatting ---
    const formatDate = (dateString) => {
        if (!dateString) return 'TBD';
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric'
        });
    };

    // --- Client Side Filter ---
    const filteredTours = tours.filter(tour =>
        tour.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tour.destinationCity?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 font-sans p-6 lg:p-10">

            {/* --- Header Section --- */}
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900">My Tours</h1>
                    <p className="text-slate-500 mt-1">Manage all the tours you have created.</p>
                </div>

                <Link
                    to="/create-tour"
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 rounded-xl font-bold transition shadow-lg shadow-indigo-200"
                >
                    <Plus className="w-5 h-5" /> Create New Tour
                </Link>
            </div>

            {/* --- Search Bar --- */}
            {tours.length > 0 && (
                <div className="max-w-7xl mx-auto mb-8">
                    <div className="relative">
                        <Search className="absolute left-4 top-3.5 text-slate-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search by title or city..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm"
                        />
                    </div>
                </div>
            )}

            {/* --- Empty State --- */}
            {!loading && tours.length === 0 && (
                <div className="max-w-7xl mx-auto text-center py-20 bg-white rounded-3xl border border-slate-200 shadow-sm">
                    <div className="bg-indigo-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <AlertCircle className="w-10 h-10 text-indigo-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800 mb-2">No Tours Found</h2>
                    <p className="text-slate-500 mb-8">You haven't created any tours yet.</p>
                    <Link to="/create-tour" className="text-indigo-600 font-bold hover:underline">
                        Start creating your first tour
                    </Link>
                </div>
            )}

            {/* --- Tours Grid --- */}
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTours.map((tour) => (
                    <div key={tour._id || tour.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow flex flex-col">

                        {/* Image Header */}
                        <div className="h-48 relative bg-slate-200">
                            <img
                                src={tour.coverImage || tour.imageCover}
                                alt={tour.title}
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-slate-700 uppercase tracking-wide">
                                {tour.category || 'General'}
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-5 flex-1 flex flex-col">
                            <h3 className="text-xl font-bold text-slate-900 mb-2 line-clamp-1">{tour.title}</h3>

                            <div className="space-y-2 mb-6">
                                <div className="flex items-center text-slate-500 text-sm">
                                    <MapPin className="w-4 h-4 mr-2 text-indigo-500" />
                                    <span className="truncate">{tour.destinationCity}, {tour.destinationCountry}</span>
                                </div>
                                <div className="flex items-center text-slate-500 text-sm">
                                    <Calendar className="w-4 h-4 mr-2 text-indigo-500" />
                                    <span>{formatDate(tour.startDate)}</span>
                                </div>
                                <div className="flex items-center text-slate-500 text-sm">
                                    <DollarSign className="w-4 h-4 mr-2 text-indigo-500" />
                                    <span>${tour.pricePerPerson} / person</span>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="mt-auto pt-4 border-t border-slate-100 flex gap-3">
                                {/* Edit Button */}
                                {/* Ensure you have a route like /create-tour?edit=ID or /tours/edit/:id */}
                                <Link
                                    to={`/tours/${tour._id}/edit`}
                                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 transition"
                                >
                                    <Edit2 className="w-4 h-4" /> Edit
                                </Link>

                                {/* Delete Button */}
                                <button
                                    type="button" // 1. Prevents form submission if inside a form
                                    onClick={(e) => {
                                        e.preventDefault();  // 2. Stops link navigation (if inside a Link)
                                        e.stopPropagation(); // 3. Stops "Card Click" events (if the whole card is clickable)
                                        handleDelete(tour._id || tour.id);
                                    }}
                                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border border-red-100 text-red-600 bg-red-50 font-bold text-sm hover:bg-red-100 transition"
                                >
                                    <Trash2 className="w-4 h-4" /> Delete
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}