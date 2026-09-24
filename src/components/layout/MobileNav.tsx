"use client";

import { useState } from "react";
import Link from "next/link";
import { navItems } from "@/components/layout/nav-items";
import { CloseIcon, MenuIcon } from "@/components/icons/ui";

export function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-label="Toggle navigation menu"
        className="inline-flex items-center justify-center rounded-md p-2 text-white"
      >
        {open ? <CloseIcon /> : <MenuIcon />}
      </button>

      {open && (
        <div className="absolute inset-x-0 top-full z-50 border-t border-brand-700 bg-brand-900 px-4 py-4">
          <nav className="flex flex-col gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-2 text-white hover:bg-brand-800"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </div>
  );
}
