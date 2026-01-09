import React from 'react';
import { Star, Filter, Heart, MapPin, Clock } from 'lucide-react';
import FilterSidebar from '../components/SideBar.jsx';

function Dashboard({
                       sortedTours,
                       totalToursCount,
                       sortBy,
                       setSortBy,
                       sortOrder,
                       handleSortOrderToggle,
                       isMobileFilterOpen,
                       handleMobileFilterToggle,
                       handleAddToCart,
                       // 1. New Prop for Navigation
                       onTourClick,

                       // Filter Props
                       priceRange, setPriceRange,
                       duration, setDuration,
                       tourTypes, setTourTypes
                   }) {

    const filterProps = { priceRange, setPriceRange, duration, setDuration, tourTypes, setTourTypes };

    return (
        <div className="flex">
            {/* Left Sidebar - Desktop */}
            <aside className="hidden lg:block w-64 xl:w-72 bg-white border-r border-slate-200 min-h-[calc(100vh-80px)] shadow-inner">
                <FilterSidebar {...filterProps} />
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-4 sm:p-6 lg:p-8">
                {/* Header and Sort Options */}
                <div className="bg-white rounded-xl shadow-md border border-slate-100 p-4 mb-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">

                        {/* Sort Controls */}
                        <div className="flex flex-wrap items-center gap-4">
                            <span className="text-sm font-semibold text-slate-700">Sort by:</span>
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="text-sm border border-slate-300 rounded-lg px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                            >
                                <option value="price">Price</option>
                                <option value="location">Location</option>
                                <option value="date">Date</option>
                            </select>
                            <button
                                onClick={handleSortOrderToggle}
                                className="flex items-center gap-1 text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition py-2"
                            >
                                {sortOrder === 'asc' ? '↑ Ascending' : '↓ Descending'}
                            </button>
                        </div>

                        {/* Mobile Filter Toggle */}
                        <div className="flex items-center gap-4 w-full sm:w-auto">
                            <span className="ml-auto sm:ml-0 text-sm font-medium text-slate-500">{totalToursCount} tours found</span>
                            <button
                                onClick={handleMobileFilterToggle}
                                className="lg:hidden p-2 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 transition"
                            >
                                <Filter className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Filter Drawer */}
                {isMobileFilterOpen && (
                    <div id="mobile-filter-drawer" className="lg:hidden bg-white rounded-xl shadow-xl border border-slate-200 mb-6 transition-all duration-300 ease-in-out">
                        <FilterSidebar {...filterProps} />
                    </div>
                )}

                {/* Tour Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
                    {(sortedTours || []).map((tour) => {
                        // Handle MongoDB _id vs Dummy Data id
                        const tourId = tour._id || tour.id;
                        // Handle different image field names (API often uses imageCover)
                        const tourImage = tour.imageCover || tour.imageUrl;

                        return (
                            <div
                                key={tourId}
                                // 2. Add Click Handler for Navigation
                                onClick={() => onTourClick(tourId)}
                                className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-lg transition duration-300 hover:shadow-2xl hover:scale-[1.02] group cursor-pointer"
                            >
                                {/* Image Area */}
                                <div className="relative h-48 overflow-hidden">
                                    <img
                                        src={tourImage}
                                        alt={tour.title}
                                        className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                                        onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/400x250/94A3B8/FFFFFF?text=Image+Unavailable" }}
                                    />
                                    <span className="absolute top-3 left-3 bg-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
                                        {tour.type || 'General'}
                                    </span>

                                    {/* Wishlist Button - Prevent Navigation on Click */}
                                    <button
                                        className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-md hover:bg-red-500 hover:text-white transition duration-300"
                                        title="Add to Wishlist"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            // Add wishlist logic here later
                                            console.log("Added to wishlist");
                                        }}
                                    >
                                        <Heart className="w-5 h-5 text-slate-600 group-hover:text-red-500 transition duration-300" />
                                    </button>
                                </div>

                                {/* Content */}
                                <div className="p-5">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-medium text-slate-500 flex items-center gap-1">
                                            <MapPin className="w-4 h-4 text-indigo-400" />
                                            {tour.location}
                                        </span>
                                        <div className="flex items-center gap-1">
                                            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                            <span className="text-sm font-bold text-slate-800">{tour.ratingsAverage || tour.rating || 4.5}</span>
                                        </div>
                                    </div>

                                    <h3 className="text-xl font-bold text-slate-900 mb-3 line-clamp-2">{tour.title}</h3>

                                    {/* Details */}
                                    <div className="flex items-center gap-4 text-sm text-slate-500 mb-4">
                                        <span className="flex items-center gap-1">
                                            <Clock className="w-4 h-4" />
                                            {tour.duration} {typeof tour.duration === 'number' ? 'days' : ''}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            {/* Date Logic: Handle if API date is string or Date object */}
                                            {tour.startDates && tour.startDates[0]
                                                ? new Date(tour.startDates[0]).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                                                : 'Available Now'
                                            }
                                        </span>
                                    </div>

                                    {/* Price and Action */}
                                    <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                                        <div>
                                            <span className="text-sm text-slate-500">Starting From</span>
                                            <p className="text-2xl font-extrabold text-indigo-600">${tour.price}</p>
                                        </div>

                                        {/* Book Button - Prevent Navigation on Click */}
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation(); // Stop bubbling to the div
                                                handleAddToCart(e);
                                            }}
                                            className="px-6 py-3 bg-indigo-600 text-white text-base font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition duration-300 transform hover:scale-105"
                                        >
                                            Book Now
                                        </button>
                                    </div>
                                    <button
                                        onClick={() => {
                                          const item = {
                                            kind: 'tour',
                                            id: tour.id,
                                            title: tour.title,
                                            price: tour.price,
                                            imageUrl: tour.imageUrl,
                                            city: tour.location.split(',')[0] || '',
                                            country: (tour.location.split(',')[1] || '').trim(),
                                          };
                                          handleAddToCart(item);
                                        }}
                                        className="px-6 py-3 bg-indigo-600 text-white text-base font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition duration-300 transform hover:scale-105"
                                    >
                                        Book Now
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </main>
        </div>
    );
}

export default Dashboard;
