import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiCalendar, FiMapPin, FiClock, FiCheckCircle, FiAlertCircle, FiLoader } from "react-icons/fi";
import Nav from '../components/Nav'; // Your Nav component
import bookingApi from '../api/bookingApi';
import useUser from '../../hooks/userInfo'; // Assuming you have this hook

const MyBookings = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { user } = useUser();

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                const response = await bookingApi.getMyBookings();
                // Handle response structure (response.data.data or response.data)
                setBookings(response.data.data || response.data);
            } catch (err) {
                console.error(err);
                setError("Failed to load your bookings.");
            } finally {
                setLoading(false);
            }
        };

        if (user) fetchBookings();
    }, [user]);

    // Helper: Color badge for status
    const getStatusColor = (status) => {
        switch (status) {
            case 'confirmed': return 'bg-green-100 text-green-700 border-green-200';
            case 'pending': return 'bg-amber-100 text-amber-700 border-amber-200';
            case 'cancelled': return 'bg-red-100 text-red-700 border-red-200';
            default: return 'bg-slate-100 text-slate-700 border-slate-200';
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            <Nav />

            <div className="max-w-6xl mx-auto px-4 py-12">
                <h1 className="text-3xl font-bold text-slate-900 mb-2">My Bookings</h1>
                <p className="text-slate-500 mb-8">Manage your upcoming and past trips.</p>

                {/* --- Loading State --- */}
                {loading && (
                    <div className="flex justify-center py-20">
                        <FiLoader className="animate-spin text-3xl text-indigo-600" />
                    </div>
                )}

                {/* --- Error State --- */}
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl flex items-center gap-2">
                        <FiAlertCircle /> {error}
                    </div>
                )}

                {/* --- Empty State --- */}
                {!loading && !error && bookings.length === 0 && (
                    <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-slate-200">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                            <FiCalendar size={24} />
                        </div>
                        <h3 className="text-lg font-bold text-slate-800">No bookings yet</h3>
                        <p className="text-slate-500 mb-6">Looks like you haven't booked any adventures yet.</p>
                        <Link to="/tours" className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition">
                            Explore Tours
                        </Link>
                    </div>
                )}

                {/* --- Bookings List --- */}
                <div className="space-y-6">
                    {bookings.map((booking) => (
                        <div key={booking._id} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col md:flex-row gap-6 transition hover:shadow-md">

                            {/* Image Section */}
                            <div className="w-full md:w-48 h-32 rounded-xl overflow-hidden bg-slate-100 shrink-0">
                                {booking.tour ? (
                                    <img
                                        src={booking.tour.coverImage}
                                        alt={booking.tour.title}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">Tour Unavailable</div>
                                )}
                            </div>

                            {/* Details Section */}
                            <div className="flex-1">
                                <div className="flex justify-between items-start">
                                    <div>
                                        {/* Status Badge */}
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase border ${getStatusColor(booking.status)}`}>
                                            {booking.status}
                                        </span>

                                        <h3 className="text-xl font-bold text-slate-900 mt-3">
                                            {booking.tour ? booking.tour.title : booking.tourName}
                                        </h3>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-2xl font-bold text-slate-900">${booking.totalAmount}</p>
                                        <p className="text-xs text-slate-500">{booking.guestSize} Guests</p>
                                    </div>
                                </div>

                                <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-slate-500">
                                    <span className="flex items-center gap-1">
                                        <FiCalendar className="text-indigo-500" />
                                        {new Date(booking.bookAt).toLocaleDateString('en-US', { dateStyle: 'long' })}
                                    </span>
                                    {booking.tour && (
                                        <span className="flex items-center gap-1">
                                            <FiMapPin className="text-indigo-500" />
                                            {booking.tour.destinationCity}
                                        </span>
                                    )}
                                    <span className="flex items-center gap-1">
                                        {booking.paymentStatus === 'paid' ? (
                                            <span className="text-emerald-600 font-bold flex items-center gap-1"><FiCheckCircle /> Paid</span>
                                        ) : (
                                            <span className="text-amber-600 font-bold flex items-center gap-1"><FiAlertCircle /> Payment Pending</span>
                                        )}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default MyBookings;