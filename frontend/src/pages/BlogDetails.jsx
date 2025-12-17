import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import "./TravelBlogFeed.css";

const API_URL = "http://localhost:8080/api/blogs";
const BACKEND_URL = "http://localhost:8080";

const BlogDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState("");
  const [error, setError] = useState(null);

  const getToken = () => localStorage.getItem("token");

  const fetchBlog = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await axios.get(`${API_URL}/${id}`);
      const data = res.data?.data || res.data;

      if (!data || !data._id) {
        setBlog(null);
        setError("Blog not found.");
        return;
      }

      setBlog({
        ...data,
        likesCount: Array.isArray(data.likes) ? data.likes.length : (data.likesCount || 0),
        comments: Array.isArray(data.comments) ? data.comments : [],
      });
    } catch (err) {
      console.error("Error fetching blog:", err);
      setError("Could not load blog.");
      setBlog(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlog();
  }, [id]);

  const handleLike = async () => {
    const token = getToken();
    if (!token) return alert("Please log in to like blogs.");
    if (!blog) return;

    const liked = !blog.liked;
    const likesCount = (blog.likesCount || 0) + (liked ? 1 : -1);
    setBlog({ ...blog, liked, likesCount });

    try {
      const r = await axios.post(
        `${API_URL}/${id}/like`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const updated = r.data?.data || r.data;
      if (updated && updated._id) {
        setBlog((prev) => ({
          ...prev,
          ...updated,
          likesCount: Array.isArray(updated.likes) ? updated.likes.length : (updated.likesCount || prev.likesCount),
          comments: Array.isArray(updated.comments) ? updated.comments : (prev.comments || []),
        }));
      }
    } catch (err) {
      console.error("Error liking blog:", err);
    }
  };

  const handleShare = async () => {
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
      alert("Could not share blog.");
    }
  };

  const handleCopy = () => {
    navigator.clipboard
      .writeText(`${window.location.origin}/blog/${id}`)
      .then(() => alert("Link copied!"))
      .catch((err) => console.error("Copy failed:", err));
  };

  const handleDelete = async () => {
    const token = getToken();
    if (!token) return alert("Please log in to delete blogs.");
    if (!window.confirm("Delete this blog?")) return;

    try {
      await axios.delete(`${API_URL}/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Blog deleted.");
      navigate("/blog");
    } catch (err) {
      console.error("Delete error:", err);
      alert("Could not delete blog.");
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    const token = getToken();
    if (!token) return alert("Please log in to comment.");
    if (!commentText.trim()) return;

    try {
      const res = await axios.post(
        `${API_URL}/${id}/comments`,
        { text: commentText },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const newComment = res.data?.data || res.data;
      setBlog((prev) =>
        prev ? { ...prev, comments: [...(prev.comments || []), newComment] } : prev
      );
      setCommentText("");
    } catch (err) {
      console.error("Comment error:", err);
      alert("Could not add comment.");
    }
  };

  const handleDeleteComment = async (commentId) => {
    const token = getToken();
    if (!token) return alert("Please log in.");

    try {
      await axios.delete(`${API_URL}/${id}/comments/${commentId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setBlog((prev) =>
        prev
          ? {
              ...prev,
              comments: (prev.comments || []).filter((c) => c._id !== commentId),
            }
          : prev
      );
    } catch (err) {
      console.error("Delete comment error:", err);
      alert("Could not delete comment.");
    }
  };

  if (loading) {
    return (
      <div className="travel-blog-feed">
        <p className="travel-blog-feed__loading">Loading blog...</p>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="travel-blog-feed">
        <button onClick={() => navigate("/blog")} style={{ marginBottom: 16 }}>
          ← Back
        </button>
        <p>{error || "Blog not found."}</p>
      </div>
    );
  }

  const fullText = (blog.content || blog.body || "").toString();

  const raw = blog.coverImageUrl || blog.coverImage || blog.imageUrl || "";
  const imgSrc = raw && raw.startsWith("http") ? raw : raw ? `${BACKEND_URL}${raw}` : "";

  return (
    <div className="travel-blog-feed">
      <button onClick={() => navigate("/blog")} style={{ marginBottom: 16 }}>
        ← Back
      </button>

      <div className="travel-blog-feed__card">
        <div className="travel-blog-feed__card-header">
          <div>
            <h1 style={{ fontSize: 24, margin: 0 }}>{blog.title}</h1>
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
            <img src={imgSrc} alt={blog.title} className="travel-blog-feed__image" />
          </div>
        )}

        <p
          className="travel-blog-feed__content-full"
          style={{ marginTop: 16, whiteSpace: "pre-wrap" }}
        >
          {fullText}
        </p>

        {blog.categories && blog.categories.length > 0 && (
          <div className="travel-blog-feed__tags" style={{ marginTop: 8 }}>
            {blog.categories.map((cat) => (
              <span key={cat} className="travel-blog-feed__tag">
                #{cat}
              </span>
            ))}
          </div>
        )}

        <div className="travel-blog-feed__actions" style={{ marginTop: 16 }}>
          <button onClick={handleLike}>
            {blog.liked ? "💔 Unlike" : "❤️ Like"} ({blog.likesCount || 0})
          </button>
          <button onClick={handleCopy}>🔗 Copy Link</button>
          <button onClick={handleShare}>📤 Share to Profile</button>
          <button onClick={() => navigate(`/blog/${id}/edit`)}>✏ Edit</button>
          <button onClick={handleDelete}>🗑 Delete</button>
        </div>
      </div>

      <div className="travel-blog-feed__card" style={{ marginTop: 24 }}>
        <h2 style={{ marginTop: 0 }}>Comments</h2>

        {!blog.comments || blog.comments.length === 0 ? (
          <p style={{ color: "#6b7280", fontSize: 14 }}>
            No comments yet. Be the first to share your thoughts!
          </p>
        ) : (
          (blog.comments || []).map((c) => (
            <div key={c._id} className="travel-blog-feed__comment-card">
              <strong>{c.name || "Traveler"}</strong>
              <p>{c.text}</p>
              <button style={{ fontSize: 12, marginTop: 4 }} onClick={() => handleDeleteComment(c._id)}>
                Delete
              </button>
            </div>
          ))
        )}

        <form
          onSubmit={handleAddComment}
          className="travel-blog-feed__comment-form"
          style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 8 }}
        >
          <input
            type="text"
            placeholder="Write a comment..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
          />
          <button type="submit">Post Comment</button>
        </form>
      </div>
    </div>
  );
};

export default BlogDetails;