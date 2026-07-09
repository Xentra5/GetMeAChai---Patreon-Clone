"use client";

import React from 'react';
import { usePathname } from "next/navigation";

const Footer = () => {
  const pathname = usePathname();

  // Hide footer on dashboard or student pages
  if (pathname?.startsWith("/student") || pathname?.startsWith("/dashboard")) {
    return null;
  }

  return (
    <footer className="bg-[#0b0c10] border-t border-white/5 text-white flex justify-center items-center px-6 py-6">
      <p className="text-center text-sm text-gray-500">Copyright &copy; 2024 GetMeAChai &mdash; Support creators, build community.</p>
    </footer>
  );
};

export default Footer;
