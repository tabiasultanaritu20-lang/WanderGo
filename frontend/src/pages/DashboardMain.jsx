import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Nav from '../components/Nav.jsx';
import Dashboard from '../components/Dashboard.jsx';
import tourApi from '../api/tourApi'; // Ensure this path is correct

// Helper to safely parse duration
const getDurationNumber = (duration) => {
    if (typeof duration === 'number') return duration;
    if (typeof duration === 'string') {
        const match = duration.match(/(\d+)/);
        return match ? parseInt(match[1], 10) : 0;
    }
    return 0;
};

function MainDash() {
    // --- Global State ---
    const [tours, setTours] = useState([]); // Initialize as empty array
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [cartCount, setCartCount] = useState(0);
    const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

    // --- Navigation ---
    const navigate = useNavigate();

    // --- Sorting State ---
    const [sortBy, setSortBy] = useState('price');
    const [sortOrder, setSortOrder] = useState('asc');

    // --- Filtering State ---
    const [priceRange, setPriceRange] = useState(5000);
    const [durationFilter, setDurationFilter] = useState('any');
    const [tourTypesFilter, setTourTypesFilter] = useState([]);

    // --- Fetch Data from API (Updated) ---
    useEffect(() => {
        const fetchTours = async () => {
            try {
                setLoading(true);
                const response = await tourApi.getAll();

                // DEBUG: Inspect this in Chrome Console > Console tab
                console.log("API RAW RESPONSE:", response);

                let tourArray = [];

                // ATTEMPT 1: Is the response.data itself the array?
                if (Array.isArray(response.data)) {
                    tourArray = response.data;
                }
                // ATTEMPT 2: Standard MERN (response.data.data.tours)
                else if (response.data?.data?.tours && Array.isArray(response.data.data.tours)) {
                    tourArray = response.data.data.tours;
                }
                // ATTEMPT 3: Natours style (response.data.tours)
                else if (response.data?.tours && Array.isArray(response.data.tours)) {
                    tourArray = response.data.tours;
                }
                // ATTEMPT 4: Generic data wrapper (response.data.data)
                else if (response.data?.data && Array.isArray(response.data.data)) {
                    tourArray = response.data.data;
                }

                console.log("EXTRACTED TOURS:", tourArray); // Verify what we extracted
                setTours(tourArray);
                setError(null);

            } catch (err) {
                console.error("Error fetching tours:", err);
                setError("Failed to load tours. Please try again later.");
                setTours([]); // Safety fallback
            } finally {
                setLoading(false);
            }
        };

        fetchTours();
    }, []);

    // --- Callbacks ---
    const handleAddToCart = useCallback((e) => {
        if(e) e.stopPropagation();
        setCartCount(prev => prev + 1);
        console.log("Tour added to cart.");
    }, []);

    const handleSortOrderToggle = useCallback(() => {
        setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    }, []);

    const handleMobileFilterToggle = useCallback(() => {
        setIsMobileFilterOpen(prev => !prev);
    }, []);

    const handleTourClick = useCallback((id) => {
        navigate(`/tours/${id}`);
    }, [navigate]);

    // --- Combined Filtering and Sorting Logic ---
    const filteredAndSortedTours = useMemo(() => {
        // SAFETY CHECK: This prevents the "tours.filter is not a function" crash
        if (!Array.isArray(tours)) {
            return [];
        }

        // 1. Filtering
        const filteredTours = tours.filter(tour => {
            // Safety check for missing price
            const price = tour.price || 0;
            if (price > priceRange) return false;

            // Filter by Tour Type
            if (tourTypesFilter.length > 0) {
                // Check if tour.type exists, otherwise exclude or include based on logic
                if (!tour.type || !tourTypesFilter.includes(tour.type)) {
                    return false;
                }
            }

            // Filter by Duration
            if (durationFilter !== 'any') {
                const tourDuration = getDurationNumber(tour.duration);
                let durationCheck = false;

                if (durationFilter === 'short' && tourDuration >= 1 && tourDuration <= 3) durationCheck = true;
                else if (durationFilter === 'medium' && tourDuration >= 4 && tourDuration <= 7) durationCheck = true;
                else if (durationFilter === 'long' && tourDuration > 7) durationCheck = true;

                if (!durationCheck) return false;
            }

            return true;
        });

        // 2. Sorting
        return filteredTours.sort((a, b) => {
            let comparison = 0;
            if (sortBy === 'price') {
                comparison = (a.price || 0) - (b.price || 0);
            } else if (sortBy === 'location') {
                const locA = a.location || '';
                const locB = b.location || '';
                comparison = locA.localeCompare(locB);
            } else if (sortBy === 'date') {
                // Handle missing dates or startDates array
                const dateA = a.date || (a.startDates ? a.startDates[0] : Date.now());
                const dateB = b.date || (b.startDates ? b.startDates[0] : Date.now());
                comparison = new Date(dateA).getTime() - new Date(dateB).getTime();
            }
            return sortOrder === 'asc' ? comparison : -comparison;
        });
    }, [tours, sortBy, sortOrder, priceRange, durationFilter, tourTypesFilter]);

    // --- Render ---

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="text-xl text-blue-600 font-semibold animate-pulse">Loading Tours...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="text-red-500 font-semibold">{error}</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            <Nav cartCount={cartCount} />
            <Dashboard
                // Tour Data
                sortedTours={filteredAndSortedTours}
                totalToursCount={filteredAndSortedTours.length}

                // Sorting Props
                sortBy={sortBy}
                setSortBy={setSortBy}
                sortOrder={sortOrder}
                handleSortOrderToggle={handleSortOrderToggle}

                // Filtering Props
                priceRange={priceRange}
                setPriceRange={setPriceRange}
                duration={durationFilter}
                setDuration={setDurationFilter}
                tourTypes={tourTypesFilter}
                setTourTypes={setTourTypesFilter}

                // Action Handlers
                handleAddToCart={handleAddToCart}
                onTourClick={handleTourClick}

                isMobileFilterOpen={isMobileFilterOpen}
                handleMobileFilterToggle={handleMobileFilterToggle}
            />
        </div>
    );
}

export default MainDash;