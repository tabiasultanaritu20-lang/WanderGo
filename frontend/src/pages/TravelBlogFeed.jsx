import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./TravelBlogFeed.css";

const API_URL = "http://localhost:8080/api/blogs";
const BACKEND_URL = "http://localhost:8080";

const TravelBlogFeed = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const getToken = () => localStorage.getItem("token");

  const normalizeList = (payload) => {
    if (!payload) return [];
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload.data)) return payload.data;
    if (Array.isArray(payload.blogs)) return payload.blogs;
    if (Array.isArray(payload.results)) return payload.results;
    return [];
  };

  // Store initial unique options so they don't disappear when we filter the list
  const [filterOptions, setFilterOptions] = useState({ categories: [], locations: [] });
  const isInitialLoad = useRef(true);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {};
      if (category) params.category = category;
      if (location) params.location = location;

      const res = await axios.get(API_URL, { params });
      const list = normalizeList(res.data);

      const blogsWithCounts = list.map((b) => ({
        ...b,
        likesCount: Array.isArray(b.likes) ? b.likes.length : (b.likesCount || 0),
        liked: false,
      }));

      setBlogs(blogsWithCounts);
    } catch (err) {
      console.error("Error fetching blogs:", err);
      setError("Could not load blogs.");
      setBlogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  const handleLike = async (id) => {
    const token = getToken();
    if (!token) return alert("Please log in to like blogs.");

    // optimistic UI
    setBlogs((prev) =>
      prev.map((blog) => {
        if (blog._id !== id) return blog;
        const liked = !blog.liked;
        const likesCount = (blog.likesCount || 0) + (liked ? 1 : -1);
        return { ...blog, liked, likesCount };
      })
    );

    try {
      const r = await axios.post(
        `${API_URL}/${id}/like`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // if backend returns updated blog, sync it
      const updated = r.data?.data || r.data;
      if (updated && updated._id) {
        setBlogs((prev) =>
          prev.map((b) =>
            b._id === updated._id
              ? {
                  ...b,
                  ...updated,
                  likesCount: Array.isArray(updated.likes) ? updated.likes.length : (updated.likesCount || b.likesCount),
                }
              : b
          )
        );
      }
    } catch (err) {
      console.error("Error liking blog:", err);
    }
  };

  const handleShareToProfile = async (id) => {
    const token = getToken();
    if (!token) return alert("Please log in to share blogs.");

    try {
      await axios.post(
        `${API_URL}/${id}/share`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Blog shared to your profile.");
    } catch (err) {
      console.error("Error sharing blog:", err);
      alert("Could not share blog. Check console/backend.");
    }
  };

  const handleCopyLink = (id) => {
    const url = `${window.location.origin}/blog/${id}`;
    navigator.clipboard
      .writeText(url)
      .then(() => alert("Link copied to clipboard"))
      .catch((err) => console.error("Could not copy link:", err));
  };

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    fetchBlogs();
  };

  return (
    <div className="travel-blog-feed">
      <header className="travel-blog-feed__header">
        <div>
          <h1>Travel Blog Feed</h1>
          <p>Read stories from travelers and share your own journeys.</p>
        </div>
        <button onClick={() => navigate("/blog/new")}>✍️ Create New Blog</button>
      </header>

      <form className="travel-blog-feed__filters" onSubmit={handleFilterSubmit}>
        <input
          type="text"
          placeholder="Filter by category (e.g. Beach, Food)"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        />
        <input
          type="text"
          placeholder="Filter by location (e.g. Dhaka, Nepal)"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />
        <button type="submit">Apply Filters</button>
        <button
          type="button"
          onClick={() => {
            setCategory("");
            setLocation("");
            fetchBlogs();
          }}
        >
          Clear
        </button>
      </form>

      {error && <p className="travel-blog-feed__error">{error} – check console / backend.</p>}

      {loading ? (
        <p className="travel-blog-feed__loading">Loading blogs...</p>
      ) : blogs.length === 0 ? (
        <p className="travel-blog-feed__empty">No blogs found. Be the first to share your story!</p>
      ) : (
        <div className="travel-blog-feed__list">
          {blogs.map((blog) => {
            const previewText = (blog.content || blog.body || "").toString();

            const raw = blog.coverImageUrl || blog.coverImage || blog.imageUrl || "";
            const imgSrc =
              raw && raw.startsWith("http") ? raw : raw ? `${BACKEND_URL}${raw}` : "";

            return (
              <div key={blog._id} className="travel-blog-feed__card">
                <div className="travel-blog-feed__card-header">
                  <div>
                    <h2>{blog.title}</h2>
                    <div className="travel-blog-feed__meta">
                      <span>{blog.location || "Unknown"}</span>
                      <span>
                        {blog.createdAt &&
                          new Date(blog.createdAt).toLocaleString("en-GB", {
                            dateStyle: "medium",
                            timeStyle: "short",
                          })}
                      </span>
                    </div>
                  </div>
                  <span className="travel-blog-feed__author">
                    by {blog.authorName || "Anonymous Traveler"}
                  </span>
                </div>

                {imgSrc && (
                  <div className="travel-blog-feed__image-wrapper">
                    <img
                      src={imgSrc}
                      alt={blog.title}
                      className="travel-blog-feed__image"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  </div>
                )}

                <p className="travel-blog-feed__content-preview">
                  {previewText.length > 200 ? previewText.slice(0, 200) + "..." : previewText}
                </p>

                {blog.categories && blog.categories.length > 0 && (
                  <div className="travel-blog-feed__tags">
                    {blog.categories.map((cat) => (
                      <span key={cat} className="travel-blog-feed__tag">
                        #{cat}
                      </span>
                    ))}
                  </div>
                )}

                <div className="travel-blog-feed__actions">
                  <button onClick={() => handleLike(blog._id)}>
                    {blog.liked ? "💔 Unlike" : "❤️ Like"} ({blog.likesCount || 0})
                  </button>
                  <button onClick={() => handleCopyLink(blog._id)}>🔗 Copy Link</button>
                  <button onClick={() => handleShareToProfile(blog._id)}>📤 Share to Profile</button>
                  <button onClick={() => navigate(`/blog/${blog._id}`)}>👁 View Details</button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TravelBlogFeed;