import React from "react";
import { Link, useLocation } from "react-router-dom";

const items = [
  { key: "1", label: "Login", to: "/login" },
  { key: "2", label: "Sign Up", to: "/signup" },
  { key: "3", label: "Dashboard", to: "/dashboard" },
  { key: "4", label: "Create Tour", to: "/create-tour" },
  { key: "5", label: "Blog Feed", to: "/blog-feed" },
  { key: "6", label: "Emergency Hub", to: "/emergency" }
];

export default function NavTabs() {
  const { pathname } = useLocation();

  return (
    <nav className="sticky top-0 z-30 bg-white/80 backdrop-blur border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-4 py-2 flex gap-2 overflow-x-auto">
        {items.map((item) => {
          const active = pathname === item.to;
          return (
            <Link
              key={item.key}
              to={item.to}
              className={`px-3 py-1.5 text-sm rounded-full border 
                ${active 
                  ? "bg-slate-900 text-white border-slate-900" 
                  : "border-slate-300 text-slate-700 hover:bg-slate-50"
                }`}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}