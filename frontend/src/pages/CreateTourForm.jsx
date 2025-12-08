import React, { useState, useEffect, useCallback } from "react";
// Replace axios with standard fetch API call structure for self-contained React environment
// import axios from "axios";
import { Plane, Calendar, DollarSign, Users, MapPin, Image, CheckCircle, Loader2 } from 'lucide-react';
import Nav from "../components/Nav.jsx";

// Utility function to mock JWT decoding (since we cannot rely on external library 'atob' here)
const decodeToken = (jwt) => {
  // Mocking a simple payload extraction for demonstration purposes
  if (jwt && jwt.length > 10) {
    // In a real environment, you'd decode properly. Here we simulate getting an ID.
    return "agency-123";
  }
  return null;
};

// Mock the API call with exponential backoff for resilience
const mockApiPost = async (url, data, headers) => {
  const MAX_RETRIES = 3;
  let delay = 1000;

  for (let i = 0; i < MAX_RETRIES; i++) {
    try {
      // Simulate a successful API response
      if (data.title && data.pricePerPerson > 0) {
        if (i === 0) {
          await new Promise(resolve => setTimeout(resolve, 800)); // Simulate network latency
        }
        return {
          ok: true,
          json: async () => ({ message: `Tour "${data.title}" created successfully!` }),
        };
      } else {
        // Simulate a validation error
        throw new Error("Validation failed: Title and price are required.");
      }
    } catch (error) {
      if (i === MAX_RETRIES - 1) {
        throw new Error("Failed to create tour after multiple retries.");
      }
      // Exponential backoff
      console.warn(`Attempt ${i + 1} failed. Retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
      delay *= 2;
    }
  }
};


function CreateTourForm({ token: initialToken }) {
  // --- State Initialization ---
  const [token, setToken] = useState(null);
  const [agencyId, setAgencyId] = useState(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  const [formData, setFormData] = useState({
    title: "",
    destinationCountry: "",
    destinationCity: "",
    startDate: "",
    endDate: "",
    pricePerPerson: "",
    maxGroupSize: "",
    description: "",
    imageUrl: "",
    isActive: true,
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // --- Authentication Effect ---
  // Check authentication on mount
  useEffect(() => {
    // Mock token retrieval for the self-contained environment
    const saved = initialToken || "mock-jwt-token-abcdef1234567890";

    if (saved) {
      const id = decodeToken(saved);
      setToken(saved);
      setAgencyId(id);
    }

    setIsCheckingAuth(false); // authentication check completed
  }, [initialToken]);


  // --- Handlers ---
  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }, []);


  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setIsSuccess(false);

    // Mock API URL - Replace with your actual backend endpoint
    const mockApiUrl = `http://localhost:8080/api/tours/${agencyId}/tours`;

    try {
      // Use mockApiPost instead of axios
      const res = await mockApiPost(
          mockApiUrl,
          formData,
          {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          }
      );

      const data = await res.json();

      setMessage(data.message || "Tour created successfully!");
      setIsSuccess(true);

      // Clear form on successful submission
      setFormData({
        title: "",
        destinationCountry: "",
        destinationCity: "",
        startDate: "",
        endDate: "",
        pricePerPerson: "",
        maxGroupSize: "",
        description: "",
        imageUrl: "",
        isActive: true,
      });

    } catch (err) {
      console.error(err);
      setMessage(err.message || "Failed to create tour.");
      setIsSuccess(false);
    } finally {
      setLoading(false);
    }
  };


  // --- Render Conditions ---
  if (isCheckingAuth) {
    return (
        <div className="max-w-xl mx-auto mt-20 p-6 flex items-center justify-center bg-white rounded-2xl shadow-xl">
          <Loader2 className="animate-spin w-6 h-6 mr-3 text-indigo-600" />
          <p className="text-lg font-medium text-slate-700">Checking authentication...</p>
        </div>
    );
  }

  if (!token || !agencyId) {
    return (
        <div className="max-w-xl mx-auto mt-20 p-6 text-center bg-white rounded-2xl shadow-xl border border-red-200">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h2>
          <p className="text-slate-600">
            You must be logged in as an agency to create new tours.
          </p>
        </div>
    );
  }

  // --- Render Form ---
  const formFields = [
    { label: "Tour Title", name: "title", icon: Plane, required: true },
    { label: "Country", name: "destinationCountry", icon: MapPin, required: true },
    { label: "City", name: "destinationCity", icon: MapPin, required: true },
    { label: "Start Date", name: "startDate", type: "date", icon: Calendar, required: true },
    { label: "End Date", name: "endDate", type: "date", icon: Calendar, required: true },
    { label: "Price (USD)", name: "pricePerPerson", type: "number", icon: DollarSign, required: true, min: 1 },
    { label: "Max Group Size", name: "maxGroupSize", type: "number", icon: Users, required: true, min: 1 },
    { label: "Image URL", name: "imageUrl", icon: Image, required: false },
  ];

  return (<>
        <Nav/>
      <div className="max-w-3xl mx-auto my-10 p-8 lg:p-10 bg-white rounded-3xl shadow-2xl border border-slate-100">
        <div className="flex items-center justify-center mb-6">
          <Plane className="w-8 h-8 text-indigo-600 mr-3" />
          <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">
            Create New Tour
          </h2>
        </div>
        <p className="text-center text-slate-500 mb-8">
          Fill in the details below to list a new travel experience on WanderGo.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {formFields.map((f) => {
              const Icon = f.icon;
              return (
                  <div key={f.name}>
                    <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center">
                      <Icon className="w-4 h-4 mr-2 text-indigo-500" />
                      {f.label} {f.required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                    <div className="relative">
                      <input
                          type={f.type || "text"}
                          name={f.name}
                          value={formData[f.name]}
                          onChange={handleChange}
                          required={f.required}
                          min={f.min}
                          className="w-full border border-slate-300 rounded-xl px-4 py-3 text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 shadow-sm disabled:bg-slate-50"
                          placeholder={`Enter ${f.label.toLowerCase()}`}
                      />
                    </div>
                  </div>
              );
            })}
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Description</label>
            <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={5}
                className="w-full border border-slate-300 rounded-xl px-4 py-3 text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 shadow-sm"
                placeholder="Provide a detailed description of the tour highlights and itinerary."
            />
          </div>

          <div className="flex items-center gap-4 pt-2">
            <input
                type="checkbox"
                id="isActive"
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
                className="h-5 w-5 text-indigo-600 bg-white border-slate-300 rounded focus:ring-indigo-500 transition duration-150 shadow-sm"
            />
            <label htmlFor="isActive" className="font-semibold text-slate-700 select-none flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              List as Active Tour
            </label>
          </div>

          <button
              type="submit"
              disabled={loading}
              className={`w-full py-4 text-lg font-bold rounded-xl transition duration-300 transform shadow-md ${
                  loading
                      ? "bg-indigo-400 text-indigo-100 cursor-not-allowed"
                      : "bg-indigo-600 text-white hover:bg-indigo-700 hover:scale-[1.005]"
              }`}
          >
            {loading ? (
                <span className="flex items-center justify-center">
                    <Loader2 className="animate-spin w-5 h-5 mr-3" />
                    Creating Tour...
                </span>
            ) : (
                "Create Tour Listing"
            )}
          </button>
        </form>

        {message && (
            <div
                className={`mt-6 p-4 rounded-xl border font-semibold text-center ${
                    isSuccess
                        ? "bg-green-50 border-green-300 text-green-700"
                        : "bg-red-50 border-red-300 text-red-700"
                }`}
            >
              {message}
            </div>
        )}
      </div>
      </>
  );
}

export default CreateTourForm;