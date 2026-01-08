import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const TAGS = {
    interests: [
        "Adventure", "Cultural", "Beach", "Nature", "City", "Hiking", "Diving", "Relaxation"
    ],
    countries: [
        "France", "Japan", "Indonesia", "USA", "Switzerland", "Brazil", "Italy", "Spain", "Australia"
    ],
    cities: [
        "Paris", "Tokyo", "Bali", "New York", "London", "Rome", "Sydney", "Dubai"
    ]
};

function Personalization() {
    const navigate = useNavigate();
    const [selectedTags, setSelectedTags] = useState({
        interests: [],
        countries: [],
        cities: []
    });
    const [submitting, setSubmitting] = useState(false);

    const toggleTag = (category, tag) => {
        setSelectedTags(prev => {
            const list = prev[category];
            if (list.includes(tag)) {
                return { ...prev, [category]: list.filter(t => t !== tag) };
            } else {
                return { ...prev, [category]: [...list, tag] };
            }
        });
    };

    const handleSubmit = async () => {
        setSubmitting(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${import.meta.env.VITE_API_BASE || '/api'}/user/preferences`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ preferences: selectedTags })
            });

            if (res.ok) {
                const data = await res.json();
                // Update local storage user info if needed
                let currentUser = {};
                try {
                    currentUser = JSON.parse(localStorage.getItem('user')) || {};
                } catch (e) {
                    currentUser = {};
                }
                
                localStorage.setItem('user', JSON.stringify({ 
                    ...currentUser, 
                    isPersonalized: true,
                    preferences: selectedTags 
                }));
                
                // Redirect to dashboard
                navigate('/dashboard');
            } else {
                console.error("Failed to save preferences");
            }
        } catch (error) {
            console.error("Error saving preferences:", error);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-4">
            {/* Glassmorphism Card */}
            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl shadow-2xl p-8 max-w-4xl w-full text-white overflow-hidden relative">
                
                {/* Decorative shapes */}
                <div className="absolute top-0 left-0 w-32 h-32 bg-purple-400/30 rounded-full blur-2xl -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
                <div className="absolute bottom-0 right-0 w-64 h-64 bg-indigo-400/30 rounded-full blur-3xl translate-x-1/3 translate-y-1/3 pointer-events-none"></div>

                <div className="relative z-10">
                    <h1 className="text-3xl font-bold mb-2 text-center">Welcome to WanderGo</h1>
                    <p className="text-white/80 text-center mb-8">Tell us what you love, and we'll tailor your experience.</p>

                    <div className="space-y-8">
                        {/* Interests */}
                        <section>
                            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                                <span className="bg-white/20 p-1 rounded-md">✨</span> Interests
                            </h3>
                            <div className="flex flex-wrap gap-3">
                                {TAGS.interests.map(tag => (
                                    <button
                                        key={tag}
                                        onClick={() => toggleTag('interests', tag)}
                                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 border ${
                                            selectedTags.interests.includes(tag)
                                                ? 'bg-white text-purple-600 border-white shadow-lg scale-105'
                                                : 'bg-transparent text-white border-white/30 hover:bg-white/10'
                                        }`}
                                    >
                                        {tag}
                                    </button>
                                ))}
                            </div>
                        </section>

                        {/* Countries */}
                        <section>
                            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                                <span className="bg-white/20 p-1 rounded-md">🌍</span> Countries
                            </h3>
                            <div className="flex flex-wrap gap-3">
                                {TAGS.countries.map(tag => (
                                    <button
                                        key={tag}
                                        onClick={() => toggleTag('countries', tag)}
                                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 border ${
                                            selectedTags.countries.includes(tag)
                                                ? 'bg-white text-purple-600 border-white shadow-lg scale-105'
                                                : 'bg-transparent text-white border-white/30 hover:bg-white/10'
                                        }`}
                                    >
                                        {tag}
                                    </button>
                                ))}
                            </div>
                        </section>

                        {/* Cities */}
                        <section>
                            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                                <span className="bg-white/20 p-1 rounded-md">🏙️</span> Cities
                            </h3>
                            <div className="flex flex-wrap gap-3">
                                {TAGS.cities.map(tag => (
                                    <button
                                        key={tag}
                                        onClick={() => toggleTag('cities', tag)}
                                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 border ${
                                            selectedTags.cities.includes(tag)
                                                ? 'bg-white text-purple-600 border-white shadow-lg scale-105'
                                                : 'bg-transparent text-white border-white/30 hover:bg-white/10'
                                        }`}
                                    >
                                        {tag}
                                    </button>
                                ))}
                            </div>
                        </section>
                    </div>

                    <div className="mt-10 flex justify-end">
                        <button
                            onClick={handleSubmit}
                            disabled={submitting}
                            className="bg-white text-indigo-600 px-8 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-transform disabled:opacity-70 disabled:scale-100"
                        >
                            {submitting ? 'Saving...' : 'Get Started →'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Personalization;
