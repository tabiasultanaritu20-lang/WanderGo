import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Upload, Save, Image as ImageIcon, Plus } from "lucide-react";

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
    authorName: "", // NEW FIELD
  });

  const [coverImage, setCoverImage] = useState(null);
  const [galleryImages, setGalleryImages] = useState([]);
  
  const [coverPreview, setCoverPreview] = useState(null);
  const [galleryPreviews, setGalleryPreviews] = useState([]);

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
          authorName: d.authorName || "", // Pre-fill if editing
        });
      });
    }
  }, [id, isEdit]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCoverChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCoverImage(file);
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  const handleGalleryChange = (e) => {
    const files = Array.from(e.target.files);
    setGalleryImages((prev) => [...prev, ...files]);
    
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setGalleryPreviews((prev) => [...prev, ...newPreviews]);
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
    
    // Send the custom author name
    if(formData.authorName) {
        data.append("authorName", formData.authorName);
    }

    if (coverImage) {
      data.append("images", coverImage);
    }

    for (let i = 0; i < galleryImages.length; i++) {
      data.append("images", galleryImages[i]);
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
            
            {/* 1. Title */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Title</label>
              <input
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition"
                placeholder="Give your story a catchy title..."
                required
              />
            </div>

            {/* 2. Location & Categories & Author Name */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                  placeholder="e.g., Beach, Food"
                />
              </div>
              
              {/* NEW AUTHOR NAME FIELD */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Author Name</label>
                <input
                  name="authorName"
                  value={formData.authorName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="Your Name (Optional)"
                />
              </div>
            </div>

            {/* 3. COVER IMAGE UPLOAD */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Main Cover Photo <span className="text-slate-400 font-normal">(Required)</span>
              </label>
              <div className="flex items-start gap-4">
                <div className="relative w-full">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleCoverChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <div className={`border-2 border-dashed rounded-xl p-6 text-center transition ${coverPreview ? 'border-indigo-300 bg-indigo-50' : 'border-slate-300 hover:bg-slate-50'}`}>
                    {coverPreview ? (
                      <img src={coverPreview} alt="Cover Preview" className="h-48 w-full object-cover rounded-lg mx-auto" />
                    ) : (
                      <div className="flex flex-col items-center py-4">
                        <ImageIcon className="w-8 h-8 text-slate-400 mb-2" />
                        <span className="text-sm font-medium text-slate-600">Click to upload cover</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* 4. GALLERY UPLOAD */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Gallery Photos <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 relative hover:bg-slate-50 transition">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleGalleryChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <div className="flex flex-col items-center justify-center pointer-events-none py-4">
                    <Plus className="w-8 h-8 text-indigo-500 mb-2" />
                    <span className="text-sm font-medium text-slate-700">Add more photos</span>
                    <span className="text-xs text-slate-500">You can select multiple files</span>
                  </div>
              </div>

              {galleryPreviews.length > 0 && (
                <div className="grid grid-cols-4 gap-2 mt-4">
                  {galleryPreviews.map((src, idx) => (
                    <img key={idx} src={src} alt={`Gallery ${idx}`} className="w-full h-24 object-cover rounded-lg border border-slate-200" />
                  ))}
                </div>
              )}
            </div>

            {/* 5. Content */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Your Story</label>
              <textarea
                name="content"
                value={formData.content}
                onChange={handleChange}
                className="w-full h-60 px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none resize-none leading-relaxed"
                placeholder="Share your experience..."
              />
            </div>

            {/* Submit */}
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