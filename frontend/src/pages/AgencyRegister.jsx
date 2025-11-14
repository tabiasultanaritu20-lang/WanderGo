import React, { useState, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import Input from "../components/Input";
import countries from "../utils/country";
import quotes from "../utils/quotes";

const AgencyRegister = ({ action = "http://localhost:5000/api/agencies/register", onSuccess }) => {
  const [form, setForm] = useState({
    agencyName: "",
    contactEmail: "",
    password: "",
    phoneNumber: "",
    country: "Bangladesh",
    address: "",
  });

  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const [quoteIndex, setQuoteIndex] = useState(0);
  const navigate = useNavigate();

  // Change quote every 2.5s
  React.useEffect(() => {
    const id = setInterval(() => setQuoteIndex((i) => (i + 1) % quotes.length), 2500);
    return () => clearInterval(id);
  }, []);

  // Validation
  const canSubmit = useMemo(() => {
    if (!form.agencyName.trim()) return false;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(form.contactEmail)) return false;
    if (form.password.length < 6) return false;
    if (!/^\+?[0-9\-()\s]{6,}$/.test(form.phoneNumber)) return false;
    if (!countries.includes(form.country)) return false;
    return true;
  }, [form]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    setLoading(true);
    setServerError("");

    try {
      const res = await fetch(action, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Registration failed. Please try again.");
      }

      onSuccess?.();
      setForm({
        agencyName: "",
        contactEmail: "",
        password: "",
        phoneNumber: "",
        country: "Bangladesh",
        address: "",
      });
      navigate("/dashboard");
    } catch (err) {
      setServerError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen grid grid-cols-1 md:grid-cols-2 bg-slate-50">
      {/* Left panel (image + quotes) */}
      <div className="relative hidden md:flex flex-col justify-between p-8 text-white overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=800&q=80')",
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
            <h1 className="text-3xl lg:text-4xl font-semibold tracking-tight">
              Register Your Agency
            </h1>
            <div className="mt-6 h-24 lg:h-28">
              <p
                key={quoteIndex}
                className="text-lg lg:text-xl leading-relaxed text-white/90 animate-fade"
              >
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
          <div className="block md:hidden text-right mb-2">
            <Link to="/login" className="text-sm text-slate-700 font-medium hover:underline">
              Log In
            </Link>
          </div>

          <header className="mb-6 text-center md:text-left">
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900">
              Agency Registration
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Register your agency to start managing your travel services
            </p>
          </header>

          <form onSubmit={onSubmit} className="space-y-3 sm:space-y-4" noValidate>
            <Input
              label="Agency Name"
              name="agencyName"
              value={form.agencyName}
              onChange={onChange}
              placeholder="Example Travels Ltd."
              required
            />

            <Input
              label="Email"
              name="contactEmail"
              type="email"
              value={form.contactEmail}
              onChange={onChange}
              placeholder="agency@example.com"
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
              label="Phone Number"
              name="phoneNumber"
              type="tel"
              value={form.phoneNumber}
              onChange={onChange}
              placeholder="e.g. +8801XXXXXXXXX"
              required
            />

            {/* Country */}
            <div>
              <label
                htmlFor="country"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
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

            <Input
              label="Address"
              name="address"
              value={form.address}
              onChange={onChange}
              placeholder="House #10, Road #12, Dhaka"
            />

            <button
              type="submit"
              disabled={!canSubmit || loading}
              className={`w-full mt-2 inline-flex items-center justify-center rounded-xl py-2.5 text-sm sm:text-base font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/20 ${
                canSubmit && !loading
                  ? "bg-slate-900 text-white hover:bg-slate-800"
                  : "bg-slate-200 text-slate-500 cursor-not-allowed"
              }`}
            >
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                    />
                  </svg>
                  Registering…
                </span>
              ) : (
                "Register Agency"
              )}
            </button>

            {serverError && (
              <p className="text-xs text-rose-600 text-center mt-2">{serverError}</p>
            )}
          </form>

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

export default AgencyRegister;
