import React, { useEffect, useState } from "react";
import axios from "axios";
import BlogCard from "../components/BlogCard";
import { Bookmark, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const SavedBlogs = () => {
  const [savedPosts, setSavedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSavedPosts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      
      const res = await axios.get("http://localhost:8080/api/blogs/saved-blogs", {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("Saved Blogs Data:", res.data);

      
      const blogs = res.data.data || res.data || [];
      
      const validBlogs = blogs.filter(blog => blog !== null);
      
      setSavedPosts(validBlogs);
    } catch (err) {
      console.error("Error fetching saved blogs", err);
      setError("Could not load saved blogs. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSavedPosts();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600 mb-4"></div>
        <p className="text-slate-500 font-medium">Loading your travel collection...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-200">
            <Bookmark className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Saved for Later</h1>
            <p className="text-slate-500">Your personal travel wishlist</p>
          </div>
        </div>
        
        <Link 
          to="/blog" 
          className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors bg-slate-100 px-4 py-2 rounded-xl w-fit"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Feed
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-2xl mb-6 text-center border border-red-100">
          {error}
        </div>
      )}

      {savedPosts.length === 0 ? (
        <div className="bg-white rounded-[2rem] p-12 md:p-20 text-center border border-slate-100 shadow-sm">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Bookmark className="w-10 h-10 text-slate-300" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">No bookmarks found</h2>
          <p className="text-slate-500 max-w-xs mx-auto mb-8">
            Start exploring and save the trips you'd like to take in the future!
          </p>
          <Link 
            to="/blog"
            className="inline-flex items-center justify-center px-8 py-3 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-200 transition-all active:scale-95"
          >
            Find Inspiration
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {savedPosts.map((blog) => (
            <BlogCard key={blog._id} blog={blog} />
          ))}
        </div>
      )}
    </div>
  );
};

export default SavedBlogs;