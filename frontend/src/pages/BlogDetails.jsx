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
  const [isSaved, setIsSaved] = useState(false);

  const getToken = () => localStorage.getItem("token");

  const fetchBlog = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/${id}`);
      const data = res.data?.data || res.data;
      setBlog({
        ...data,
        likesCount: Array.isArray(data.likes) ? data.likes.length : (data.likesCount || 0),
        comments: Array.isArray(data.comments) ? data.comments : [],
      });
    } catch (err) {
      setError("Could not load blog.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlog();
  }, [id]);

  const handleSave = async () => {
    const token = getToken();
    if (!token) return alert("Please log in to save posts.");
    try {
      const res = await axios.post(`${API_URL}/${id}/save`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setIsSaved(res.data.isSaved);
      alert(res.data.message);
    } catch (err) {
      alert("Error saving blog.");
    }
  };

  const handleLike = async () => {
    const token = getToken();
    if (!token) return alert("Please log in to like blogs.");
    const liked = !blog.liked;
    const likesCount = (blog.likesCount || 0) + (liked ? 1 : -1);
    setBlog({ ...blog, liked, likesCount });
    try {
      await axios.post(`${API_URL}/${id}/like`, {}, { headers: { Authorization: `Bearer ${token}` } });
    } catch (err) { console.error(err); }
  };

  const handleShare = async () => {
    const token = getToken();
    if (!token) return alert("Please log in to share.");
    try {
      await axios.post(`${API_URL}/${id}/share`, {}, { headers: { Authorization: `Bearer ${token}` } });
      alert("Blog shared to your profile.");
    } catch (err) { alert("Could not share."); }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(`${window.location.origin}/blog/${id}`).then(() => alert("Link copied!"));
  };

  const handleDelete = async () => {
    const token = getToken();
    if (!window.confirm("Delete this blog?")) return;
    try {
      await axios.delete(`${API_URL}/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      navigate("/blog");
    } catch (err) { alert("Delete failed."); }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    const token = getToken();
    if (!commentText.trim()) return;
    try {
      const res = await axios.post(`${API_URL}/${id}/comments`, { text: commentText }, { headers: { Authorization: `Bearer ${token}` } });
      setBlog(prev => ({ ...prev, comments: [...(prev.comments || []), res.data.data] }));
      setCommentText("");
    } catch (err) { alert("Comment failed."); }
  };

  const handleDeleteComment = async (commentId) => {
    const token = getToken();
    try {
      await axios.delete(`${API_URL}/${id}/comments/${commentId}`, { headers: { Authorization: `Bearer ${token}` } });
      setBlog(prev => ({ ...prev, comments: prev.comments.filter(c => c._id !== commentId) }));
    } catch (err) { alert("Delete failed."); }
  };

  if (loading) return <div className="travel-blog-feed"><p>Loading...</p></div>;
  if (!blog) return <div className="travel-blog-feed"><p>{error}</p></div>;

  const raw = blog.coverImageUrl || blog.coverImage || blog.imageUrl || "";
  const imgSrc = raw && raw.startsWith("http") ? raw : raw ? `${BACKEND_URL}${raw}` : "";

  return (
    <div className="travel-blog-feed">
      <button onClick={() => navigate("/blog")}>← Back</button>
      <div className="travel-blog-feed__card">
        <div className="travel-blog-feed__card-header">
          <h1>{blog.title}</h1>
          <span className="travel-blog-feed__author">by {blog.authorName}</span>
        </div>
        {imgSrc && <img src={imgSrc} alt={blog.title} style={{ width: '100%', borderRadius: 12 }} />}
        
        <p style={{ 
            marginTop: 20, 
            lineHeight: '1.8', 
            color: '#374151', 
            whiteSpace: 'pre-wrap', 
            fontSize: '1.1rem' 
        }}>
          {blog.content}
        </p>

        <div className="travel-blog-feed__actions" style={{ marginTop: 20, display: 'flex', gap: 10 }}>
          <button onClick={handleLike}>{blog.liked ? "💔 Unlike" : "❤️ Like"} ({blog.likesCount})</button>
          <button onClick={handleSave}>{isSaved ? "🔖 Unsave" : "🔖 Save Later"}</button>
          <button onClick={handleShare}>📤 Share</button>
          <button onClick={handleCopy}>🔗 Copy</button>
          
          
          <button onClick={() => navigate(`/blog/${id}/edit`)}>✏️ Edit</button>
          
          <button onClick={handleDelete}>🗑 Delete</button>
        </div>
      </div>
      <div className="travel-blog-feed__card" style={{ marginTop: 24 }}>
        <h2>Comments</h2>
        {blog.comments.map(c => (
          <div key={c._id} className="travel-blog-feed__comment-card">
            <strong>{c.name}</strong>
            <p>{c.text}</p>
            <button onClick={() => handleDeleteComment(c._id)}>Delete</button>
          </div>
        ))}
        <form onSubmit={handleAddComment} style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 10 }}>
          <input type="text" placeholder="Write a comment..." value={commentText} onChange={(e) => setCommentText(e.target.value)} />
          <button type="submit">Post</button>
        </form>
      </div>
    </div>
  );
};

export default BlogDetails;