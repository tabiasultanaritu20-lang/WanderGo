import React, { useState } from "react";
import axios from "axios";

function CreateTourForm() {
  const [formData, setFormData] = useState({
    title: "",
    destinationCountry: "",
    destinationCity: "",
    startDate: "",
    endDate: "",
    pricePerPerson: "",
    maxGroupSize: "",
    description: "",
    imageUrl: ""
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // Suppose you stored agency info after login
  const agencyData = JSON.parse(localStorage.getItem("agencyData"));
  const token = localStorage.getItem("token");

  if (!agencyData) {
    return <p className="text-red-500">Please log in as an agency first.</p>;
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const response = await axios.post(
        `http://localhost:5000/api/tours/${agencyData.id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        }
      );

      setMessage(response.data.message || "Tour created successfully!");
      setFormData({
        title: "",
        destinationCountry: "",
        destinationCity: "",
        startDate: "",
        endDate: "",
        pricePerPerson: "",
        maxGroupSize: "",
        description: "",
        imageUrl: ""
      });
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to create tour.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 bg-white rounded-2xl shadow">
      <h2 className="text-2xl font-semibold mb-4 text-center">Create New Tour</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {[
          { label: "Title", name: "title" },
          { label: "Destination Country", name: "destinationCountry" },
          { label: "Destination City", name: "destinationCity" },
          { label: "Start Date", name: "startDate", type: "date" },
          { label: "End Date", name: "endDate", type: "date" },
          { label: "Price Per Person", name: "pricePerPerson", type: "number" },
          { label: "Max Group Size", name: "maxGroupSize", type: "number" },
          { label: "Image URL", name: "imageUrl" }
        ].map((field) => (
          <div key={field.name}>
            <label className="block font-medium text-gray-700 mb-1">{field.label}</label>
            <input
              type={field.type || "text"}
              name={field.name}
              value={formData[field.name]}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
          </div>
        ))}

        <div>
          <label className="block font-medium text-gray-700 mb-1">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          ></textarea>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
        >
          {loading ? "Posting..." : "Create Tour"}
        </button>
      </form>

      {message && (
        <p className={`mt-4 text-center ${message.includes("success") ? "text-green-600" : "text-red-600"}`}>
          {message}
        </p>
      )}
    </div>
  );
}

export default CreateTourForm;
