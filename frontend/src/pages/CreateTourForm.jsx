import React, { useState, useEffect, useCallback } from "react";
import {
  Plane, Calendar, DollarSign, Users, MapPin,
  Image, CheckCircle, Loader2, AlertCircle
} from 'lucide-react';
import Nav from "../components/Nav.jsx";

// --- Mock Utilities (Kept from your original code) ---
const decodeToken = (jwt) => {
  if (jwt && jwt.length > 10) return "agency-123";
  return null;
};

const mockApiPost = async (url, data, headers) => {
  const MAX_RETRIES = 3;
  let delay = 1000;
  for (let i = 0; i < MAX_RETRIES; i++) {
    try {
      if (data.title && data.pricePerPerson > 0) {
        if (i === 0) await new Promise(resolve => setTimeout(resolve, 800));
        return {
          ok: true,
          json: async () => ({ message: `Tour "${data.title}" created successfully!` }),
        };
      } else {
        throw new Error("Validation failed: Title and price are required.");
      }
    } catch (error) {
      if (i === MAX_RETRIES - 1) throw new Error("Failed to create tour after multiple retries.");
      await new Promise(resolve => setTimeout(resolve, delay));
      delay *= 2;
    }
  }
};

function CreateTourForm({ token: initialToken }) {
  // --- State ---
  const [token, setToken] = useState(null);
  const [agencyId, setAgencyId] = useState(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Decode JWT without external libraries
  const decodeToken = (jwt) => {
    try {
      const base64 = jwt.split(".")[1];
      const decoded = JSON.parse(atob(base64));
      return decoded.id; // adjust to your backend payload
    } catch (err) {
      return null;
    }
  };

  // Check authentication on mount
  useEffect(() => {
    const saved = initialToken || localStorage.getItem("token");

    if (saved) {
      const id = decodeToken(saved);
      setToken(saved);
      setAgencyId(id);
    }

    setIsCheckingAuth(false); // authentication check completed
  }, [initialToken]);

  // 2) Declare all form hooks (always at top level)
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

  // --- Effects ---
  useEffect(() => {
    const saved = initialToken || "mock-jwt-token-abcdef1234567890";
    if (saved) {
      const id = decodeToken(saved);
      setToken(saved);
      setAgencyId(id);
    }
    setIsCheckingAuth(false);
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

    const mockApiUrl = `http://localhost:8080/api/tours/${agencyId}/tours`;

    try {
      const res = await axios.post(
          `http://localhost:8080/api/tours/${agencyId}/tours`,
          formData,
          { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }
      );
      const data = await res.json();
      setMessage(data.message || "Tour created successfully!");
      setIsSuccess(true);
      setFormData({
        title: "", destinationCountry: "", destinationCity: "", startDate: "",
        endDate: "", pricePerPerson: "", maxGroupSize: "", description: "",
        imageUrl: "", isActive: true,
      });
    } catch (err) {
      console.error(err);
      setMessage(err.message || "Failed to create tour.");
      setIsSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  // --- Render: Loading State ---
  if (isCheckingAuth) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <div className="flex flex-col items-center animate-pulse">
            <Loader2 className="animate-spin w-10 h-10 text-indigo-600 mb-4" />
            <p className="text-slate-500 font-medium">Verifying credentials...</p>
          </div>
        </div>
    );
  }

  // --- Render: Access Denied ---
  if (!token || !agencyId) {
    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center border-t-4 border-red-500">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Access Denied</h2>
            <p className="text-slate-600">Please log in as an agency to access this page.</p>
          </div>
        </div>
    );
  }

  const formFields = [
    { label: "Tour Title", name: "title", icon: Plane, required: true, placeholder: "e.g. Bali Adventure 2024" },
    { label: "Country", name: "destinationCountry", icon: MapPin, required: true, placeholder: "e.g. Indonesia" },
    { label: "City", name: "destinationCity", icon: MapPin, required: true, placeholder: "e.g. Ubud" },
    { label: "Start Date", name: "startDate", type: "date", icon: Calendar, required: true },
    { label: "End Date", name: "endDate", type: "date", icon: Calendar, required: true },
    { label: "Price (USD)", name: "pricePerPerson", type: "number", icon: DollarSign, required: true, min: 1, placeholder: "0.00" },
    { label: "Max Group Size", name: "maxGroupSize", type: "number", icon: Users, required: true, min: 1, placeholder: "e.g. 15" },
    { label: "Image URL", name: "imageUrl", icon: Image, required: false, placeholder: "https://..." },
  ];

  return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-slate-50 to-blue-50">
        <Nav />

        <main className="container mx-auto px-4 py-8 lg:py-12">
          <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden transition-all duration-300 hover:shadow-2xl">

            {/* Header Section */}
            <div className="bg-indigo-600 px-6 py-8 md:px-10 md:py-10 text-center relative overflow-hidden">
              {/* Decorative background circle */}
              <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-indigo-500 rounded-full opacity-50 blur-2xl"></div>
              <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-indigo-700 rounded-full opacity-50 blur-2xl"></div>

              <div className="relative z-10">
                <div className="inline-flex items-center justify-center p-3 bg-indigo-500/30 rounded-full mb-4 backdrop-blur-sm">
                  <Plane className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight mb-2">
                  Create New Tour
                </h2>
                <p className="text-indigo-100 max-w-lg mx-auto text-sm md:text-base">
                  Design a new experience for your travelers. Fill in the details below to launch your next adventure.
                </p>
              </div>
            </div>

            {/* Form Section */}
            <div className="p-6 md:p-10">
              <form onSubmit={handleSubmit} className="space-y-8">

                {/* Grid Container */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                  {formFields.map((f) => {
                    const Icon = f.icon;
                    return (
                        <div key={f.name} className="group">
                          <label className="block text-sm font-semibold text-slate-700 mb-2 transition-colors group-focus-within:text-indigo-600">
                            {f.label} {f.required && <span className="text-red-400">*</span>}
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <Icon className="h-5 w-5 text-slate-400 transition-colors group-focus-within:text-indigo-500" />
                            </div>
                            <input
                                type={f.type || "text"}
                                name={f.name}
                                value={formData[f.name]}
                                onChange={handleChange}
                                required={f.required}
                                min={f.min}
                                placeholder={f.placeholder}
                                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400
                                     focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500
                                     transition-all duration-200 ease-in-out shadow-sm hover:border-slate-300"
                            />
                          </div>
                        </div>
                    );
                  })}
                </div>

                {/* Full Width Description */}
                <div className="group">
                  <label className="block text-sm font-semibold text-slate-700 mb-2 transition-colors group-focus-within:text-indigo-600">
                    Description
                  </label>
                  <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      rows={5}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400
                             focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500
                             transition-all duration-200 ease-in-out shadow-sm hover:border-slate-300 resize-y"
                      placeholder="Tell a story about this tour..."
                  />
                </div>

                {/* Toggle Switch & Submit */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-4 border-t border-slate-100">

                  {/* Custom Toggle Checkbox */}
                  <label className="flex items-center cursor-pointer relative group">
                    <input
                        type="checkbox"
                        name="isActive"
                        checked={formData.isActive}
                        onChange={handleChange}
                        className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                    <span className="ml-3 text-sm font-medium text-slate-700 group-hover:text-indigo-600 transition-colors">
                    List as Active Tour
                  </span>
                  </label>

                  <button
                      type="submit"
                      disabled={loading}
                      className={`w-full md:w-auto px-8 py-3.5 rounded-xl font-bold text-white shadow-lg shadow-indigo-500/30 
                              transform transition-all duration-200 focus:ring-4 focus:ring-indigo-300
                              ${loading
                          ? "bg-indigo-400 cursor-wait"
                          : "bg-indigo-600 hover:bg-indigo-700 hover:-translate-y-0.5 active:translate-y-0"
                      }`}
                  >
                    {loading ? (
                        <span className="flex items-center justify-center gap-2">
                      <Loader2 className="animate-spin w-5 h-5" />
                      Creating...
                    </span>
                    ) : (
                        "Create Listing"
                    )}
                  </button>
                </div>
              </form>

              {/* Notifications */}
              {message && (
                  <div
                      className={`mt-8 p-4 rounded-xl flex items-center justify-center text-sm md:text-base font-medium border animate-in fade-in slide-in-from-bottom-2 duration-300 ${
                          isSuccess
                              ? "bg-green-50 border-green-200 text-green-700"
                              : "bg-red-50 border-red-200 text-red-700"
                      }`}
                  >
                    {isSuccess ? <CheckCircle className="w-5 h-5 mr-2" /> : <AlertCircle className="w-5 h-5 mr-2" />}
                    {message}
                  </div>
              )}
            </div>
          </div>
        </main>
      </div>
  );
}

export default CreateTourForm;