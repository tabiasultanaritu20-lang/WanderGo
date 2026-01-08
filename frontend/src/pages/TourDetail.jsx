import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    FiMapPin, FiCalendar, FiClock, FiUsers, FiStar,
    FiCheckCircle, FiXCircle, FiArrowLeft, FiShare2, FiHeart
} from 'react-icons/fi';
import tourApi from '../api/tourApi';
import Nav from '../components/Nav';

export default function TourDetail() {
    const { id } = useParams();
    const navigate = useNavigate(); // This is used for navigation

    const [tour, setTour] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch Tour Data
    useEffect(() => {
        const fetchTour = async () => {
            try {
                const response = await tourApi.getById(id);
                setTour(response.data.data);
            } catch (err) {
                console.error(err);
                setError("Failed to load tour details.");
            } finally {
                setLoading(false);
            }
        };
        fetchTour();
    }, [id]);

    if (loading) return <div className="h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-16 w-16 border-t-4 border-indigo-600"></div></div>;
    if (error || !tour) return <div className="h-screen flex items-center justify-center text-red-500">{error || "Tour not found"}</div>;

    // Helper to format dates
    const formatDate = (date) => new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    // Calculate Duration
    const durationDays = Math.ceil(Math.abs(new Date(tour.endDate) - new Date(tour.startDate)) / (1000 * 60 * 60 * 24));

    return (
        <div className="bg-slate-50 min-h-screen font-sans">
            <Nav />

            {/* --- HERO HEADER --- */}
            <div className="bg-white border-b border-slate-200 pb-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
                    {/* Back Button */}
                    <button onClick={() => navigate(-1)} className="flex items-center text-slate-500 hover:text-indigo-600 mb-6 transition">
                        <FiArrowLeft className="mr-2" /> Back to Tours
                    </button>

                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">{tour.category}</span>
                                <span className="flex items-center text-amber-500 font-bold text-sm">
                                    <FiStar className="fill-current mr-1" /> {tour.ratingsAverage} ({tour.ratingsQuantity} reviews)
                                </span>
                            </div>
                            <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 leading-tight">{tour.title}</h1>
                            <div className="flex items-center text-slate-500 mt-3 text-lg">
                                <FiMapPin className="mr-2" /> {tour.destinationCity}, {tour.destinationCountry}
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button className="p-3 rounded-full border border-slate-200 hover:bg-slate-50 text-slate-600"><FiShare2 /></button>
                            <button className="p-3 rounded-full border border-slate-200 hover:bg-slate-50 text-slate-600"><FiHeart /></button>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- CONTENT GRID --- */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* LEFT COLUMN (Details) */}
                    <div className="lg:col-span-2 space-y-8">

                        {/* Main Image */}
                        <div className="rounded-3xl overflow-hidden shadow-sm h-[400px]">
                            <img src={tour.coverImage} alt={tour.title} className="w-full h-full object-cover" />
                        </div>

                        {/* Gallery Grid */}
                        {tour.images && tour.images.length > 0 && (
                            <div className="grid grid-cols-4 gap-4">
                                {tour.images.slice(0, 4).map((img, index) => (
                                    <img key={index} src={img} alt={`Gallery ${index}`} className="rounded-xl h-24 w-full object-cover border border-slate-100" />
                                ))}
                            </div>
                        )}

                        {/* Overview */}
                        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                            <h2 className="text-2xl font-bold text-slate-900 mb-4">Overview</h2>
                            <p className="text-slate-600 leading-relaxed whitespace-pre-line">{tour.description}</p>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-8 pt-8 border-t border-slate-100">
                                <div>
                                    <span className="block text-slate-400 text-xs font-bold uppercase mb-1">Duration</span>
                                    <span className="flex items-center gap-2 font-bold text-slate-800"><FiClock className="text-indigo-500"/> {durationDays} Days</span>
                                </div>
                                <div>
                                    <span className="block text-slate-400 text-xs font-bold uppercase mb-1">Group Size</span>
                                    <span className="flex items-center gap-2 font-bold text-slate-800"><FiUsers className="text-indigo-500"/> Max {tour.maxGroupSize}</span>
                                </div>
                                <div>
                                    <span className="block text-slate-400 text-xs font-bold uppercase mb-1">Difficulty</span>
                                    <span className="font-bold text-slate-800">{tour.difficulty}</span>
                                </div>
                                <div>
                                    <span className="block text-slate-400 text-xs font-bold uppercase mb-1">Start Date</span>
                                    <span className="flex items-center gap-2 font-bold text-slate-800"><FiCalendar className="text-indigo-500"/> {formatDate(tour.startDate)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Itinerary */}
                        {tour.itinerary && tour.itinerary.length > 0 && (
                            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                                <h2 className="text-2xl font-bold text-slate-900 mb-6">Itinerary</h2>
                                <div className="space-y-8 border-l-2 border-indigo-100 ml-3 pl-8 relative">
                                    {tour.itinerary.map((day, idx) => (
                                        <div key={idx} className="relative">
                                            <span className="absolute -left-[41px] top-0 h-6 w-6 rounded-full bg-indigo-600 border-4 border-white shadow-sm"></span>
                                            <h3 className="font-bold text-lg text-slate-800 mb-2">Day {day.day}: {day.title}</h3>
                                            <p className="text-slate-600">{day.description}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* RIGHT COLUMN (Booking Sidebar) */}
                    <div className="lg:col-span-1">
                        <div className="bg-white p-6 rounded-3xl shadow-lg border border-slate-100 sticky top-24">
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <span className="text-3xl font-bold text-slate-900">${tour.pricePerPerson}</span>
                                    <span className="text-slate-500 text-sm"> / person</span>
                                </div>
                                <div className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-lg text-xs font-bold uppercase">Available</div>
                            </div>

                            <div className="space-y-4 mb-6">
                                <div className="p-4 bg-slate-50 rounded-xl flex justify-between items-center border border-slate-100">
                                    <span className="text-slate-500 text-sm font-medium">Start Date</span>
                                    <span className="font-bold text-slate-800">{formatDate(tour.startDate)}</span>
                                </div>
                                <div className="p-4 bg-slate-50 rounded-xl flex justify-between items-center border border-slate-100">
                                    <span className="text-slate-500 text-sm font-medium">Agency</span>
                                    <span className="font-bold text-slate-800 truncate max-w-[150px]">{tour.agency?.name || "Verified Agency"}</span>
                                </div>
                            </div>

                            {/* Inclusions Preview */}
                            <div className="mb-6">
                                <h4 className="font-bold text-sm text-slate-900 mb-3">Includes:</h4>
                                <ul className="space-y-2">
                                    {tour.inclusions?.slice(0,3).map((inc, i) => (
                                        <li key={i} className="flex items-center gap-2 text-sm text-slate-600">
                                            <FiCheckCircle className="text-emerald-500 flex-shrink-0" /> {inc}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* --- BUTTON UPDATE HERE --- */}
                            <button
                                onClick={() => navigate(`/tours/${id}/book`)}
                                className="w-full py-4 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:scale-[1.02] transition-all"
                            >
                                Book Now
                            </button>
                            {/* ------------------------- */}

                            <p className="text-center text-xs text-slate-400 mt-4">No credit card required for inquiry</p>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}