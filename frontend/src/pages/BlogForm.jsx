import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Upload, Save } from "lucide-react";

const API_URL = "http://localhost:8080/api/blogs";

const BlogForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [formData, setFormData] = useState({
    title: "",
    content: "", 
    location: "",
    categories: "",
  });
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isEdit) {
      axios.get(`${API_URL}/${id}`).then((res) => {
        const d = res.data.data || res.data;
        setFormData({
          title: d.title || "",
          content: d.content || "",
          location: d.location || "",
          categories: (d.categories || []).join(", "),
        });
      });
    }
  }, [id, isEdit]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setImages(e.target.files);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const token = localStorage.getItem("token");

    const data = new FormData();
    data.append("title", formData.title);
    data.append("content", formData.content);
    data.append("location", formData.location);
    data.append("categories", formData.categories);

    for (let i = 0; i < images.length; i++) {
      data.append("images", images[i]);
    }

    try {
      if (isEdit) {
        await axios.put(`${API_URL}/${id}`, data, {
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
        });
      } else {
        await axios.post(API_URL, data, {
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
        });
      }
      navigate("/blog");
    } catch (err) {
      console.error("Error saving blog:", err);
      alert("Failed to save blog.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="max-w-3xl mx-auto">
        <button onClick={() => navigate("/blog")} className="flex items-center text-slate-500 hover:text-slate-800 mb-6 transition">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Feed
        </button>

        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/50">
            <h1 className="text-2xl font-bold text-slate-800">
              {isEdit ? "Edit Story" : "Write a New Story"}
            </h1>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Title</label>
              <input
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                placeholder="Give your story a catchy title..."
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Location</label>
                <input
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="e.g., Bali, Indonesia"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Categories</label>
                <input
                  name="categories"
                  value={formData.categories}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="e.g., Beach, Food, Budget"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Cover Image & Gallery</label>
              <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:bg-slate-50 transition cursor-pointer relative">
                <input
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <div className="flex flex-col items-center justify-center pointer-events-none">
                  <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mb-3">
                    <Upload className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-medium text-slate-900">Click to upload photos</p>
                  <p className="text-xs text-slate-500 mt-1">JPG, PNG up to 10MB</p>
                </div>
              </div>
              {images.length > 0 && (
                <p className="text-sm text-green-600 mt-2 font-medium">{images.length} files selected</p>
              )}
            </div>

            {/* STANDARD TEXT AREA (No Crashes) */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Your Story</label>
              <textarea
                name="content"
                value={formData.content}
                onChange={handleChange}
                className="w-full h-80 px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none resize-none leading-relaxed"
                placeholder="Share your experience..."
              />
            </div>

            <div className="pt-6 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition shadow-lg shadow-indigo-200 disabled:opacity-50"
              >
                {loading ? "Saving..." : (
                  <>
                    <Save className="w-5 h-5" />
                    Publish Story
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BlogForm;