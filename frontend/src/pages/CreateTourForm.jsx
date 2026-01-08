import React, { useState, useEffect } from "react";
import axios from "axios";

function CreateTourForm({ token: initialToken }) {
  // 1) Always put ALL HOOKS at the top – fixed
  const [token, setToken] = useState(null);
  const [agencyId, setAgencyId] = useState(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Decode JWT without external libraries
  const decodeToken = (jwt) => {
    try {
      const base64 = jwt.split(".")[1];
      const decoded = JSON.parse(atob(base64));
      return decoded.id; // adjust to your backend payload
    } catch {
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

  // If still checking token, show loading instead of early return
  if (isCheckingAuth) {
    return <p className="text-center mt-10">Checking authentication…</p>;
  }

  // If no token or invalid JWT
  if (!token || !agencyId) {
    return (
        <p className="text-center mt-10 text-red-500">
          Please log in first.
        </p>
    );
  }

  // Form handlers
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await axios.post(
          `/api/tours/${agencyId}/tours`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
      );

      setMessage(res.data.message || "Tour created successfully!");

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
      setMessage(err.response?.data?.message || "Failed to create tour.");
    } finally {
      setLoading(false);
    }
  };

  // Render component
  return (
      <div className="max-w-xl mx-auto mt-10 p-6 bg-white rounded-2xl shadow-lg">
        <h2 className="text-3xl font-bold mb-6 text-center text-blue-600">
          Create New Tour
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">

          {[
            { label: "Title", name: "title" },
            { label: "Destination Country", name: "destinationCountry" },
            { label: "Destination City", name: "destinationCity" },
            { label: "Start Date", name: "startDate", type: "date" },
            { label: "End Date", name: "endDate", type: "date" },
            { label: "Price Per Person", name: "pricePerPerson", type: "number" },
            { label: "Max Group Size", name: "maxGroupSize", type: "number" },
            { label: "Image URL", name: "imageUrl" },
          ].map((f) => (
              <div key={f.name}>
                <label className="block font-medium mb-1">{f.label}</label>
                <input
                    type={f.type || "text"}
                    name={f.name}
                    value={formData[f.name]}
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
          ))}

          <div>
            <label className="block mb-1 font-medium">Description</label>
            <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
            />
          </div>

          <div className="flex items-center gap-3">
            <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
                className="h-4 w-4"
            />
            <label className="font-medium">Active Tour</label>
          </div>

          <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg"
          >
            {loading ? "Creating Tour..." : "Create Tour"}
          </button>
        </form>

        {message && (
            <p
                className={`mt-5 text-center font-medium ${
                    message.includes("success") ? "text-green-600" : "text-red-600"
                }`}
            >
              {message}
            </p>
        )}
      </div>
  );
}

export default CreateTourForm;
