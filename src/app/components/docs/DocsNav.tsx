"use client";

import React from "react";

const sections = [
  { id: "srs-summary", label: "SRS Summary" },
  { id: "data-model", label: "Data Model" },
  { id: "wireframes", label: "Wireframes & Mockups" },
  { id: "tech-stack", label: "Tech Stack" },
];

const DocsNav: React.FC = () => {
  const handleClick = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <nav className="border-b border-slate-800 bg-slate-950/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl gap-3 overflow-x-auto px-4 py-3 text-[11px]">
        {sections.map((section) => (
          <button
            key={section.id}
            onClick={() => handleClick(section.id)}
            className="whitespace-nowrap rounded-full border border-slate-700 bg-slate-900/70 px-3 py-1 font-medium text-slate-200 transition hover:border-orange-500 hover:text-orange-300"
          >
            {section.label}
          </button>
        ))}
      </div>
    </nav>
  );
};

export default DocsNav;
