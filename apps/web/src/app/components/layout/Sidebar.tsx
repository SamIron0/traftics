'use client';

import React from "react";
import Link from "next/link";
import { usePathname } from 'next/navigation';

const navItems = [
  { path: "/", label: "Dashboard", icon: "chart-bar" },
  { path: "/sessions", label: "Sessions", icon: "video-camera" },
  { path: "/websites", label: "Websites", icon: "globe" },
  { path: "/settings", label: "Settings", icon: "cog" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 min-h-screen bg-white border-r">
      <nav className="p-4 space-y-2">
        {navItems.map((item) => (
          <Link
            key={item.path}
            href={item.path}
            className={`flex items-center p-3 rounded-lg transition-colors ${
              pathname === item.path
                ? "bg-blue-50 text-blue-600"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
}
