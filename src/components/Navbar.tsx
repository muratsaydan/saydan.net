"use client";

import Link from "next/link";
import { useState } from "react";

const navLinks = [
  { href: "/", label: "Ana Sayfa" },
  { href: "/about", label: "Hakkımda" },
  { href: "/expertise/yazilim-proje-yonetimi", label: "Uzmanlık", children: [
    { href: "/expertise/yazilim-proje-yonetimi", label: "Yazılım Proje Yönetimi" },
    { href: "/expertise/saas", label: "SaaS" },
    { href: "/expertise/lojistik-teknolojileri", label: "Lojistik Teknolojileri" },
  ]},
  { href: "/blog", label: "Blog" },
  { href: "/links", label: "İletişim" },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [expertiseOpen, setExpertiseOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-white/80 backdrop-blur-md dark:border-border-dark dark:bg-surface-dark/80">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-xl font-bold tracking-tight text-primary">
          saydan<span className="text-accent">.net</span>
        </Link>

        {/* Desktop */}
        <ul className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) =>
            link.children ? (
              <li key={link.href} className="relative">
                <button
                  className="flex items-center gap-1 text-sm font-medium text-gray-700 transition-colors hover:text-primary dark:text-gray-300 dark:hover:text-primary-light"
                  onClick={() => setExpertiseOpen(!expertiseOpen)}
                  onBlur={() => setTimeout(() => setExpertiseOpen(false), 150)}
                >
                  {link.label}
                  <svg className={`h-3 w-3 transition-transform ${expertiseOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                </button>
                {expertiseOpen && (
                  <div className="absolute left-0 top-full mt-2 w-64 rounded-xl border border-border bg-white p-2 shadow-xl dark:border-border-dark dark:bg-card-dark">
                    {link.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        className="block rounded-lg px-4 py-2.5 text-sm text-gray-700 transition-colors hover:bg-primary/5 hover:text-primary dark:text-gray-300 dark:hover:text-primary-light"
                        onClick={() => setExpertiseOpen(false)}
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </li>
            ) : (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-sm font-medium text-gray-700 transition-colors hover:text-primary dark:text-gray-300 dark:hover:text-primary-light"
                >
                  {link.label}
                </Link>
              </li>
            )
          )}
          <li>
            <Link
              href="/private"
              className="flex items-center gap-1.5 text-sm font-medium text-primary transition-colors hover:text-primary-dark dark:text-primary-light dark:hover:text-primary"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
              </svg>
              Özel Alan
            </Link>
          </li>
        </ul>

        {/* Mobile toggle */}
        <button
          className="flex h-10 w-10 items-center justify-center rounded-lg text-gray-700 transition-colors hover:bg-gray-100 md:hidden dark:text-gray-300 dark:hover:bg-gray-800"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Menüyü aç/kapat"
        >
          {mobileOpen ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-border bg-white px-6 py-4 md:hidden dark:border-border-dark dark:bg-surface-dark">
          <ul className="flex flex-col gap-1">
            {navLinks.map((link) =>
              link.children ? (
                <li key={link.href} className="flex flex-col">
                  <span className="px-2 py-2 text-xs font-semibold uppercase tracking-widest text-muted">
                    {link.label}
                  </span>
                  {link.children.map((child) => (
                    <Link
                      key={child.href}
                      href={child.href}
                      className="block rounded-lg px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-primary/5 hover:text-primary dark:text-gray-300"
                      onClick={() => setMobileOpen(false)}
                    >
                      {child.label}
                    </Link>
                  ))}
                </li>
              ) : (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="block rounded-lg px-2 py-2 text-sm font-medium text-gray-700 transition-colors hover:text-primary dark:text-gray-300"
                    onClick={() => setMobileOpen(false)}
                  >
                    {link.label}
                  </Link>
                </li>
              )
            )}
          </ul>
          <div className="mt-3 border-t border-border pt-3 dark:border-border-dark">
            <Link
              href="/private"
              className="flex items-center gap-2 rounded-lg px-2 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/5 dark:text-primary-light"
              onClick={() => setMobileOpen(false)}
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
              </svg>
              Özel Alan
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
