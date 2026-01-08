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
  
  // New state to handle the "Active" image being viewed
  const [mainImage, setMainImage] = useState("");

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

      // Set the initial main image (prioritize cover, then fallback)
      const initialImage = data.coverImageUrl || data.coverImage || data.imageUrl || (data.images && data.images[0]) || "";
      setMainImage(initialImage);

    } catch (err) {
      setError("Could not load blog.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlog();
  }, [id]);

  // Helper to fix broken image URLs (adds localhost:8080 if needed)
  const getImgUrl = (path) => {
    if (!path) return "";
    return path.startsWith("http") ? path : `${BACKEND_URL}${path}`;
  };

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

  const handleCopyLink = () => {
    const currentUrl = window.location.href;
    navigator.clipboard.writeText(currentUrl).then(() => {
        alert("Link copied to clipboard!");
    }).catch(err => {
        console.error('Failed to copy: ', err);
    });
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

  // Collect ALL images into one array for the gallery
  const allImages = [
    blog.coverImageUrl || blog.coverImage || blog.imageUrl, // The main cover
    ...(blog.images || []) // Any additional images uploaded
  ].filter(Boolean); // Remove null/undefined entries

  // Remove duplicates just in case
  const uniqueImages = [...new Set(allImages)];

  return (
    <div className="travel-blog-feed">
      <button 
        onClick={() => navigate("/blog")}
        style={{ marginBottom: 15, padding: "8px 16px", cursor: "pointer", border:"none", background:"transparent", fontSize:"1rem", fontWeight:"bold" }}
      >
        ← Back to Feed
      </button>

      <div className="travel-blog-feed__card">
        <div className="travel-blog-feed__card-header">
          <h1>{blog.title}</h1>
          <span className="travel-blog-feed__author">by {blog.authorName}</span>
        </div>

        {/* --- MAIN IMAGE DISPLAY --- */}
        {mainImage && (
            <div style={{ width: '100%', height: '400px', overflow: 'hidden', borderRadius: 12, marginBottom: 10, background: '#f3f4f6' }}>
                <img 
                    src={getImgUrl(mainImage)} 
                    alt="Main view" 
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
                />
            </div>
        )}

        {/* --- IMAGE GALLERY (THUMBNAILS) --- */}
        {uniqueImages.length > 1 && (
            <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 10 }}>
                {uniqueImages.map((img, index) => (
                    <img 
                        key={index}
                        src={getImgUrl(img)}
                        alt={`Gallery ${index}`}
                        onClick={() => setMainImage(img)}
                        style={{
                            width: 80, 
                            height: 80, 
                            objectFit: 'cover', 
                            borderRadius: 8, 
                            cursor: 'pointer',
                            border: mainImage === img ? '3px solid #4F46E5' : '1px solid #e5e7eb',
                            opacity: mainImage === img ? 1 : 0.7,
                            transition: 'all 0.2s'
                        }}
                    />
                ))}
            </div>
        )}
        
        <p style={{ 
            marginTop: 20, 
            lineHeight: '1.8', 
            color: '#374151', 
            whiteSpace: 'pre-wrap', 
            fontSize: '1.1rem' 
        }}>
          {blog.content}
        </p>

        <div className="travel-blog-feed__actions" style={{ marginTop: 20, display: 'flex', gap: 10, flexWrap: "wrap" }}>
          <button onClick={handleLike}>{blog.liked ? "💔 Unlike" : "❤️ Like"} ({blog.likesCount})</button>
          <button onClick={handleSave}>{isSaved ? "🔖 Unsave" : "🔖 Save Later"}</button>
          <button onClick={handleCopyLink}>🔗 Copy Link</button>
          <button onClick={() => navigate(`/blog/${id}/edit`)}>✏️ Edit</button>
          <button onClick={handleDelete}>🗑 Delete</button>
        </div>
      </div>

      <div className="travel-blog-feed__card" style={{ marginTop: 24 }}>
        <h2>Comments</h2>
        {blog.comments.length === 0 && <p style={{color:'#666', fontStyle:'italic'}}>No comments yet. Be the first!</p>}
        {blog.comments.map(c => (
          <div key={c._id} className="travel-blog-feed__comment-card">
            <strong>{c.name}</strong>
            <p>{c.text}</p>
            {/* Only show delete if user owns comment (This logic might need update based on your user object) */}
            <button onClick={() => handleDeleteComment(c._id)} style={{color:'red', fontSize:'0.8rem'}}>Delete</button>
          </div>
        ))}
        <form onSubmit={handleAddComment} style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 15 }}>
          <input 
            type="text" 
            placeholder="Write a comment..." 
            value={commentText} 
            onChange={(e) => setCommentText(e.target.value)} 
            style={{ padding: 10, borderRadius: 8, border: '1px solid #ddd' }}
          />
          <button type="submit" style={{ alignSelf: 'flex-start', background:'#4F46E5', color:'white' }}>Post Comment</button>
        </form>
      </div>
    </div>
  );
};

export default BlogDetails;