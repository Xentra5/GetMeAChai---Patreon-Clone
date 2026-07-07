"use client";

import React, { useState } from 'react';
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";

const NavBar = () => {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [showDropdown, setShowDropdown] = useState(false);

  // Hide the Navbar on student-only pages like the welcome screen
  if (pathname?.startsWith("/student")) return null;

  return (
    <nav className="bg-black/50 backdrop-blur-md border-b border-white/10 text-white sticky top-0 z-50 select-none">
      <div className="flex justify-between items-center px-6 h-16 max-w-7xl mx-auto">
        
        {/* Brand Logo */}
        <Link 
          href="/" 
          className="text-2xl font-extrabold text-white hover:opacity-90 transition-opacity cursor-pointer flex items-center gap-2"
        >
          ☕ GetMeAChai
        </Link>
        
        {/* Nav Links */}
        <ul className="hidden md:flex items-center gap-8 text-sm text-gray-300 font-medium">
          <li>
            <Link href="/" className="hover:text-purple-400 transition-colors cursor-pointer">
              Home
            </Link>
          </li>
          <li>
            <Link href="#" className="hover:text-purple-400 transition-colors cursor-pointer">
              About
            </Link>
          </li>
          <li>
            <Link href="#" className="hover:text-purple-400 transition-colors cursor-pointer">
              Contact
            </Link>
          </li>
        </ul>

        {/* User Actions */}
        <div className="flex items-center gap-3">
          {session ? (
            <div className="relative">
              {/* Profile Trigger Button */}
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-800 bg-[#121316] hover:bg-[#1c1e24] transition-all text-sm font-medium text-gray-300 cursor-pointer select-none"
              >
                <div className="w-5 h-5 rounded-full bg-slate-700 flex items-center justify-center text-white text-xs font-bold font-mono">
                  {session.user.email?.charAt(0).toUpperCase() || "U"}
                </div>
                <span className="max-w-[120px] truncate">{session.user.name || session.user.email}</span>
                <svg className={`w-4 h-4 transition-transform duration-200 ${showDropdown ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown Menu */}
              {showDropdown && (
                <>
                  {/* Click-out Backdrop */}
                  <div 
                    className="fixed inset-0 z-10" 
                    onClick={() => setShowDropdown(false)}
                  />
                  <div className="absolute right-0 mt-2 w-48 rounded-xl border border-slate-800 bg-[#121316] p-1.5 backdrop-blur-md shadow-xl z-20 anim-fade-up">
                    <div className="px-3 py-2 text-xs text-gray-500 border-b border-white/5 mb-1 truncate">
                      {session.user.email}
                    </div>
                    
                    <Link
                      href="/select-role"
                      onClick={() => setShowDropdown(false)}
                      className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-300 hover:text-white rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
                    >
                      <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Dashboard
                    </Link>

                    <button
                      onClick={() => {
                        setShowDropdown(false);
                        signOut();
                      }}
                      className="flex items-center gap-2 w-full text-left px-3 py-2 text-sm text-red-400 hover:text-red-300 rounded-lg hover:bg-red-500/10 transition-colors cursor-pointer"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Sign Out
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <>
              {/* Authenticated Links (Sign Up / Login) */}
              <Link
                href="/signup"
                className="px-4 py-2 border border-slate-800 rounded-lg hover:bg-[#1c1e24] transition-all duration-200 cursor-pointer text-sm font-semibold text-gray-300"
              >
                Sign Up
              </Link>

              <Link
                href="/login"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer text-sm font-semibold shadow-lg shadow-blue-500/10"
              >
                Login
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
