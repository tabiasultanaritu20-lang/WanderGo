import React, { useState, useCallback, useMemo } from 'react';
import Dashboard from '../components/Dashboard.jsx'; // Assuming Dashboard.jsx is defined elsewhere

// Demo tours data - kept in the root for central state management
const initialTours = [
    {
        id: 1,
        title: 'Paris Adventure: Eiffel Tower & Louvre',
        location: 'Paris, France',
        price: 1200,
        date: '2024-06-15',
        imageUrl: 'https://placehold.co/400x250/2563EB/FFFFFF?text=Paris+Adventure',
        rating: 4.5,
        duration: '5 days',
        type: 'Cultural'
    },
    {
        id: 2,
        title: 'Tokyo Explorer: Shrines and Neon Cityscapes',
        location: 'Tokyo, Japan',
        price: 1500,
        date: '2024-07-01',
        imageUrl: 'https://placehold.co/400x250/F59E0B/FFFFFF?text=Tokyo+Explorer',
        rating: 4.8,
        duration: '7 days',
        type: 'Adventure'
    },
    {
        id: 3,
        title: 'Bali Retreat: Sun, Sand, and Yoga',
        location: 'Bali, Indonesia',
        price: 900,
        date: '2024-05-20',
        imageUrl: 'https://placehold.co/400x250/10B981/FFFFFF?text=Bali+Retreat',
        rating: 4.6,
        duration: '6 days',
        type: 'Beach'
    },
    {
        id: 4,
        title: 'New York City: Broadway & Central Park',
        location: 'NYC, USA',
        price: 1800,
        date: '2024-09-10',
        imageUrl: 'https://placehold.co/400x250/DC2626/FFFFFF?text=NYC+Lights',
        rating: 4.7,
        duration: '3 days',
        type: 'Cultural'
    },
    {
        id: 5,
        title: 'Swiss Alps Hiking: Majestic Views',
        location: 'Swiss Alps, Switzerland',
        price: 2200,
        date: '2024-08-01',
        imageUrl: 'https://placehold.co/400x250/06B6D4/FFFFFF?text=Swiss+Hike',
        rating: 4.9,
        duration: '10 days',
        type: 'Adventure'
    },
    {
        id: 6,
        title: 'Caribbean Dive Trip',
        location: 'Grand Cayman',
        price: 1100,
        date: '2024-11-05',
        imageUrl: 'https://placehold.co/400x250/0F766E/FFFFFF?text=Dive+Trip',
        rating: 4.4,
        duration: '4 days',
        type: 'Beach'
    },
    {
        id: 7,
        title: 'Amazon River Expedition',
        location: 'Manaus, Brazil',
        price: 2800,
        date: '2024-10-20',
        imageUrl: 'https://placehold.co/400x250/84CC16/FFFFFF?text=Amazon+Expedition',
        rating: 4.7,
        duration: '14 days',
        type: 'Adventure'
    },
];

// Helper function to parse duration string to number of days
const parseDuration = (durationStr) => {
    const match = durationStr.match(/(\d+)\s*days/i);
    return match ? parseInt(match[1], 10) : 0;
};

function MainDash() {
    // --- Global State ---
    const [tours] = useState(initialTours);
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
    const handleAddToCart = useCallback((item) => {
        try {
            const items = JSON.parse(localStorage.getItem('cartItems') || '[]');
            const idx = items.findIndex(i => i && i.kind === item.kind && String(i.id) === String(item.id));
            if (idx >= 0) {
                items[idx].quantity = Number(items[idx].quantity || 1) + 1;
            } else {
                items.push({ ...item, quantity: 1 });
            }
            localStorage.setItem('cartItems', JSON.stringify(items));
            const total = items.reduce((sum, it) => sum + Number(it.quantity || 1), 0);
            localStorage.setItem('cartCount', String(total));
            window.dispatchEvent(new Event('cart:update'));
        } catch (e) { void e }
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
        // Get user preferences
        let prefs = { interests: [], countries: [], cities: [] };
        try {
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            if (user.preferences) prefs = user.preferences;
        } catch (e) { console.error(e); }

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
            // Helper to check preference match
            const isMatch = (item) => {
                if (prefs.interests?.some(i => item.type?.includes(i))) return true;
                if (prefs.countries?.some(c => item.location?.includes(c))) return true;
                if (prefs.cities?.some(c => item.location?.includes(c))) return true;
                return false;
            };

            const matchA = isMatch(a);
            const matchB = isMatch(b);

            // Prioritize matches at the top
            if (matchA && !matchB) return -1;
            if (!matchA && matchB) return 1;

            // Standard Sorting
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
                isMobileFilterOpen={isMobileFilterOpen}
                handleMobileFilterToggle={handleMobileFilterToggle}
            />
        </div>
    );
}

export default MainDash;
