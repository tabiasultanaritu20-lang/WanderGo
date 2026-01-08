import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Save, ArrowLeft, Image as ImageIcon } from 'lucide-react';
import tourApi from '../api/tourApi';
import { toast } from 'react-hot-toast';
import Nav from '../components/Nav';

export default function EditTour() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        title: '',
        destinationCity: '',
        destinationCountry: '',
        pricePerPerson: '',
        startDate: '',
        endDate: '',
        maxGroupSize: '',
        description: '',
        coverImage: '',
        // Add other fields as necessary (difficulty, category, etc.)
    });

    // 1. Fetch Existing Data
    useEffect(() => {
        const fetchTourData = async () => {
            try {
                const response = await tourApi.getById(id);
                const data = response.data.data || response.data;

                // Format date for HTML input (YYYY-MM-DD)
                const formatDateInput = (isoString) => {
                    if(!isoString) return '';
                    return new Date(isoString).toISOString().split('T')[0];
                };

                setFormData({
                    title: data.title || '',
                    destinationCity: data.destinationCity || '',
                    destinationCountry: data.destinationCountry || '',
                    pricePerPerson: data.pricePerPerson || '',
                    startDate: formatDateInput(data.startDate),
                    endDate: formatDateInput(data.endDate),
                    maxGroupSize: data.maxGroupSize || '',
                    description: data.description || '',
                    coverImage: data.coverImage || '',
                });
            } catch (error) {
                console.error("Error fetching tour:", error);
                toast.error("Could not load tour details.");
            } finally {
                setLoading(false);
            }
        };

        fetchTourData();
    }, [id]);

    // 2. Handle Input Change
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // 3. Submit Update
    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);

        try {
            // Send PUT request
            await tourApi.update(id, formData);
            toast.success("Tour updated successfully!");
            // Redirect back to "My Tours"
            navigate('/agency/my-tours');
        } catch (error) {
            console.error("Update failed:", error);
            toast.error(error.response?.data?.message || "Failed to update tour.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

    return (
        <div className="min-h-screen bg-slate-50 font-sans pb-10">
            <Nav />

            <div className="max-w-4xl mx-auto px-4 pt-8">
                <button onClick={() => navigate(-1)} className="flex items-center text-slate-500 hover:text-indigo-600 mb-6 transition">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Cancel & Go Back
                </button>

                <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-8">
                    <div className="flex justify-between items-center mb-8 border-b border-slate-100 pb-6">
                        <h1 className="text-2xl font-bold text-slate-900">Edit Tour</h1>
                        <span className="text-xs font-mono text-slate-400 bg-slate-100 px-2 py-1 rounded">ID: {id}</span>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">

                        {/* Title */}
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Tour Title</label>
                            <input
                                type="text" name="title"
                                value={formData.title} onChange={handleChange}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                                required
                            />
                        </div>

                        {/* Location Group */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">City</label>
                                <input
                                    type="text" name="destinationCity"
                                    value={formData.destinationCity} onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Country</label>
                                <input
                                    type="text" name="destinationCountry"
                                    value={formData.destinationCountry} onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                                    required
                                />
                            </div>
                        </div>

                        {/* Price & Group */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Price Per Person ($)</label>
                                <input
                                    type="number" name="pricePerPerson"
                                    value={formData.pricePerPerson} onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Max Group Size</label>
                                <input
                                    type="number" name="maxGroupSize"
                                    value={formData.maxGroupSize} onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                                    required
                                />
                            </div>
                        </div>

                        {/* Dates */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Start Date</label>
                                <input
                                    type="date" name="startDate"
                                    value={formData.startDate} onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">End Date</label>
                                <input
                                    type="date" name="endDate"
                                    value={formData.endDate} onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                                    required
                                />
                            </div>
                        </div>

                        {/* Cover Image URL */}
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Cover Image URL</label>
                            <div className="flex gap-4 items-start">
                                <div className="flex-1">
                                    <div className="relative">
                                        <ImageIcon className="absolute left-4 top-3.5 text-slate-400 w-5 h-5" />
                                        <input
                                            type="url" name="coverImage"
                                            value={formData.coverImage} onChange={handleChange}
                                            className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                                            placeholder="https://..."
                                        />
                                    </div>
                                </div>
                                {formData.coverImage && (
                                    <div className="w-16 h-16 rounded-lg overflow-hidden border border-slate-200">
                                        <img src={formData.coverImage} alt="Preview" className="w-full h-full object-cover" />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Description</label>
                            <textarea
                                name="description"
                                value={formData.description} onChange={handleChange}
                                rows="6"
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                            ></textarea>
                        </div>

                        {/* Actions */}
                        <div className="pt-6 flex justify-end gap-4 border-t border-slate-100">
                            <button
                                type="button"
                                onClick={() => navigate('/agency/my-tours')}
                                className="px-6 py-3 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={saving}
                                className="px-8 py-3 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition flex items-center gap-2 disabled:opacity-70"
                            >
                                {saving ? "Saving..." : <><Save className="w-4 h-4"/> Save Changes</>}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}