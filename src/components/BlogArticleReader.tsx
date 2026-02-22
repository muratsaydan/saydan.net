"use client";

import { useState } from "react";

interface BlogArticleReaderProps {
  content: string;
}

export default function BlogArticleReader({ content }: BlogArticleReaderProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="mt-6">
      <button
        onClick={() => setOpen(!open)}
        className="inline-flex items-center gap-2 rounded-xl border border-border-dark px-5 py-2.5 text-sm font-medium text-gray-300 transition-all hover:border-primary-light hover:text-primary-light"
      >
        <svg
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
          />
        </svg>
        {open ? "Makaleyi Kapat" : "Makaleyi Oku"}
        <svg
          className={`h-3 w-3 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={3}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19.5 8.25l-7.5 7.5-7.5-7.5"
          />
        </svg>
      </button>

      {open && (
        <div className="mt-4 max-h-[70vh] overflow-y-auto rounded-xl border border-border-dark bg-card-dark/50 p-6">
          <div className="whitespace-pre-wrap text-sm leading-relaxed text-gray-300">
            {content}
          </div>
        </div>
      )}
    </div>
  );
}
