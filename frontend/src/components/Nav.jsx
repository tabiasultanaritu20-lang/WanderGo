import React, { useEffect, useState } from "react";
import { ShoppingCart, MapPin, Star, Compass, Bookmark, LayoutDashboard } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import useUser from "../../hooks/userInfo"; // Import your hook

function Nav({ cartCount }) {
  const location = useLocation();
  const userData = useUser(); // Get real user data
  const [cart, setCart] = useState(0);

  // Safe defaults
  const userRole = userData?.role || "user";
  const userName = userData?.userName || "User";
  const userImg = userData?.profilePictureUrl;

  // Helper for initials
  const getInitials = (name) => {
    return name ? name.charAt(0).toUpperCase() : "U";
  };

  // Helper to check active state
  const isActive = (path) => location.pathname === path;

  useEffect(() => {
    const update = () => {
      const c = Number(localStorage.getItem('cartCount') || 0);
      setCart(c);
    };
    update();
    window.addEventListener('storage', update);
    window.addEventListener('cart:update', update);
    return () => {
      window.removeEventListener('storage', update);
      window.removeEventListener('cart:update', update);
    };
  }, []);

  return (
      <nav className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
        <div className="flex items-center justify-between px-4 sm:px-6 py-4">

          {/* Logo */}
          <Link to="/dashboard" className="flex items-center gap-2">
            <MapPin className="w-6 h-6 sm:w-8 sm:h-8 text-indigo-600" />
            <span className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            WanderGo
          </span>
          </Link>

          {/* Center Nav Links */}
          <div className="hidden lg:flex items-center gap-6">
            <Link
                to="/dashboard"
                className={`text-sm font-semibold transition ${isActive('/dashboard') ? 'text-indigo-600' : 'text-slate-600 hover:text-slate-900'}`}
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

            {/* Role Based Link: Only show Agency link if user is 'agency' or 'admin' */}
            {(userRole === 'agency' || userRole === 'admin') && (
                <Link
                    to="/create-tour"
                    className="text-sm font-medium text-slate-600 hover:text-slate-900 transition"
                >
                  Agency
                </Link>
            )}

            <Link
                to="/EmergencyHub"
                className="text-sm font-medium text-slate-600 hover:text-slate-900 transition"
            >
              Emergency Hub
            </Link>

            <Link
                to="/spots"
                className="text-sm font-medium text-slate-600 hover:text-slate-900 transition"
            >
              Spot Directory
            </Link>

            <Link
                to="/visa-docs"
                className="text-sm font-medium text-slate-600 hover:text-slate-900 transition"
            >
              Visa & Docs
            </Link>

            <Link
                to="/blog"
                className="text-sm font-medium text-slate-600 hover:text-slate-900 transition"
            >
              Blog
            </Link>

            <Link
                to="/saved-blogs"
                className="text-sm font-medium text-slate-600 hover:text-slate-900 transition flex items-center gap-1"
            >
              <Bookmark className="w-4 h-4" />
              Saved
            </Link>

            {/* User Panel Link (Explicit) */}
            <Link
                to="/Profile"
                className="text-sm font-medium text-slate-600 hover:text-slate-900 transition flex items-center gap-1"
            >
              <LayoutDashboard className="w-4 h-4" />
              Profile
            </Link>
          </div>

          {/* Cart & Profile */}
          <div className="flex items-center gap-4">
            <Link to="/cart" className="relative p-2 rounded-full hover:bg-slate-100 transition" title="View Cart">
              <ShoppingCart className="w-6 h-6 text-slate-700" />
              {(cartCount ?? cart) > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center ring-2 ring-white animate-pulse">
                  {cartCount ?? cart}
                </span>
              )}
            </Link>

            {/* Dynamic Profile Circle */}
            <Link to="/profile">
              <div className="w-9 h-9 rounded-full bg-indigo-100 border border-indigo-200 flex items-center justify-center overflow-hidden hover:ring-2 hover:ring-indigo-400 transition cursor-pointer">
                {userImg ? (
                    <img src={userImg} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                    <span className="font-bold text-indigo-700 text-sm">
                    {getInitials(userName)}
                  </span>
                )}
              </div>
            </Link>
          </div>
        </div>
      </nav>
  );
}

export default Nav;
