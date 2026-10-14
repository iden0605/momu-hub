"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

// Refreshes server data and the client page cache when shared data changes
export function LiveRefresh() {
  const router = useRouter();
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel("live-refresh")
      .on("postgres_changes", { event: "*", schema: "public", table: "events" }, refresh)
      .on("postgres_changes", { event: "*", schema: "public", table: "attendance_entries" }, refresh)
      .on("postgres_changes", { event: "*", schema: "public", table: "attendance_members" }, refresh)
      .on("postgres_changes", { event: "*", schema: "public", table: "app_users" }, refresh)
      .subscribe();

    // Debounce bursts of changes into one refresh
    function refresh() {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => router.refresh(), 400);
    }

    // Catch up after the tab was in the background
    function onVisible() {
      if (document.visibilityState === "visible") refresh();
    }
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      document.removeEventListener("visibilitychange", onVisible);
      supabase.removeChannel(channel);
    };
  }, [router]);

  return null;
}
