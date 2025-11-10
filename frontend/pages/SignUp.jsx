import React, { useMemo, useState } from "react";
import Input from "../components/Input.jsx";
import countries from "../utils/country.js";

const SignUp = ({ action = "/api/signup", onSuccess }) => {
    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
        number: "",
        country: "Bangladesh",
    });
    const [loading, setLoading] = useState(false);
    const [serverError, setServerError] = useState("");

    const canSubmit = useMemo(() => {
        if (!form.name.trim()) return false;
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(form.email)) return false;
        if (form.password.length < 6) return false;
        if (!/^\+?[0-9\-()\s]{6,}$/.test(form.number)) return false;
        return countries.includes(form.country);

    }, [form.name, form.email, form.password.length, form.number, form.country]);

    const onChange = (e) => {
        const { name, value } = e.target;
        setForm((f) => ({ ...f, [name]: value }));
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        setServerError("");
        if (!canSubmit) return;

        try {
            setLoading(true);
            const res = await fetch("http://localhost:8080/api/user/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });
            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data?.message || "SignUp failed. Please try again.");
            }
            onSuccess?.();
            setForm({ name: "", email: "", password: "", number: "", country: "Bangladesh" });
        } catch (err) {
            setServerError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-white to-slate-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="bg-white/80 backdrop-blur border border-slate-200 shadow-sm rounded-2xl p-6 md:p-8">
                    <header className="mb-6 text-center">
                        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Create your account</h1>
                        <p className="text-sm text-slate-500 mt-1">Sign up to continue</p>
                    </header>

                    <form onSubmit={onSubmit} className="space-y-3" noValidate>
                        <Input
                            label="Full name"
                            name="name"
                            value={form.name}
                            onChange={onChange}
                            placeholder="John Doe"
                            autoComplete="name"
                            required
                        />

                        <Input
                            label="Email"
                            name="email"
                            type="email"
                            value={form.email}
                            onChange={onChange}
                            placeholder="you@example.com"
                            autoComplete="email"
                            required
                        />

                        <Input
                            label="Password"
                            name="password"
                            type="password"
                            value={form.password}
                            onChange={onChange}
                            placeholder="••••••••"
                            autoComplete="new-password"
                            required
                        />

                        <Input
                            label="Phone number"
                            name="number"
                            type="tel"
                            value={form.number}
                            onChange={onChange}
                            placeholder="e.g. +8801XXXXXXXXX"
                            autoComplete="tel"
                            required
                        />

                        <div>
                            <label htmlFor="country" className="block text-sm font-medium text-slate-700 mb-1">Country</label>
                            <select
                                id="country"
                                name="country"
                                value={form.country}
                                onChange={onChange}
                                required
                                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-300"
                            >
                                {countries.map((c) => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </select>
                        </div>

                        <button
                            type="submit"
                            disabled={!canSubmit || loading}
                            className={`w-full mt-2 inline-flex items-center justify-center rounded-xl py-2.5 text-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/20 ${
                                canSubmit && !loading ? "bg-slate-900 text-white hover:bg-slate-800" : "bg-slate-200 text-slate-500 cursor-not-allowed"
                            }`}
                        >
                            {loading ? (
                                <span className="inline-flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                  </svg>
                  Creating account…
                </span>
                            ) : (
                                "Create account"
                            )}
                        </button>

                        {serverError && <p className="text-xs text-rose-600 text-center">{serverError}</p>}
                    </form>

                    <p className="mt-6 text-center text-xs text-slate-500">
                        By continuing you agree to our <a href="#" className="underline underline-offset-4">Terms</a> & <a href="#" className="underline underline-offset-4">Privacy Policy</a>.
                    </p>
                </div>
                <p className="mt-4 text-center text-xs text-slate-400">© {new Date().getFullYear()} Your Store</p>
            </div>
        </div>
    );
};

export default SignUp;
