"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Portal } from "@/components/portal";
import { NAV_LINKS, isActive } from "@/components/nav-links";

export interface MenuUser {
  displayName: string;
  email: string;
  avatarUrl: string | null;
  roleLabel: string | null;
}

/* Hamburger for phones, opens a full screen menu that slides in from the left. */
export function MobileMenu({ user, canManage }: { user: MenuUser; canManage: boolean }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const links = NAV_LINKS.filter((l) => !l.managersOnly || canManage);

  // Lock page scroll, close on Escape or when widening past phone size
  useEffect(() => {
    if (!open) return;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const wide = window.matchMedia("(min-width: 640px)");
    const onWide = () => wide.matches && setOpen(false);
    document.addEventListener("keydown", onKey);
    wide.addEventListener("change", onWide);
    return () => {
      document.body.style.overflow = overflow;
      document.removeEventListener("keydown", onKey);
      wide.removeEventListener("change", onWide);
    };
  }, [open]);

  const close = () => setOpen(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        aria-controls="mobile-menu"
        className="relative z-[60] -mr-1 flex h-10 w-10 flex-col items-center justify-center gap-[5px] rounded-full hover:bg-surface-2 sm:hidden"
      >
        <span
          className={`block h-[2.2px] w-6 rounded-full bg-ink transition-transform duration-300 ${
            open ? "translate-y-[7.2px] -rotate-45" : ""
          }`}
        />
        <span className={`block h-[2.2px] w-6 rounded-full bg-ink transition-opacity duration-200 ${open ? "opacity-0" : ""}`} />
        <span
          className={`block h-[2.2px] w-6 rounded-full bg-ink transition-transform duration-300 ${
            open ? "-translate-y-[7.2px] rotate-45" : ""
          }`}
        />
      </button>

      <Portal>
        <div
          id="mobile-menu"
          aria-hidden={!open}
          inert={!open}
          className={`fixed inset-0 z-40 flex flex-col bg-bg/[0.98] pt-[57px] transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] sm:hidden ${
            open ? "translate-x-0 shadow-soft" : "-translate-x-full"
          }`}
        >
          <div className="momu-stripe h-1 w-full" aria-hidden />

          <nav className="flex flex-1 flex-col items-center justify-center gap-2">
            {links.map((link, i) => {
              const active = isActive(pathname, link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={close}
                  aria-current={active ? "page" : undefined}
                  style={{ transitionDelay: open ? `${80 + i * 45}ms` : "0ms" }}
                  className={`relative px-8 py-3 font-display text-2xl transition-[opacity,transform,color] duration-300 ${
                    open ? "translate-x-0 opacity-100" : "-translate-x-6 opacity-0"
                  } ${active ? "font-bold text-ink" : "font-medium text-ink-soft hover:text-accent"}`}
                >
                  {link.label}
                  {active && (
                    <span aria-hidden className="absolute inset-x-8 bottom-1.5 h-[3px] rounded-full bg-accent" />
                  )}
                </Link>
              );
            })}
          </nav>

          <div
            className={`mx-4 mb-4 rounded-xl border border-line bg-surface p-4 shadow-soft transition-[opacity,transform] duration-300 ${
              open ? "translate-y-0 opacity-100 delay-200" : "translate-y-3 opacity-0"
            }`}
            style={{ marginBottom: "max(1rem, env(safe-area-inset-bottom))" }}
          >
            <div className="flex items-center gap-3">
              {user.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={user.avatarUrl} alt="" referrerPolicy="no-referrer" className="h-11 w-11 flex-none rounded-full" />
              ) : (
                <span className="flex h-11 w-11 flex-none items-center justify-center rounded-full bg-marigold-soft font-bold text-warn">
                  {(user.displayName || user.email).charAt(0).toUpperCase()}
                </span>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">{user.displayName}</p>
                <p className="truncate text-sm text-ink-soft">{user.email}</p>
              </div>
              {user.roleLabel && (
                <span className="flex-none rounded-full bg-slate-soft px-2.5 py-0.5 text-xs font-semibold text-nav">
                  {user.roleLabel}
                </span>
              )}
            </div>
            <form action="/auth/signout" method="post" className="mt-3">
              <button
                type="submit"
                className="w-full rounded-full border border-line py-2.5 text-sm font-semibold text-danger hover:bg-danger-soft"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      </Portal>
    </>
  );
}
