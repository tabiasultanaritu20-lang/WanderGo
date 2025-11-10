import React, {useMemo, useState, useEffect} from "react";
import Input from "../components/Input";
import quotes from "../utils/quotes";
import { useNavigate } from 'react-router-dom';
const navigate = useNavigate();

const Login = ({action = "http://localhost:8080/api/user/login", onSuccess}) => {
    const [form, setForm] = useState({email: "", password: ""});
    const [loading, setLoading] = useState(false);
    const [serverError, setServerError] = useState("");
    const [quoteIndex, setQuoteIndex] = useState(0);

    useEffect(() => {
        const id = setInterval(() => setQuoteIndex((i) => (i + 1) % quotes.length), 1500);
        return () => clearInterval(id);
    }, []);

    const canSubmit = useMemo(() => {
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(form.email)) return false;
        return form.password.length >= 6;

    }, [form.email, form.password.length]);

    const onChange = (e) => {
        const {name, value} = e.target;
        setForm((f) => ({...f, [name]: value}));
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        setServerError("");
        if (!canSubmit) return;

        try {
            setLoading(true);
            const res = await fetch(action, {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(form),
            });
            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data?.message || "Login failed. Please try again.");
            }
            onSuccess?.();
            setForm({email: "", password: ""});
        } catch (err) {
            setServerError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen grid grid-cols-1 md:grid-cols-2 bg-slate-50">
            {/* Left panel */}
            <div
                className="relative hidden md:flex flex-col justify-between p-8 bg-gradient-to-b from-slate-900 to-slate-800 text-white">
                <button
                    onClick={() => (typeof window !== "undefined" ? window.history.back() : null)}
                    className="inline-flex items-center gap-2 text-sm text-white/80 hover:text-white transition"
                    aria-label="Go back"
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                        <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
                    </svg>
                    Back
                </button>

                <div className="mt-10">
                    <h1 className="text-3xl lg:text-4xl font-semibold tracking-tight">Welcome to WenderGo</h1>
                    <div className="mt-6 h-24 lg:h-28">
                        <p key={quoteIndex}
                           className="text-lg lg:text-xl leading-relaxed text-white/90 animate-fade">“{quotes[quoteIndex]}”</p>
                    </div>
                </div>

                <div className="text-xs text-white/60">© {new Date().getFullYear()} WenderGo</div>
            </div>

            {/* Right panel (form) */}
            <div className="flex items-center justify-center p-6 md:p-10">
                <div
                    className="w-full max-w-md bg-white/80 backdrop-blur border border-slate-200 shadow-sm rounded-2xl p-6 md:p-8">
                    <header className="mb-6 text-center md:text-left">
                        <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Log in</h2>
                        <p className="text-sm text-slate-500 mt-1">Welcome back — let’s explore</p>
                    </header>

                    <form onSubmit={onSubmit} className="space-y-3" noValidate>
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
                            autoComplete="current-password"
                            required
                        />

                        <div className="flex items-center justify-between text-xs text-slate-600">
                            <label className="inline-flex items-center gap-2 select-none">
                                <input type="checkbox" className="rounded border-slate-300"/>
                                Remember me
                            </label>
                            <a href="#" className="text-slate-700 hover:underline">Forgot password?</a>
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
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
                  </svg>
                  Signing in
                </span>
                            ) : (
                                "Sign in"
                            )}
                        </button>

                        {serverError && <p className="text-xs text-rose-600 text-center">{serverError}</p>}
                    </form>

                    {/* Mobile welcome + quotes */}
                    <div className="mt-8 md:hidden text-center">
                        <h1 className="text-xl font-semibold text-slate-900">Welcome to WenderGo</h1>
                        <p className="mt-2 text-sm text-slate-600">“{quotes[quoteIndex]}”</p>
                    </div>
                </div>
            </div>

            {/* tiny fade animation (shared) */}
            <style>{`
        .animate-fade { animation: fade 0.4s ease-in; }
        @keyframes fade { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
        </div>
    );
};

export default Login;
