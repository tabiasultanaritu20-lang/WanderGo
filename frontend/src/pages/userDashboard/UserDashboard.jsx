import React, { useState } from "react";
import { Outlet } from "react-router-dom"; // This renders the child page
import { FiMenu } from "react-icons/fi";
import Sidebar from "../../components/layout/Sidebar.jsx"; // Adjust path to your Sidebar file
import Nav from "../../components/Nav"; // Adjust path to your Nav file

export default function UserPanel() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [activeTab, setActiveTab] = useState("dashboard");

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans">

            {/* 1. TOP NAVIGATION (Fixed) */}
            <div className="sticky top-0 z-40 bg-white border-b border-slate-200">
                <Nav />
            </div>

            {/* 2. MAIN LAYOUT CONTAINER */}
            <div className="flex flex-1 relative max-w-[1920px] mx-auto w-full">

                {/* LEFT SIDEBAR (Desktop: ~20% / Mobile: Hidden or Drawer) */}
                {/* The Sidebar component you provided handles its own responsiveness,
                    we just pass the state controls. */}
                <Sidebar
                    isOpen={sidebarOpen}
                    onClose={() => setSidebarOpen(false)}
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                />

                {/* RIGHT CONTENT AREA (Rest of space) */}
                <main className="flex-1 w-full min-w-0 bg-slate-50">

                    {/* Mobile Menu Trigger (Visible only on mobile) */}
                    <div className="md:hidden p-4 pb-0">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-600 shadow-sm active:scale-95 transition-transform"
                        >
                            <FiMenu size={20} />
                            <span className="font-medium text-sm">Menu</span>
                        </button>
                    </div>

                    {/* CONTENT RENDERER */}
                    {/* This is where Profile, Dashboard, etc. will appear */}
                    <div className="p-4 md:p-8 lg:p-10">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
}