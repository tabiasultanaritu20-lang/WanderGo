import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import "./TravelBlogFeed.css";

const API_URL = "http://localhost:8080/api/blogs";

const BlogForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [location, setLocation] = useState("");
  const [categoriesText, setCategoriesText] = useState("");
  const [content, setContent] = useState("");

  const [imageFiles, setImageFiles] = useState([]);

  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!id) return;

    const load = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_URL}/${id}`);
        const b = res.data?.data || res.data;

        setTitle(b?.title || "");
        setAuthorName(b?.authorName || "");
        setLocation(b?.location || "");
        setCategoriesText(Array.isArray(b?.categories) ? b.categories.join(", ") : (b?.categories || ""));
        setContent((b?.content || b?.body || "").toString());
      } catch (e) {
        console.error(e);
        alert("Failed to load blog");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) return alert("Login required");

    if (!title.trim() || !content.trim()) return alert("Title and content required");

    const formData = new FormData();
    formData.append("title", title);
    formData.append("authorName", authorName);
    formData.append("location", location);
    formData.append("content", content);
    formData.append("categories", categoriesText);

    imageFiles.forEach((file) => {
      formData.append("images", file);
    });

    try {
      setLoading(true);

      const headers = { Authorization: `Bearer ${token}` };

      if (id) {
        await axios.put(`${API_URL}/${id}`, formData, { headers });
      } else {
        await axios.post(API_URL, formData, { headers });
      }

      navigate("/blog");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Server error while creating blog");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="travel-blog-feed">
      <button onClick={() => navigate("/blog")} style={{ marginBottom: 16 }}>
        ← Back
      </button>

      <div className="travel-blog-feed__card">
        <h2 style={{ marginTop: 0 }}>{id ? "Edit Blog" : "Create New Blog"}</h2>

        <form onSubmit={handleSubmit} className="blog-form">
          <div className="blog-form__row">
            <div className="blog-form__field">
              <label>Title *</label>
              <input
                type="text"
                placeholder="Trip to Cox's Bazar"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="blog-form__field">
              <label>Author</label>
              <input
                type="text"
                placeholder="Your name"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
              />
            </div>
          </div>

          <div className="blog-form__row">
            <div className="blog-form__field">
              <label>Location</label>
              <input
                type="text"
                placeholder="Cox's Bazar, Bangladesh"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>

            <div className="blog-form__field">
              <label>Categories (comma separated)</label>
              <input
                type="text"
                placeholder="Beach, Food"
                value={categoriesText}
                onChange={(e) => setCategoriesText(e.target.value)}
              />
            </div>
          </div>

          <div className="blog-form__field">
            <label>Images </label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => setImageFiles(Array.from(e.target.files || []))}
            />
            {imageFiles.length > 0 && (
              <small style={{ display: "block", marginTop: 6 }}>
                Selected: {imageFiles.length} file(s)
              </small>
            )}
          </div>

          <div className="blog-form__field">
            <label>Content *</label>
            <textarea
              rows="8"
              placeholder="Write your travel story..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
            />
          </div>

          <button type="submit" disabled={loading}>
            {loading ? "Publishing..." : id ? "Update" : "Publish"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default BlogForm;
