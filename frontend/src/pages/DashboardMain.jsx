import React, { useState, useCallback, useMemo } from 'react';
import Nav from '../components/Nav.jsx';         // Import the Navigation component (Fixed: removed .jsx)
import Dashboard from '../components/Dashboard.jsx'; // Import the Dashboard component (Fixed: removed .jsx)

// Demo tours data - kept in the root for central state management
const initialTours = [
    {
        id: 1,
        title: 'Paris Adventure',
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
        title: 'Tokyo Explorer',
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
        title: 'Bali Retreat',
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
        title: 'New York City',
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
        title: 'Swiss Alps Hiking',
        location: 'Swiss Alps, Switzerland',
        price: 2200,
        date: '2024-08-01',
        imageUrl: 'https://placehold.co/400x250/06B6D4/FFFFFF?text=Swiss+Hike',
        rating: 4.9,
        duration: '10 days',
        type: 'Adventure'
    },
];

function MainDash() {
    // Shared State Management
    const [cartCount, setCartCount] = useState(0);
    const [sortBy, setSortBy] = useState('price');
    const [sortOrder, setSortOrder] = useState('asc');
    const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
    const [tours] = useState(initialTours); // Tour data stays here

    // Callbacks
    const handleAddToCart = useCallback(() => {
        setCartCount(prev => prev + 1);
    }, []);

    const handleSortOrderToggle = useCallback(() => {
        setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    }, []);

    const handleMobileFilterToggle = useCallback(() => {
        setIsMobileFilterOpen(prev => !prev);
    }, []);

    // Derived state for sorting logic
    const sortedTours = useMemo(() => {
        return [...tours].sort((a, b) => {
            let comparison = 0;
            if (sortBy === 'price') {
                comparison = a.price - b.price;
            } else if (sortBy === 'location') {
                comparison = a.location.localeCompare(b.location);
            } else if (sortBy === 'date') {
                comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
            }
            return sortOrder === 'asc' ? comparison : -comparison;
        });
    }, [tours, sortBy, sortOrder]);

    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            <Nav cartCount={cartCount} />
            <Dashboard
                sortedTours={sortedTours}
                totalToursCount={tours.length}
                // Sorting Props
                sortBy={sortBy}
                setSortBy={setSortBy}
                sortOrder={sortOrder}
                handleSortOrderToggle={handleSortOrderToggle}
                // Mobile Filter Props
                isMobileFilterOpen={isMobileFilterOpen}
                handleMobileFilterToggle={handleMobileFilterToggle}
                // Action Handlers
                handleAddToCart={handleAddToCart}
            />
        </div>
    );
}

export default MainDash;