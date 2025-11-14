import React, { useState } from 'react';
import { Link } from 'react-router-dom';

function Dashboard() {
    const [sortBy, setSortBy] = useState('price');
    const [sortOrder, setSortOrder] = useState('asc');
    const [cartCount, setCartCount] = useState(0);

    // Demo tours data
    const [tours] = useState([
        {
            id: 1,
            title: 'Paris Adventure',
            location: 'Paris, France',
            price: 1200,
            date: '2024-06-15',
            imageUrl: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=400',
            rating: 4.5,
            duration: '5 days'
        },
        {
            id: 2,
            title: 'Tokyo Explorer',
            location: 'Tokyo, Japan',
            price: 1500,
            date: '2024-07-01',
            imageUrl: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400',
            rating: 4.8,
            duration: '7 days'
        },
        {
            id: 3,
            title: 'Bali Retreat',
            location: 'Bali, Indonesia',
            price: 900,
            date: '2024-05-20',
            imageUrl: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400',
            rating: 4.6,
            duration: '6 days'
        }
    ]);

    const sortedTours = [...tours].sort((a, b) => {
        let comparison = 0;
        if (sortBy === 'price') {
            comparison = a.price - b.price;
        } else if (sortBy === 'location') {
            comparison = a.location.localeCompare(b.location);
        } else if (sortBy === 'date') {
            comparison = new Date(a.date) - new Date(b.date);
        }
        return sortOrder === 'asc' ? comparison : -comparison;
    });

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Top Navbar */}
            <nav className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
                <div className="flex items-center justify-between px-6 py-4">
                    {/* Logo */}
                    <div className="flex items-center gap-2">
                        <svg className="w-8 h-8 text-slate-900" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                        </svg>
                        <span className="text-xl font-bold text-slate-900">WanderGo</span>
                    </div>

                    {/* Center Nav Links */}
                    <div className="hidden md:flex items-center gap-6">
                        <Link to="/dashboard" className="text-sm font-medium text-slate-900 hover:text-slate-700">Home</Link>
                        <Link to="/tours" className="text-sm font-medium text-slate-600 hover:text-slate-900">Tours</Link>
                        <Link to="/bookings" className="text-sm font-medium text-slate-600 hover:text-slate-900">My Bookings</Link>
                        <Link to="/profile" className="text-sm font-medium text-slate-600 hover:text-slate-900">Profile</Link>
                    </div>

                    {/* Cart */}
                    <button className="relative p-2 hover:bg-slate-100 rounded-lg transition">
                        <svg className="w-6 h-6 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        {cartCount > 0 && (
                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {cartCount}
              </span>
                        )}
                    </button>
                </div>
            </nav>

            <div className="flex">
                {/* Left Sidebar */}
                <aside className="hidden lg:block w-64 bg-white border-r border-slate-200 min-h-[calc(100vh-73px)] p-6">
                    <div className="space-y-6">
                        {/* Filters Section */}
                        <div>
                            <h3 className="text-sm font-semibold text-slate-900 mb-3">Filters</h3>
                            <div className="space-y-3">
                                <div>
                                    <label className="text-xs font-medium text-slate-600 block mb-1">Price Range</label>
                                    <input type="range" min="0" max="3000" className="w-full" />
                                    <div className="flex justify-between text-xs text-slate-500 mt-1">
                                        <span>$0</span>
                                        <span>$3000</span>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-slate-600 block mb-1">Duration</label>
                                    <select className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-slate-900/10">
                                        <option>Any duration</option>
                                        <option>1-3 days</option>
                                        <option>4-7 days</option>
                                        <option>7+ days</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-slate-600 block mb-2">Tour Type</label>
                                    <div className="space-y-2">
                                        <label className="flex items-center text-sm text-slate-700">
                                            <input type="checkbox" className="mr-2 rounded" />
                                            Adventure
                                        </label>
                                        <label className="flex items-center text-sm text-slate-700">
                                            <input type="checkbox" className="mr-2 rounded" />
                                            Cultural
                                        </label>
                                        <label className="flex items-center text-sm text-slate-700">
                                            <input type="checkbox" className="mr-2 rounded" />
                                            Beach
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Quick Links */}
                        <div className="pt-6 border-t border-slate-200">
                            <h3 className="text-sm font-semibold text-slate-900 mb-3">Quick Links</h3>
                            <div className="space-y-2">
                                <Link to="/wishlist" className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                    </svg>
                                    Wishlist
                                </Link>
                                <Link to="/support" className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Support
                                </Link>
                            </div>
                        </div>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 p-6">
                    {/* Sort Options */}
                    <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6 flex flex-wrap items-center gap-4">
                        <span className="text-sm font-medium text-slate-700">Sort by:</span>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="text-sm border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-slate-900/10"
                        >
                            <option value="price">Price</option>
                            <option value="location">Location</option>
                            <option value="date">Date</option>
                        </select>
                        <button
                            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                            className="flex items-center gap-2 text-sm font-medium text-slate-700 hover:text-slate-900"
                        >
                            {sortOrder === 'asc' ? '↑ Ascending' : '↓ Descending'}
                        </button>
                        <span className="ml-auto text-sm text-slate-500">{tours.length} tours found</span>
                    </div>

                    {/* Tour Cards Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {sortedTours.map((tour) => (
                            <div key={tour.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-lg transition group">
                                <div className="relative h-48 overflow-hidden">
                                    <img src={tour.imageUrl} alt={tour.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                                    <button className="absolute top-3 right-3 p-2 bg-white/90 rounded-full hover:bg-white transition">
                                        <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                        </svg>
                                    </button>
                                </div>
                                <div className="p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs font-medium text-slate-500">{tour.location}</span>
                                        <div className="flex items-center gap-1">
                                            <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                            </svg>
                                            <span className="text-sm font-medium text-slate-700">{tour.rating}</span>
                                        </div>
                                    </div>
                                    <h3 className="text-lg font-semibold text-slate-900 mb-2">{tour.title}</h3>
                                    <div className="flex items-center gap-4 text-xs text-slate-500 mb-3">
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                        {new Date(tour.date).toLocaleDateString()}
                    </span>
                                        <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                                            {tour.duration}
                    </span>
                                    </div>
                                    <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                                        <div>
                                            <span className="text-xs text-slate-500">From</span>
                                            <p className="text-xl font-bold text-slate-900">${tour.price}</p>
                                        </div>
                                        <button
                                            onClick={() => setCartCount(cartCount + 1)}
                                            className="px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition"
                                        >
                                            Add to Cart
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </main>
            </div>
        </div>
    );
}

export default Dashboard;
