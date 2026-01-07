import React from "react";
import { ShoppingCart, MapPin, Star, Compass, Bookmark } from "lucide-react"; // Added Bookmark icon
import { Link } from "react-router-dom";

function Nav({ cartCount }) {
  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-lg">
      <div className="flex items-center justify-between px-4 sm:px-6 py-4">
        
        {/* Logo */}
        <div className="flex items-center gap-2">
          <MapPin className="w-6 h-6 sm:w-8 sm:h-8 text-indigo-600" />
          <span className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            WanderGo
          </span>
        </div>

        {/* Center Nav Links */}
        <div className="hidden lg:flex items-center gap-6">
          <Link
            to="/dashboard"
            className="text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition"
          >
            Home
          </Link>

          <Link
            to="/wheel"
            className="text-sm font-medium text-slate-600 hover:text-slate-900 transition flex items-center gap-1"
          >
            <Compass className="w-4 h-4" />
            Destination Wheel
          </Link>

          <Link
            to="/reviews"
            className="text-sm font-medium text-slate-600 hover:text-slate-900 transition flex items-center gap-1"
          >
            <Star className="w-4 h-4" />
            Reviews
          </Link>

          <Link
            to="/create-tour"
            className="text-sm font-medium text-slate-600 hover:text-slate-900 transition"
          >
            Agency
          </Link>

          <Link
            to="/EmergencyHub"
            className="text-sm font-medium text-slate-600 hover:text-slate-900 transition"
          >
            Emergency Hub
          </Link>

          <Link
            to="/blog"
            className="text-sm font-medium text-slate-600 hover:text-slate-900 transition"
          >
            Blog
          </Link>

          {/* ADDED: Saved Blogs Link */}
          <Link
            to="/saved-blogs"
            className="text-sm font-medium text-slate-600 hover:text-slate-900 transition flex items-center gap-1"
          >
            <Bookmark className="w-4 h-4" />
            Saved
          </Link>

          <Link
            to="/profile"
            className="text-sm font-medium text-slate-600 hover:text-slate-900 transition"
          >
            Profile
          </Link>
        </div>

        {/* Cart & Profile */}
        <div className="flex items-center gap-4">
          <button
            className="relative p-2 rounded-full hover:bg-slate-100 transition"
            title="View Cart"
          >
            <ShoppingCart className="w-6 h-6 text-slate-700" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center ring-2 ring-white animate-pulse">
                {cartCount}
              </span>
            )}
          </button>

          <div className="w-8 h-8 rounded-full bg-indigo-200 flex items-center justify-center font-bold text-indigo-700 text-sm ring-2 ring-indigo-400 cursor-pointer hidden sm:flex">
            JD
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Nav;
