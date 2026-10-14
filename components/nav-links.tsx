"use client";

import { useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export const NAV_LINKS: { href: string; label: string; managersOnly?: boolean }[] = [
  { href: "/", label: "Home" },
  { href: "/events", label: "Events" },
  { href: "/attendance", label: "People" },
  { href: "/help", label: "Help" },
  { href: "/access", label: "Access", managersOnly: true },
];

export function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

/* Active href that switches on tap, before the next page finishes loading. */
function useOptimisticActive(links: { href: string }[]) {
  const pathname = usePathname();
  const [pending, setPendingState] = useState<{ href: string; from: string } | null>(null);

  // Only honoured until the pathname changes
  const optimistic = pending && pending.from === pathname ? pending.href : null;
  const activeHref = optimistic ?? links.find((l) => isActive(pathname, l.href))?.href ?? null;
  const setPending = (href: string) => setPendingState({ href, from: pathname });
  return { activeHref, setPending };
}

/* Pill links for the desktop top bar, the highlight slides between them. */
export function NavLinks({ canManage }: { canManage: boolean }) {
  const links = NAV_LINKS.filter((l) => !l.managersOnly || canManage);
  const { activeHref, setPending } = useOptimisticActive(links);
  const refs = useRef<Record<string, HTMLAnchorElement | null>>({});
  const pillRef = useRef<HTMLSpanElement>(null);
  const placed = useRef(false);

  // Move the pill under the active link, no slide on first paint
  useLayoutEffect(() => {
    const pill = pillRef.current;
    const el = activeHref ? refs.current[activeHref] : null;
    if (!pill) return;
    if (!el) {
      pill.style.opacity = "0";
      return;
    }
    pill.style.transitionProperty = placed.current ? "left, width, opacity" : "none";
    pill.style.left = `${el.offsetLeft}px`;
    pill.style.width = `${el.offsetWidth}px`;
    pill.style.opacity = "1";
    placed.current = true;
  }, [activeHref]);

  return (
    <div className="relative flex items-center gap-1">
      <span
        ref={pillRef}
        aria-hidden
        className="absolute inset-y-0 rounded-full bg-accent-soft opacity-0 duration-300 ease-[cubic-bezier(0.34,1.3,0.64,1)]"
      />
      {links.map((link) => {
        const active = link.href === activeHref;
        return (
          <Link
            key={link.href}
            href={link.href}
            prefetch
            ref={(el) => {
              refs.current[link.href] = el;
            }}
            onClick={() => setPending(link.href)}
            aria-current={active ? "page" : undefined}
            className={`relative rounded-full px-3.5 py-1.5 text-sm font-semibold ${
              active ? "text-accent" : "text-ink-soft hover:text-ink"
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </div>
  );
}
