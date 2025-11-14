import React from "react"
import { Link, useLocation } from "react-router-dom"

const items = [
  { key: "1", label: "Authentication", disabled: true },
  { key: "2", label: "Booking Dashboard", disabled: true },
  { key: "3", label: "Group Trip", disabled: true },
  { key: "4", label: "Profile", disabled: true },
  { key: "5", label: "Notifications", disabled: true },
  { key: "6", label: "Split Payments", disabled: true },
  { key: "7", label: "Smart Packages (Backend)", disabled: true },
  { key: "8", label: "Groups Directory", disabled: true },
  { key: "9", label: "Smart Recommendations", disabled: true },
  { key: "10", label: "Guide Finder", disabled: true },
  { key: "11", label: "Blog Feed", disabled: true },
  { key: "12", label: "Likes & Comments", disabled: true },
  { key: "13", label: "CRUD Blogs", disabled: true },
  { key: "14", label: "Ratings & Reviews", disabled: true },
  { key: "15", label: "Guide & Group Profiles", disabled: true },
  { key: "16", label: "Spot Directory", disabled: true },
  { key: "17", label: "Emergency Hub", to: "/emergency" },
  { key: "18", label: "Visa Assistance", disabled: true },
  { key: "19", label: "Travel Concierge", disabled: true },
  { key: "20", label: "Smart Packages (Frontend)", disabled: true }
]

export default function NavTabs() {
  const { pathname } = useLocation()
  return (
    <nav className="sticky top-0 z-30 bg-white/80 backdrop-blur border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-4 py-2 flex gap-2 overflow-x-auto">
        {items.map((item) => {
          const active = item.to && pathname === item.to
          if (item.disabled) {
            return (
              <span key={item.key} aria-disabled className="px-3 py-1.5 text-sm rounded-full border border-slate-200 text-slate-400 cursor-not-allowed">
                {item.label}
              </span>
            )
          }
          return (
            <Link key={item.key} to={item.to} className={`px-3 py-1.5 text-sm rounded-full border ${active ? "bg-slate-900 text-white border-slate-900" : "border-slate-300 text-slate-700 hover:bg-slate-50"}`}>
              {item.label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}