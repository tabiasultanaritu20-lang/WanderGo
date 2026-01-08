import React from "react";
import { Link, useLocation } from "react-router-dom";

const items = [
  { key: "home", label: "Home", to: "/dashboard" },
  { key: "wheel", label: "Destination Wheel", to: "/wheel" },
  { key: "agency", label: "Agency", to: "/create-tour" },
  { key: "emergency", label: "Emergency Hub", to: "/EmergencyHub" },
  { key: "spots", label: "Spot Directory", to: "/spots" },
  { key: "visa", label: "Visa & Docs", to: "/visa-docs" },
  { key: "blog", label: "Blog", to: "/blog" },
  { key: "saved", label: "Saved Blogs", to: "/saved-blogs" },
  { key: "profile", label: "Profile", to: "/profile" }
]

export default function NavTabs() {
  const { pathname } = useLocation();

  return (
    <nav className="sticky top-0 z-30 bg-white/80 backdrop-blur border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/dashboard" className="flex items-center gap-2 text-slate-900 font-semibold">
          <span className="inline-flex items-center justify-center h-7 w-7 rounded-full bg-slate-900 text-white">📍</span>
          <span>WanderGo</span>
        </Link>
        <div className="flex items-center gap-6">
          {items.map((item) => {
            const active = item.to && pathname === item.to
            if (item.disabled) {
              return (
                <span key={item.key} aria-disabled className="text-sm text-slate-500">
                  {item.label}
                </span>
              )
            }
            return (
              <Link
                key={item.key}
                to={item.to}
                className={`text-sm ${active ? "text-slate-900 font-semibold" : "text-slate-700 hover:text-slate-900"}`}
              >
                {item.label}
              </Link>
            )
          })}
        </div>
        <Link to="/cart" className="text-xl text-slate-900">🛒</Link>
      </div>
    </nav>
  )
}
