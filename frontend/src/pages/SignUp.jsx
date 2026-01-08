import React, { useMemo, useState, useEffect } from "react";
import toast, { Toaster } from "react-hot-toast"; // New Import
import { baseApi } from "../utils/baseApi.js"; // Use baseApi like Login
import Input from "../components/Input.jsx";
import countries from "../utils/country";
import quotes from "../utils/quotes";
import { Link, useNavigate } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_BASE || "/api";

const Signup = ({ action = `${API_BASE}/user/register`, onSuccess }) => {
    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
        number: "",
        country: "Bangladesh",
        city: "", // Added City
        role: "user",
        
    });

    const [loading, setLoading] = useState(false);
    const [quoteIndex, setQuoteIndex] = useState(0);
    const navigate = useNavigate();

    useEffect(() => {
        const id = setInterval(() => setQuoteIndex((i) => (i + 1) % quotes.length), 2500);
        return () => clearInterval(id);
    }, []);

    const canSubmit = useMemo(() => {
        if (!form.name.trim()) return false;
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(form.email)) return false;
        if (form.password.length < 6) return false;
        if (!/^\+?[0-9\-()\s]{6,}$/.test(form.number)) return false;
        if (!countries.includes(form.country)) return false;
        return true;
    }, [form.name, form.email, form.password.length, form.number, form.country]);

    const onChange = (e) => {
        const { name, value } = e.target;
        setForm((f) => ({ ...f, [name]: value }));
    };

    const onSubmit = async (e) => {
        e.preventDefault();

        if (!canSubmit) {
            toast.error("Please fill in all fields correctly.");
            return;
        }

        try {
            setLoading(true);
            const res = await fetch(action, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                // Include role and adminKey in payload
                body: JSON.stringify({
                    name: form.name,
                    email: form.email,
                    password: form.password,
                    number: form.number,
                    country: form.country,
                    role: form.role,
                    adminKey: form.role === "admin" ? form.adminKey : undefined,
                }),
            });
            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data?.message || "Signup failed. Please try again.");
            }

            const data = await res.json();
            if (data.token) {
                localStorage.setItem("token", data.token);
            }
            if (data.user) {
                localStorage.setItem("user", JSON.stringify(data.user));
            }
            
            onSuccess?.();

            // Clear form
            setForm({
                name: "",
                email: "",
                password: "",
                number: "",
                country: "Bangladesh",
                city: "",
                role: "user",
                adminKey: "",
            });

            // Redirect to dashboard
            setTimeout(() => {
                navigate("/dashboard");
            }, 1000);

        } catch (err) {
            // Handle Axios Error
            const errorMessage = err.response?.data?.message || err.message || "Signup failed.";
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen grid grid-cols-1 md:grid-cols-2 bg-slate-50">
            <Toaster position="top-center" reverseOrder={false} />

            {/* Black overlay for mobile */}
            <div className="absolute inset-0 bg-black/70 md:hidden"></div>

            {/* Top-right Log In for desktop */}
            <div className="hidden md:block absolute right-4 top-4 z-20">
                <Link
                    to="/login"
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white/80 backdrop-blur px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/20"
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2a5 5 0 015 5v2h1a2 2 0 012 2v8a2 2 0 01-2 2H8a2 2 0 01-2-2v-8a2 2 0 012-2h1V7a5 5 0 015-5zm-3 7h6V7a3 3 0 10-6 0v2z" />
                    </svg>
                    Log In
                </Link>
            </div>

            {/* Left panel (image background) */}
            <div className="relative hidden md:flex flex-col justify-between p-8 text-white overflow-hidden">
                <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{
                        backgroundImage:
                            "url('https://images.unsplash.com/photo-1505118380757-91f5f5632de0?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=626')",
                    }}
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/80" />
                <div className="relative z-10 flex flex-col justify-between h-full">
                    <button
                        onClick={() => window.history.back()}
                        className="inline-flex items-center gap-2 text-sm text-white/80 hover:text-white transition"
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
                        </svg>
                        Back
                    </button>
                    <div className="mt-10">
                        <h1 className="text-3xl lg:text-4xl font-semibold tracking-tight">Welcome to WenderGo</h1>
                        <div className="mt-6 h-24 lg:h-28">
                            <p key={quoteIndex} className="text-lg lg:text-xl leading-relaxed text-white/90 animate-fade">
                                “{quotes[quoteIndex]}”
                            </p>
                        </div>
                    </div>
                    <div className="text-xs text-white/60">© {new Date().getFullYear()} WenderGo</div>
                </div>
            </div>

            {/* Right panel (form) */}
            <div className="relative flex items-center justify-center px-4 py-8 sm:px-6 md:p-10 z-10">
                <div className="w-full max-w-sm sm:max-w-md bg-white/90 backdrop-blur-md border border-slate-200 shadow-sm rounded-2xl p-6 sm:p-8">
                    {/* Mobile login link */}
                    <div className="block md:hidden text-right mb-2">
                        <Link to="/login" className="text-sm text-slate-700 font-medium hover:underline">
                            Log In
                        </Link>
                    </div>

                    <header className="mb-6 text-center md:text-left">
                        <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900">Create your account</h2>
                        <p className="text-sm text-slate-500 mt-1">Sign up to continue</p>
                    </header>

                    <form onSubmit={onSubmit} className="space-y-3 sm:space-y-4" noValidate>
                        <Input label="Full name" name="name" value={form.name} onChange={onChange} placeholder="John Doe" required />

                        <Input
                            label="Email"
                            name="email"
                            type="email"
                            value={form.email}
                            onChange={onChange}
                            placeholder="you@example.com"
                            required
                        />

                        <Input
                            label="Password"
                            name="password"
                            type="password"
                            value={form.password}
                            onChange={onChange}
                            placeholder="••••••••"
                            required
                        />

                        <Input
                            label="Phone number"
                            name="number"
                            type="tel"
                            value={form.number}
                            onChange={onChange}
                            placeholder="e.g. +8801XXXXXXXXX"
                            required
                        />

                        {/* Country & City Group */}
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label htmlFor="country" className="block text-sm font-medium text-slate-700 mb-1">
                                    Country
                                </label>
                                <select
                                    id="country"
                                    name="country"
                                    value={form.country}
                                    onChange={onChange}
                                    required
                                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900/10"
                                >
                                    {countries.map((c) => (
                                        <option key={c} value={c}>
                                            {c}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label htmlFor="city" className="block text-sm font-medium text-slate-700 mb-1">
                                    City
                                </label>
                                <input
                                    id="city"
                                    name="city"
                                    value={form.city}
                                    onChange={onChange}
                                    placeholder="e.g. Dhaka"
                                    required
                                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900/10 placeholder:text-slate-400"
                                />
                            </div>
                        </div>

                        {/* Role */}
                        <div>
                            <label htmlFor="role" className="block text-sm font-medium text-slate-700 mb-1">
                                Role
                            </label>
                            <select
                                id="role"
                                name="role"
                                value={form.role}
                                onChange={onChange}
                                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900/10"
                            >
                                <option value="user">User</option>
                                <option value="agency">Agency</option>
                                <option value="admin">Admin</option>
                            </select>
                            <p className="mt-1 text-xs text-slate-500">Select “Admin” only if you have the admin key.</p>
                        </div>

                        {/* Admin key (only when role = admin) */}
                        {form.role === "admin" && (
                            <Input
                                label="Admin key"
                                name="adminKey"
                                type="password"
                                value={form.adminKey}
                                onChange={onChange}
                                placeholder="Enter admin secret"
                            />
                        )}

                        <button
                            type="submit"
                            disabled={!canSubmit || loading}
                            className={`w-full mt-2 inline-flex items-center justify-center rounded-xl py-2.5 text-sm sm:text-base font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/20 ${
                                canSubmit && !loading ? "bg-slate-900 text-white hover:bg-slate-800" : "bg-slate-200 text-slate-500 cursor-not-allowed"
                            }`}
                        >
                            {loading ? (
                                <span className="inline-flex items-center gap-2">
                                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                                    </svg>
                                    Creating account…
                                </span>
                            ) : (
                                "Create account"
                            )}
                        </button>
                    </form>

                    {/* Mobile welcome */}
                    <div className="mt-8 md:hidden text-center text-white">
                        <h1 className="text-xl font-semibold">Welcome to WenderGo</h1>
                        <p className="mt-2 text-sm opacity-90">“{quotes[quoteIndex]}”</p>
                    </div>
                </div>
            </div>

            <style>{`
                .animate-fade { animation: fade 0.4s ease-in; }
                @keyframes fade { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>
        </div>
    );
};

export default Signup;