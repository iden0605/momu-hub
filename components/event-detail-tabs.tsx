"use client";

import { useState, type ReactNode } from "react";

type Tab = "attendance" | "stats";

/* Segmented switch between the check-in list and stats. */
export function EventDetailTabs({
  defaultTab = "attendance",
  attendanceLabel,
  attendance,
  stats,
}: {
  defaultTab?: Tab;
  attendanceLabel: string;
  attendance: ReactNode;
  stats: ReactNode;
}) {
  const [tab, setTab] = useState<Tab>(defaultTab);

  const tabs: { key: Tab; label: string }[] = [
    { key: "attendance", label: attendanceLabel },
    { key: "stats", label: "Stats" },
  ];

  return (
    <>
      <div className="mt-6 inline-flex rounded-full bg-surface-2 p-1 text-sm font-semibold">
        {tabs.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={`rounded-full px-4 py-1.5 ${
              tab === t.key ? "bg-surface text-ink shadow-soft" : "text-ink-soft hover:text-ink"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      {tab === "attendance" && attendance}
      {tab === "stats" && stats}
    </>
  );
}
