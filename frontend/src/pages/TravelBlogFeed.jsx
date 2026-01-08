import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import BlogCard from "../components/BlogCard"; 
import { Search, MapPin, Plus, Home } from "lucide-react";

// REVERTED: Pointing directly to the blogs endpoint again
const API_URL = "http://localhost:8080/api/blogs";

const TravelBlogFeed = () => {
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filter States
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      // Build query string based on filters
      const params = new URLSearchParams();
      if (category) params.append("category", category);
      if (location) params.append("location", location);

      const res = await axios.get(`${API_URL}?${params.toString()}`);
      setBlogs(res.data.data || []);
    } catch (err) {
      console.error("Error fetching blogs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchBlogs();
  };

  const handleClear = () => {
    setCategory("");
    setLocation("");
    window.location.reload(); 
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header Section */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            
            {/* Title & Home Link */}
            <div className="flex items-center gap-4">
              <Link to="/dashboard" className="p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition">
                <Home className="w-5 h-5 text-slate-600" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Travel Feed</h1>
                <p className="text-sm text-slate-500 hidden sm:block">Discover stories from around the world</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 w-full md:w-auto">
              <Link 
                to="/saved-blogs"
                className="flex-1 md:flex-none text-center px-4 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition"
              >
                Saved
              </Link>
              <button 
                onClick={() => navigate("/blog/new")}
                className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition shadow-sm shadow-indigo-200"
              >
                <Plus className="w-4 h-4" />
                Write Blog
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="mt-6 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-grow group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
              <input 
                type="text" 
                placeholder="Search by category (e.g., Beach, Food)..." 
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-100 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none"
              />
            </div>
            <div className="relative flex-grow group">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
              <input 
                type="text" 
                placeholder="Search by location..." 
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-100 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none"
              />
            </div>
            <button type="submit" className="px-6 py-2.5 bg-slate-800 text-white font-medium rounded-xl hover:bg-slate-900 transition">
              Filter
            </button>
            {(category || location) && (
              <button type="button" onClick={handleClear} className="px-4 py-2.5 text-slate-500 hover:text-red-500 font-medium transition">
                Clear
              </button>
            )}
          </form>
        </div>
      </div>

      {/* Blog Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-slate-500">Loading travel stories...</p>
          </div>
        ) : blogs.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 border-dashed">
            <p className="text-slate-500 text-lg">No blogs found matching your search.</p>
            <button onClick={handleClear} className="mt-4 text-indigo-600 font-medium hover:underline">Clear Filters</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogs.map((blog) => (
              <BlogCard key={blog._id} blog={blog} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default TravelBlogFeed;