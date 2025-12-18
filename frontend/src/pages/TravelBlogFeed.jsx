import React, { useEffect, useState, useRef } from 'react';
// import axios from 'axios'; // Not used directly, using baseApi
import { Filter, MapPin, Tag, Compass, Frown, Loader2 } from 'lucide-react';
import BlogCard from '../components/BlogCard.jsx';
import CreateBlogBanner from '../components/CreateBlogBanner.jsx';
import { baseApi } from "../utils/baseApi.js";
import Nav from "../components/Nav.jsx";

const TravelBlogFeed = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filter States
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');

  // Store initial unique options so they don't disappear when we filter the list
  const [filterOptions, setFilterOptions] = useState({ categories: [], locations: [] });
  const isInitialLoad = useRef(true);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      setError('');

      const params = {};
      if (selectedCategory) params.category = selectedCategory;
      if (selectedLocation) params.location = selectedLocation;

      const res = await baseApi.get(`/blogs`, { params });
      console.log(res.data);
      const data = res.data.data || [];
      console.log(data);
      setBlogs(data);

      // Extract filter options only on the very first successful load (when no filters are applied)
      if (isInitialLoad.current && data.length > 0) {
        const uniqueCategories = Array.from(new Set(data.flatMap(b => [...(b.categories || []), ...(b.tags || [])])));
        const uniqueLocations = Array.from(new Set(data.map(b => b.location).filter(Boolean)));

        setFilterOptions({
          categories: uniqueCategories,
          locations: uniqueLocations
        });
        isInitialLoad.current = false;
      }

    } catch (err) {
      console.error(err);
      setError('Could not load blogs. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory, selectedLocation]);

  return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Nav />

        {/* Hero Section with Glassmorphism */}
        <div className="relative bg-indigo-600 pb-32 pt-12 lg:pt-20 overflow-hidden">
          {/* Decorative Background Elements */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
            <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-indigo-500 blur-3xl opacity-50"></div>
            <div className="absolute top-32 -left-24 w-72 h-72 rounded-full bg-blue-500 blur-3xl opacity-30"></div>
          </div>

          <div className="relative z-10 container mx-auto px-4 text-center">
            <div className="inline-flex items-center justify-center p-3 bg-white/10 backdrop-blur-md rounded-full mb-6 border border-white/20 shadow-xl">
              <Compass className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white tracking-tight mb-6">
              Travel Stories Feed
            </h1>
            <p className="text-lg md:text-xl text-indigo-100 max-w-2xl mx-auto leading-relaxed">
              See what other WanderGo explorers are posting. Like, comment, and share your favorite travel memories.
            </p>
          </div>
        </div>

        {/* Main Content Area */}
        <main className="container mx-auto px-4 -mt-20 relative z-20 pb-20">

          {/* Banner Section */}
          <div className="mb-10 shadow-2xl rounded-3xl overflow-hidden transform hover:scale-[1.01] transition-transform duration-300">
            <CreateBlogBanner />
          </div>

          {/* Filter Bar */}
          <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6 mb-10">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Filter className="w-5 h-5 text-indigo-500" />
                Filter Stories
              </h3>
              {(selectedCategory || selectedLocation) && (
                  <button
                      onClick={() => {setSelectedCategory(''); setSelectedLocation('');}}
                      className="text-sm text-red-500 hover:text-red-700 font-medium hover:underline transition-all"
                  >
                    Clear Filters
                  </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Category Filter */}
              <div className="relative group">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block ml-1">
                  Category
                </label>
                <div className="relative">
                  <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                  <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all cursor-pointer hover:border-indigo-300"
                  >
                    <option value="">All Categories</option>
                    {filterOptions.categories.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
                </div>
              </div>

              {/* Location Filter */}
              <div className="relative group">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block ml-1">
                  Location
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                  <select
                      value={selectedLocation}
                      onChange={(e) => setSelectedLocation(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all cursor-pointer hover:border-indigo-300"
                  >
                    <option value="">All Locations</option>
                    {filterOptions.locations.map((loc) => (
                        <option key={loc} value={loc}>{loc}</option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div className="min-h-[300px]">
            {loading ? (
                /* Loading Skeletons */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                      <div key={i} className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100 h-96 animate-pulse flex flex-col">
                        <div className="w-full h-48 bg-slate-200 rounded-2xl mb-4"></div>
                        <div className="h-6 bg-slate-200 rounded w-3/4 mb-3"></div>
                        <div className="h-4 bg-slate-200 rounded w-1/2 mb-6"></div>
                        <div className="mt-auto flex gap-2">
                          <div className="h-8 w-8 bg-slate-200 rounded-full"></div>
                          <div className="h-8 w-20 bg-slate-200 rounded"></div>
                        </div>
                      </div>
                  ))}
                </div>
            ) : error ? (
                /* Error State */
                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl shadow-sm border border-red-100">
                  <div className="bg-red-50 p-4 rounded-full mb-4">
                    <Frown className="w-10 h-10 text-red-500" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 mb-2">Oops! Something went wrong</h3>
                  <p className="text-slate-500">{error}</p>
                  <button
                      onClick={fetchBlogs}
                      className="mt-6 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                  >
                    Try Again
                  </button>
                </div>
            ) : blogs.length === 0 ? (
                /* Empty State */
                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl shadow-sm border border-slate-100">
                  <div className="bg-indigo-50 p-6 rounded-full mb-6">
                    <Compass className="w-12 h-12 text-indigo-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-800 mb-2">No stories found</h3>
                  <p className="text-slate-500 max-w-md text-center">
                    We couldn't find any travel stories matching your criteria. Try changing your filters or be the first to post!
                  </p>
                </div>
            ) : (
                /* Blog Grid */
                <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {blogs.map((blog) => (
                      <div key={blog._id} className="transform hover:-translate-y-1 transition-transform duration-300">
                        <BlogCard blog={blog} />
                      </div>
                  ))}
                </section>
            )}
          </div>
        </main>
      </div>
  );
};

export default TravelBlogFeed;