import React, { useEffect, useState } from 'react';
import axios from 'axios';
import BlogCard from '../components/BlogCard.jsx';
import CreateBlogBanner from '../components/CreateBlogBanner.jsx';
import './TravelBlogFeed.css';
import {baseApi} from "../utils/baseApi.js";
import Nav from "../components/Nav.jsx"; // page-specific styles

const API_BASE_URL = baseApi

const TravelBlogFeed = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      setError('');

      const params = {};
      if (selectedCategory) params.category = selectedCategory;
      if (selectedLocation) params.location = selectedLocation;

      const res = await axios.get(`${API_BASE_URL}/blogs`, { params });
      setBlogs(res.data.data || []);
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

  const allCategories = Array.from(
    new Set(
      blogs.flatMap((b) => [
        ...(b.categories || []),
        ...(b.tags || []),
      ])
    )
  );

  const allLocations = Array.from(
    new Set(blogs.map((b) => b.location).filter(Boolean))
  );

  return (
      <>
      <Nav/>
    <div className="blog-feed-bg">
      <div className="blog-feed-overlay">
        <div className="blog-feed-page">
          <header className="blog-feed-header glass-card">
            <div>
              <h1>Travel Stories Feed</h1>
              <p>
                See what other WanderGo explorers are posting. Like, comment and
                share travel memories.
              </p>
            </div>
          </header>

          <CreateBlogBanner />

          <section className="blog-filters glass-card">
            <div>
              <label>Filter by category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="">All</option>
                {allCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label>Filter by location</label>
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
              >
                <option value="">All</option>
                {allLocations.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
            </div>
          </section>

          {loading && (
            <p className="blog-status-text">Loading travel stories…</p>
          )}
          {error && <p className="blog-status-text error-text">{error}</p>}

          {!loading && !error && blogs.length === 0 && (
            <p className="blog-status-text">
              No blogs yet. Be the first to share your adventure!
            </p>
          )}

          <section className="blog-list">
            {blogs.map((blog) => (
              <BlogCard key={blog._id} blog={blog} />
            ))}
          </section>
        </div>
      </div>
    </div>
      </>
  );
};

export default TravelBlogFeed;