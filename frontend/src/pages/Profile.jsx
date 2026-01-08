import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
    FiUser, FiMail, FiMapPin, FiPhone, FiGlobe, FiInstagram, FiFacebook,
    FiCheckCircle, FiStar, FiEdit2, FiSave, FiX, FiShield, FiMessageSquare, FiSend,
    FiLogOut, FiCamera, FiLoader
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import toast, { Toaster } from 'react-hot-toast';

// API Imports (Ensure these point to your actual API files)
import userApi from "../api/userApi";
import reviewApi from "../api/reviewApi";
import useUser from "../../hooks/userInfo.js"; // Assuming this hook decodes your JWT

export default function Profile() {
    const { id } = useParams();
    const navigate = useNavigate();
    const currentUser = useUser(); // Your custom hook

    // --- State ---
    const [profileUser, setProfileUser] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isOwnProfile, setIsOwnProfile] = useState(false);

    // Edit Form State
    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);

    // Initial Form State (Matches your User Model Structure)
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phoneNumber: "", // Changed from number to phoneNumber to match new model
        country: "",     // Root level
        city: "",        // Root level
        description: "",
        socialLinks: {
            facebook: "",
            instagram: "",
            website: ""
        }
    });

    // Image Upload State
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);

    // Review State
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState("");
    const [hoverStar, setHoverStar] = useState(0);
    const [submittingReview, setSubmittingReview] = useState(false);

    // --- 1. Load Data ---
    useEffect(() => {
        const fetchProfileData = async () => {
            try {
                setLoading(true);

                // Determine which ID to fetch (URL param or Current User)
                const targetId = id || currentUser.id;

                if (!targetId) return;

                // A. Fetch User
                const response = await userApi.getById(targetId);
                const fetchedUser = response.data;
                setProfileUser(fetchedUser);

                // Check ownership
                // Note: Ensure currentUser.id matches the type (string) of fetchedUser._id
                const isMe = currentUser.id === fetchedUser._id;
                setIsOwnProfile(isMe);

                // B. Pre-fill Form if it's me
                if (isMe) {
                    setFormData({
                        name: fetchedUser.name || "",
                        email: fetchedUser.email || "",
                        phoneNumber: fetchedUser.number || fetchedUser.phoneNumber || "", // Handle both legacy/new
                        country: fetchedUser.country || "",
                        city: fetchedUser.city || "",
                        description: fetchedUser.description || "",
                        socialLinks: {
                            facebook: fetchedUser.socialLinks?.facebook || "",
                            instagram: fetchedUser.socialLinks?.instagram || "",
                            website: fetchedUser.socialLinks?.website || ""
                        }
                    });
                }

                // C. Fetch Reviews
                try {
                    const reviewsRes = await reviewApi.getAllByUser(targetId);
                    // Handle different response structures (res.data or res.data.data)
                    const reviewData = Array.isArray(reviewsRes.data) ? reviewsRes.data : (reviewsRes.data.data || []);
                    setReviews(reviewData);
                } catch (err) {
                    // Fail silently for reviews, user might just have none
                    setReviews([]);
                }

            } catch (error) {
                console.error("Profile Load Error:", error);
                toast.error("Could not load profile.");
            } finally {
                setLoading(false);
            }
        };

        fetchProfileData();
    }, [id, currentUser.id]);

    // --- Handlers ---

    // Handle Text Inputs
    const handleEditChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Handle Nested Social Links
    const handleSocialChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            socialLinks: { ...prev.socialLinks, [name]: value }
        }));
    };

    // Handle File Selection
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Basic validation
            if (file.size > 5 * 1024 * 1024) return toast.error("File too large (Max 5MB)");

            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    // Handle Profile Update
    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setSaving(true);
        const loadingToast = toast.loading("Saving changes...");

        try {
            // We use FormData because we are sending a file along with text
            const data = new FormData();

            data.append("name", formData.name);
            data.append("number", formData.phoneNumber); // Maps to 'number' in your Schema
            data.append("country", formData.country);
            data.append("city", formData.city);
            data.append("description", formData.description);

            // Important: Backend needs to parse this JSON string if using multer
            data.append("socialLinks", JSON.stringify(formData.socialLinks));

            if (selectedFile) {
                data.append("profilePicture", selectedFile);
            }

            // Call API
            const res = await userApi.update(profileUser._id, data);

            // Update Local State
            setProfileUser(res.data.updatedUser || res.data);
            setIsEditing(false);

            toast.success("Profile updated!");
        } catch (error) {
            console.error("Update failed", error);
            toast.error(error.response?.data?.message || "Update failed");
        } finally {
            toast.dismiss(loadingToast);
            setSaving(false);
        }
    };

    const handleLogout = () => {
        if (window.confirm("Log out now?")) {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            navigate("/login");
        }
    };

    // --- Loading State ---
    if (loading) return (
        <div className="flex h-screen w-full items-center justify-center bg-slate-50 text-indigo-600">
            <FiLoader className="animate-spin text-4xl" />
        </div>
    );

    if (!profileUser) return (
        <div className="flex h-screen items-center justify-center">User not found.</div>
    );

    return (
        <div className="min-h-screen bg-slate-50 font-sans pb-12">
            <Toaster position="top-center" />

            <div className="max-w-6xl mx-auto px-4 py-8">

                {/* --- HERO SECTION --- */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100 mb-8"
                >
                    {/* Cover Gradient */}
                    <div className="h-48 bg-gradient-to-r from-indigo-600 to-purple-700 relative">
                        {isOwnProfile && (
                            <div className="absolute top-6 right-6 flex gap-3 z-10">
                                <button onClick={handleLogout} className="bg-rose-500/20 backdrop-blur text-white px-4 py-2 rounded-full text-sm font-bold hover:bg-rose-500 transition border border-white/20 flex items-center gap-2">
                                    <FiLogOut /> Logout
                                </button>
                                {!isEditing && (
                                    <button onClick={() => setIsEditing(true)} className="bg-white/20 backdrop-blur text-white px-4 py-2 rounded-full text-sm font-bold hover:bg-white/30 transition border border-white/20 flex items-center gap-2">
                                        <FiEdit2 /> Edit
                                    </button>
                                )}
                            </div>
                        )}

                        {/* Avatar Container */}
                        <div className="absolute -bottom-16 left-8 md:left-12">
                            <div className="w-32 h-32 rounded-full bg-white p-1.5 shadow-2xl relative group">
                                <div className="w-full h-full rounded-full bg-slate-100 flex items-center justify-center overflow-hidden border border-slate-200 relative">
                                    {previewUrl ? (
                                        <img src={previewUrl} className="w-full h-full object-cover" alt="Preview"/>
                                    ) : profileUser.profilePictureUrl ? (
                                        <img src={profileUser.profilePictureUrl} className="w-full h-full object-cover" alt="Profile"/>
                                    ) : (
                                        <span className="text-4xl font-bold text-indigo-300">
                                            {profileUser.name?.charAt(0).toUpperCase()}
                                        </span>
                                    )}

                                    {/* Edit Overlay */}
                                    {isEditing && (
                                        <label className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                                            <FiCamera className="text-white text-2xl mb-1" />
                                            <span className="text-xs text-white font-medium">Change</span>
                                            <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                                        </label>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Info Section */}
                    <div className="pt-20 pb-8 px-8 md:px-12">
                        <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                            <div>
                                <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-2">
                                    {profileUser.name}
                                    {profileUser.isVerified && <FiCheckCircle className="text-blue-500" />}
                                </h1>
                                <p className="text-indigo-600 font-bold text-sm uppercase tracking-wide mt-1">
                                    {profileUser.role}
                                </p>

                                {/* Rating Badge */}
                                <div className="flex items-center gap-1 mt-3 bg-amber-50 w-fit px-3 py-1 rounded-full border border-amber-100">
                                    <FiStar className="text-amber-400 fill-amber-400" />
                                    <span className="text-slate-800 font-bold">{profileUser.ratingsAverage || 0}</span>
                                    <span className="text-slate-400 text-xs ml-1">({profileUser.ratingsQuantity || 0} reviews)</span>
                                </div>
                            </div>
                        </div>

                        {/* --- VIEW MODE --- */}
                        {!isEditing ? (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
                                {/* Left: Bio */}
                                <div className="md:col-span-2">
                                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">About</h3>
                                    <p className="text-slate-600 leading-relaxed text-lg">
                                        {profileUser.description || <span className="italic text-slate-400">No bio provided yet.</span>}
                                    </p>

                                    <div className="flex flex-wrap gap-3 mt-6">
                                        {(profileUser.city || profileUser.country) && (
                                            <span className="flex items-center gap-2 text-slate-600 bg-slate-50 px-4 py-2 rounded-xl text-sm font-semibold border border-slate-100">
                                                <FiMapPin className="text-indigo-500"/>
                                                {[profileUser.city, profileUser.country].filter(Boolean).join(", ")}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Right: Contact */}
                                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 h-fit">
                                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Contact</h3>
                                    <div className="space-y-4">
                                        {profileUser.email && (
                                            <div className="flex items-center gap-3 text-slate-700 text-sm">
                                                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-indigo-500 shadow-sm"><FiMail /></div>
                                                <span className="truncate">{profileUser.email}</span>
                                            </div>
                                        )}
                                        {profileUser.number && (
                                            <div className="flex items-center gap-3 text-slate-700 text-sm">
                                                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-emerald-500 shadow-sm"><FiPhone /></div>
                                                <span>{profileUser.number}</span>
                                            </div>
                                        )}

                                        {/* Social Links */}
                                        <div className="pt-4 flex gap-2 border-t border-slate-200 mt-2">
                                            {profileUser.socialLinks?.website && <SocialIcon href={profileUser.socialLinks.website} icon={<FiGlobe />} />}
                                            {profileUser.socialLinks?.instagram && <SocialIcon href={profileUser.socialLinks.instagram} icon={<FiInstagram />} color="text-pink-600" />}
                                            {profileUser.socialLinks?.facebook && <SocialIcon href={profileUser.socialLinks.facebook} icon={<FiFacebook />} color="text-blue-600" />}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ) : (
                            /* --- EDIT MODE --- */
                            <motion.form
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                onSubmit={handleUpdateProfile}
                                className="mt-8 bg-slate-50 p-6 rounded-2xl border border-slate-200"
                            >
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="font-bold text-slate-700">Edit Profile Details</h3>
                                    <button type="button" onClick={() => setIsEditing(false)} className="text-rose-500 font-bold text-sm flex items-center gap-1 hover:bg-rose-50 px-3 py-1 rounded-lg">
                                        <FiX /> Cancel
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <InputField label="Full Name" name="name" value={formData.name} onChange={handleEditChange} icon={<FiUser />} />
                                        <InputField label="Phone Number" name="phoneNumber" value={formData.phoneNumber} onChange={handleEditChange} icon={<FiPhone />} />
                                        <InputField label="City" name="city" value={formData.city} onChange={handleEditChange} icon={<FiMapPin />} />
                                    </div>
                                    <div className="space-y-4">
                                        <InputField label="Country" name="country" value={formData.country} onChange={handleEditChange} icon={<FiGlobe />} />
                                        <InputField label="Website (http://...)" name="website" value={formData.socialLinks.website} onChange={handleSocialChange} icon={<FiGlobe />} />
                                        <div className="grid grid-cols-2 gap-4">
                                            <InputField label="Instagram URL" name="instagram" value={formData.socialLinks.instagram} onChange={handleSocialChange} icon={<FiInstagram />} />
                                            <InputField label="Facebook URL" name="facebook" value={formData.socialLinks.facebook} onChange={handleSocialChange} icon={<FiFacebook />} />
                                        </div>
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Bio / Description</label>
                                        <textarea
                                            name="description"
                                            value={formData.description}
                                            onChange={handleEditChange}
                                            className="w-full p-4 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                            rows="3"
                                            placeholder="Tell us about yourself..."
                                        />
                                    </div>
                                </div>
                                <div className="mt-6 pt-6 border-t border-slate-200 flex justify-end">
                                    <button type="submit" disabled={saving} className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-500/30 transition-all flex items-center gap-2">
                                        {saving ? "Saving..." : <><FiSave /> Save Changes</>}
                                    </button>
                                </div>
                            </motion.form>
                        )}
                    </div>
                </motion.div>

                {/* --- REVIEWS SECTION --- */}
                {/* (Kept mostly the same as your logic was fine here) */}
                {reviews.length > 0 && (
                    <div className="mt-12">
                        <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                            Recent Reviews <span className="bg-slate-200 text-slate-600 text-xs px-2 py-1 rounded-full">{reviews.length}</span>
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {reviews.map((review, i) => (
                                <div key={i} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-500 text-xs">
                                                {review.user?.name?.[0] || "U"}
                                            </div>
                                            <span className="font-bold text-sm text-slate-700">{review.user?.name || "User"}</span>
                                        </div>
                                        <div className="flex text-amber-400 text-xs">
                                            {[...Array(5)].map((_, stars) => (
                                                <FiStar key={stars} fill={stars < review.rating ? "currentColor" : "none"} className={stars >= review.rating ? "text-slate-200" : ""} />
                                            ))}
                                        </div>
                                    </div>
                                    <p className="text-slate-600 text-sm">{review.review}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

// Helper Components
const InputField = ({ label, icon, name, value, onChange, type = "text" }) => (
    <div>
        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">{label}</label>
        <div className="relative">
            <span className="absolute left-4 top-3.5 text-slate-400">{icon}</span>
            <input
                type={type}
                name={name}
                value={value}
                onChange={onChange}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-medium"
            />
        </div>
    </div>
);

const SocialIcon = ({ href, icon, color = "text-slate-500" }) => (
    <a href={href} target="_blank" rel="noreferrer" className={`p-2.5 bg-white rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 hover:scale-105 transition-all shadow-sm ${color}`}>
        {icon}
    </a>
);