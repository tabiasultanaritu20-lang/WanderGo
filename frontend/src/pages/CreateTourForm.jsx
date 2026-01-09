import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiPlus, FiTrash2, FiImage, FiCalendar, FiMapPin,
  FiDollarSign, FiUsers, FiLayers, FiFileText, FiCheck, FiX
} from "react-icons/fi";
import { motion } from "framer-motion";
import toast, { Toaster } from 'react-hot-toast';

// API
import tourApi from "../api/tourApi"; // Ensure this matches your file path

// Constants matching your Mongoose Schema Enums
const CATEGORIES = ["Adventure", "Cultural", "Relaxation", "Beach", "Hiking", "Wildlife", "City", "Cruise"];
const DIFFICULTIES = ["Easy", "Medium", "Hard", "Extreme"];

export default function CreateTour() {
  const navigate = useNavigate();

  // --- State ---
  const [loading, setLoading] = useState(false);

  // Initial State matches your Mongoose Schema
  const [formData, setFormData] = useState({
    title: "",
    category: "Adventure",
    difficulty: "Medium",
    destinationCountry: "",
    destinationCity: "",
    startDate: "",
    endDate: "",
    pricePerPerson: "",
    maxGroupSize: "",
    description: "",
    coverImage: "",
    images: [""], // Start with one empty slot
    inclusions: [""],
    exclusions: [""],
    itinerary: [
      { day: 1, title: "", description: "" }
    ]
  });

  // --- Handlers ---

  // 1. Basic Inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // 2. Simple Array Inputs (Images, Inclusions, Exclusions)
  const handleArrayChange = (field, index, value) => {
    const updatedArray = [...formData[field]];
    updatedArray[index] = value;
    setFormData(prev => ({ ...prev, [field]: updatedArray }));
  };

  const addArrayItem = (field) => {
    setFormData(prev => ({ ...prev, [field]: [...prev[field], ""] }));
  };

  const removeArrayItem = (field, index) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  // 3. Complex Itinerary Handling
  const handleItineraryChange = (index, field, value) => {
    const updatedItinerary = [...formData.itinerary];
    updatedItinerary[index][field] = value;
    setFormData(prev => ({ ...prev, itinerary: updatedItinerary }));
  };

  const addItineraryDay = () => {
    setFormData(prev => ({
      ...prev,
      itinerary: [
        ...prev.itinerary,
        { day: prev.itinerary.length + 1, title: "", description: "" }
      ]
    }));
  };

  const removeItineraryDay = (index) => {
    const updatedItinerary = formData.itinerary.filter((_, i) => i !== index);
    // Re-calculate day numbers to keep them sequential
    const reindexed = updatedItinerary.map((day, i) => ({ ...day, day: i + 1 }));
    setFormData(prev => ({ ...prev, itinerary: reindexed }));
  };

  // 4. Submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic Client-Side Validation
    if (new Date(formData.startDate) > new Date(formData.endDate)) {
      return toast.error("End date cannot be before start date");
    }

    try {
      setLoading(true);
      const loadingToast = toast.loading("Creating your tour...");

      // Filter out empty strings from arrays before sending
      const cleanData = {
        ...formData,
        images: formData.images.filter(item => item.trim() !== ""),
        inclusions: formData.inclusions.filter(item => item.trim() !== ""),
        exclusions: formData.exclusions.filter(item => item.trim() !== ""),
        // Ensure numbers are numbers
        pricePerPerson: Number(formData.pricePerPerson),
        maxGroupSize: Number(formData.maxGroupSize),
      };

      await tourApi.create(cleanData);

      toast.dismiss(loadingToast);
      toast.success("Tour published successfully!");

      // Redirect after brief delay
      setTimeout(() => {
        navigate("/dashboard"); // Or wherever you want them to go
      }, 1500);

    } catch (error) {
      console.error(error);
      toast.dismiss();
      toast.error(error.response?.data?.message || "Failed to create tour");
    } finally {
      setLoading(false);
    }
  };

  // --- Render Helpers ---
  const SectionTitle = ({ number, title, icon }) => (
      <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-3 pb-4 border-b border-slate-100">
            <span className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-sm font-bold">
                {number}
            </span>
        <span className="flex items-center gap-2">{icon} {title}</span>
      </h2>
  );

  const inputClasses = "w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all outline-none text-slate-700 bg-white font-medium";
  const labelClasses = "block text-xs font-bold text-slate-500 uppercase mb-2 ml-1";

  return (
      <div className="w-full max-w-5xl mx-auto pb-20">
        <Toaster position="top-center" />

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Create New Tour</h1>
          <p className="text-slate-500 mt-2">Design an unforgettable experience for your travelers.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">

          {/* 1. BASIC INFORMATION */}
          <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100">
            <SectionTitle number="1" title="Basic Details" icon={<FiLayers />} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className={labelClasses}>Tour Title</label>
                <input
                    type="text" name="title" required minLength="10"
                    placeholder="e.g., Majestic Swiss Alps Hiking Adventure"
                    value={formData.title} onChange={handleChange}
                    className={inputClasses}
                />
              </div>
              <div>
                <label className={labelClasses}>Category</label>
                <div className="relative">
                  <select name="category" value={formData.category} onChange={handleChange} className={`${inputClasses} appearance-none cursor-pointer`}>
                    {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                  <div className="absolute right-4 top-3.5 pointer-events-none text-slate-400">▼</div>
                </div>
              </div>
              <div>
                <label className={labelClasses}>Difficulty Level</label>
                <div className="relative">
                  <select name="difficulty" value={formData.difficulty} onChange={handleChange} className={`${inputClasses} appearance-none cursor-pointer`}>
                    {DIFFICULTIES.map(dif => <option key={dif} value={dif}>{dif}</option>)}
                  </select>
                  <div className="absolute right-4 top-3.5 pointer-events-none text-slate-400">▼</div>
                </div>
              </div>
            </div>
          </div>

          {/* 2. LOGISTICS */}
          <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100">
            <SectionTitle number="2" title="Logistics & Pricing" icon={<FiMapPin />} />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className={labelClasses}>Country</label>
                <input type="text" name="destinationCountry" required placeholder="e.g. Switzerland" value={formData.destinationCountry} onChange={handleChange} className={inputClasses} />
              </div>
              <div className="lg:col-span-2">
                <label className={labelClasses}>City / Region</label>
                <input type="text" name="destinationCity" required placeholder="e.g. Interlaken" value={formData.destinationCity} onChange={handleChange} className={inputClasses} />
              </div>
              <div>
                <label className={labelClasses}>Start Date</label>
                <div className="relative">
                  <FiCalendar className="absolute left-4 top-3.5 text-slate-400" />
                  <input type="date" name="startDate" required value={formData.startDate} onChange={handleChange} className={`${inputClasses} pl-10`} />
                </div>
              </div>
              <div>
                <label className={labelClasses}>End Date</label>
                <div className="relative">
                  <FiCalendar className="absolute left-4 top-3.5 text-slate-400" />
                  <input type="date" name="endDate" required value={formData.endDate} onChange={handleChange} className={`${inputClasses} pl-10`} />
                </div>
              </div>
              <div>
                <label className={labelClasses}>Max Group Size</label>
                <div className="relative">
                  <FiUsers className="absolute left-4 top-3.5 text-slate-400" />
                  <input type="number" name="maxGroupSize" required min="1" placeholder="15" value={formData.maxGroupSize} onChange={handleChange} className={`${inputClasses} pl-10`} />
                </div>
              </div>
              <div>
                <label className={labelClasses}>Price Per Person ($)</label>
                <div className="relative">
                  <FiDollarSign className="absolute left-4 top-3.5 text-slate-400" />
                  <input type="number" name="pricePerPerson" required min="0" placeholder="1200" value={formData.pricePerPerson} onChange={handleChange} className={`${inputClasses} pl-10`} />
                </div>
              </div>
            </div>
          </div>

          {/* 3. DESCRIPTION */}
          <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100">
            <SectionTitle number="3" title="About The Tour" icon={<FiFileText />} />
            <label className={labelClasses}>Description</label>
            <textarea
                name="description" required rows="6"
                placeholder="Tell the story of the tour. What will travelers experience?"
                value={formData.description} onChange={handleChange}
                className={inputClasses}
            />
          </div>

          {/* 4. VISUALS */}
          <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100">
            <SectionTitle number="4" title="Visuals" icon={<FiImage />} />

            <div className="space-y-6">
              <div>
                <label className={labelClasses}>Cover Image URL</label>
                <input type="url" name="coverImage" required placeholder="https://example.com/cover.jpg" value={formData.coverImage} onChange={handleChange} className={inputClasses} />
                {formData.coverImage && (
                    <img src={formData.coverImage} alt="Cover Preview" className="mt-3 h-48 w-full object-cover rounded-xl border border-slate-200" onError={(e) => e.target.style.display = 'none'} />
                )}
              </div>

              <div>
                <label className={labelClasses}>Gallery Images</label>
                <div className="space-y-3">
                  {formData.images.map((img, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                            type="url"
                            placeholder={`Gallery Image URL ${index + 1}`}
                            value={img}
                            onChange={(e) => handleArrayChange("images", index, e.target.value)}
                            className={inputClasses}
                        />
                        <button
                            type="button"
                            onClick={() => removeArrayItem("images", index)}
                            className="px-4 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition"
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                  ))}
                </div>
                <button type="button" onClick={() => addArrayItem("images")} className="mt-3 text-sm font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
                  <FiPlus /> Add Another Image
                </button>
              </div>
            </div>
          </div>

          {/* 5. ITINERARY */}
          <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100">
            <SectionTitle number="5" title="Daily Itinerary" icon={<FiCheck />} />

            <div className="space-y-4">
              {formData.itinerary.map((day, index) => (
                  <div key={index} className="bg-slate-50 p-6 rounded-2xl border border-slate-200 relative group">
                    <div className="flex justify-between items-center mb-4">
                      <span className="bg-slate-800 text-white text-xs font-bold px-3 py-1 rounded-full">Day {day.day}</span>
                      {formData.itinerary.length > 1 && (
                          <button
                              type="button"
                              onClick={() => removeItineraryDay(index)}
                              className="text-slate-400 hover:text-rose-500 transition"
                          >
                            <FiTrash2 />
                          </button>
                      )}
                    </div>
                    <div className="space-y-4">
                      <input
                          type="text"
                          placeholder="Day Title (e.g. Arrival & Welcome Dinner)"
                          value={day.title}
                          onChange={(e) => handleItineraryChange(index, "title", e.target.value)}
                          className={inputClasses}
                      />
                      <textarea
                          rows="2"
                          placeholder="Brief description of the day's activities..."
                          value={day.description}
                          onChange={(e) => handleItineraryChange(index, "description", e.target.value)}
                          className={inputClasses}
                      />
                    </div>
                  </div>
              ))}
            </div>
            <button
                type="button"
                onClick={addItineraryDay}
                className="w-full mt-6 py-4 border-2 border-dashed border-slate-300 rounded-xl text-slate-500 font-bold hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 transition flex items-center justify-center gap-2"
            >
              <FiPlus /> Add Day {formData.itinerary.length + 1}
            </button>
          </div>

          {/* 6. INCLUSIONS / EXCLUSIONS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100">
              <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2 text-emerald-600">
                <FiCheck /> What's Included
              </h3>
              <div className="space-y-2">
                {formData.inclusions.map((item, index) => (
                    <div key={index} className="flex gap-2">
                      <input type="text" value={item} onChange={(e) => handleArrayChange("inclusions", index, e.target.value)} className={`${inputClasses} py-2`} />
                      <button type="button" onClick={() => removeArrayItem("inclusions", index)} className="text-slate-400 hover:text-rose-500"><FiX /></button>
                    </div>
                ))}
              </div>
              <button type="button" onClick={() => addArrayItem("inclusions")} className="mt-3 text-sm font-bold text-emerald-600 hover:text-emerald-700">+ Add Item</button>
            </div>

            <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100">
              <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2 text-rose-500">
                <FiX /> What's Excluded
              </h3>
              <div className="space-y-2">
                {formData.exclusions.map((item, index) => (
                    <div key={index} className="flex gap-2">
                      <input type="text" value={item} onChange={(e) => handleArrayChange("exclusions", index, e.target.value)} className={`${inputClasses} py-2`} />
                      <button type="button" onClick={() => removeArrayItem("exclusions", index)} className="text-slate-400 hover:text-rose-500"><FiX /></button>
                    </div>
                ))}
              </div>
              <button type="button" onClick={() => addArrayItem("exclusions")} className="mt-3 text-sm font-bold text-rose-600 hover:text-rose-700">+ Add Item</button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-4 pt-4">
            <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-8 py-3 rounded-xl border border-slate-300 text-slate-600 font-bold hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
                type="submit"
                disabled={loading}
                className="px-8 py-3 rounded-xl bg-indigo-600 text-white font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:shadow-xl hover:-translate-y-1 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? "Publishing..." : "Publish Tour"}
            </button>
          </div>

        </form>
      </div>
  );
}