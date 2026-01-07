import React, { useEffect, useState, useRef } from "react";
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
  const isInitialLoad = useRef(true);

  const getToken = () => localStorage.getItem("token");

  const normalizeList = (payload) => {
    if (!payload) return [];
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload.data)) return payload.data;
    if (Array.isArray(payload.blogs)) return payload.blogs;
    if (Array.isArray(payload.results)) return payload.results;
    return [];
  };

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
        likesCount: Array.isArray(b.likes) ? b.likes.length : 0,
        liked: false,
      }));

      setBlogs(blogsWithCounts);
    } catch (err) {
      console.error(err);
      setError("Could not load blogs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  const handleLike = async (id) => {
    const token = getToken();
    if (!token) return alert("Login required");

    setBlogs((prev) =>
      prev.map((b) =>
        b._id === id
          ? { ...b, liked: !b.liked, likesCount: b.likesCount + (b.liked ? -1 : 1) }
          : b
      )
    );

    try {
      await axios.post(
        `${API_URL}/${id}/like`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleCopyLink = (id) => {
    navigator.clipboard.writeText(`${window.location.origin}/blog/${id}`);
    alert("Link copied");
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
          placeholder="Filter by category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        />
        <input
          type="text"
          placeholder="Filter by location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />
        <button type="submit">Apply</button>
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

      {error && <p className="travel-blog-feed__error">{error}</p>}

      {loading ? (
        <p>Loading blogs...</p>
      ) : blogs.length === 0 ? (
        <p>No blogs found.</p>
      ) : (
        <div className="travel-blog-feed__list">
          {blogs.map((blog) => {
            const previewText = blog.content || "";

            const images = Array.isArray(blog.images) ? blog.images : [];
            const allImages = [
              ...(blog.coverImageUrl ? [blog.coverImageUrl] : []),
              ...images,
            ].filter(Boolean);

            const uniqueImages = Array.from(new Set(allImages)).map((img) =>
              img.startsWith("http") ? img : `${BACKEND_URL}${img}`
            );

            return (
              <div key={blog._id} className="travel-blog-feed__card">
                <h2>{blog.title}</h2>

                <div className="travel-blog-feed__meta">
                  <span>{blog.location || "Unknown"}</span>
                  <span>
                    {blog.createdAt &&
                      new Date(blog.createdAt).toLocaleDateString()}
                  </span>
                </div>

                {/* MAIN IMAGE */}
                {uniqueImages.length > 0 && (
                  <img
                    src={uniqueImages[0]}
                    alt={blog.title}
                    className="travel-blog-feed__image"
                  />
                )}

                {/* THUMBNAILS */}
                {uniqueImages.length > 1 && (
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(4, 1fr)",
                      gap: 8,
                      marginTop: 8,
                    }}
                  >
                    {uniqueImages.slice(1, 5).map((src, idx) => (
                      <img
                        key={src + idx}
                        src={src}
                        alt=""
                        style={{
                          width: "100%",
                          height: 80,
                          objectFit: "cover",
                          borderRadius: 8,
                        }}
                      />
                    ))}
                    {uniqueImages.length > 5 && (
                      <div
                        style={{
                          fontSize: 12,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        +{uniqueImages.length - 5} more
                      </div>
                    )}
                  </div>
                )}

                <p>
                  {previewText.length > 200
                    ? previewText.slice(0, 200) + "..."
                    : previewText}
                </p>

                {blog.categories?.length > 0 && (
                  <div className="travel-blog-feed__tags">
                    {blog.categories.map((cat) => (
                      <span key={cat}>#{cat}</span>
                    ))}
                  </div>
                )}

                <div className="travel-blog-feed__actions">
                  <button onClick={() => handleLike(blog._id)}>
                    ❤️ {blog.likesCount}
                  </button>
                  <button onClick={() => handleCopyLink(blog._id)}>🔗 Copy</button>
                  <button onClick={() => navigate(`/blog/${blog._id}`)}>
                    👁 View
                  </button>
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
