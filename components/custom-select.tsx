"use client";

import { useEffect, useRef, useState } from "react";

/* Themed listbox in place of a native select, controlled or uncontrolled.
 * A hidden input carries the value so it posts with the form.
 */
export function CustomSelect({
  name,
  options,
  defaultValue,
  value: controlledValue,
  onChange,
  required = false,
  disabled = false,
  placeholder = "Select…",
  ariaLabel,
  className = "",
  triggerClassName = "rounded-md border border-line bg-surface px-3 py-2 font-normal",
}: {
  name?: string;
  options: { value: string; label: string }[];
  defaultValue?: string;
  value?: string;
  onChange?: (value: string) => void;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  ariaLabel?: string;
  className?: string;
  triggerClassName?: string;
}) {
  const [innerValue, setInnerValue] = useState(defaultValue ?? options[0]?.value ?? "");
  const value = controlledValue ?? innerValue;
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);

  const selected = options.find((o) => o.value === value);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: PointerEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  function openList() {
    setActiveIndex(Math.max(0, options.findIndex((o) => o.value === value)));
    setOpen(true);
  }

  function selectOption(optionValue: string) {
    setInnerValue(optionValue);
    onChange?.(optionValue);
    setOpen(false);
  }

  function onTriggerKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      openList();
    }
  }

  function onListKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(options.length - 1, i + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(0, i - 1));
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      selectOption(options[activeIndex].value);
    }
  }

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      {name && <input type="hidden" name={name} value={value} required={required} />}
      <button
        type="button"
        disabled={disabled}
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => (open ? setOpen(false) : openList())}
        onKeyDown={onTriggerKeyDown}
        className={`flex w-full items-center justify-between gap-2 text-left text-sm text-ink disabled:cursor-not-allowed disabled:opacity-50 ${triggerClassName}`}
      >
        <span className="truncate"><span className={selected ? "" : "text-ink-soft/60"}>{selected?.label ?? placeholder}</span></span>
        <svg
          viewBox="0 0 20 20"
          fill="none"
          aria-hidden
          className={`h-4 w-4 flex-none text-ink-soft transition-transform ${open ? "rotate-180" : ""}`}
        >
          <path
            d="M5 7.5 10 12.5 15 7.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {open && (
        <ul
          role="listbox"
          tabIndex={-1}
          onKeyDown={onListKeyDown}
          ref={(el) => el?.focus()}
          className="thin-scrollbar animate-rise absolute z-50 mt-1.5 max-h-60 min-w-full overflow-y-auto rounded-lg border border-line bg-surface p-1 shadow-soft outline-none"
        >
          {options.map((option, i) => (
            <li
              key={option.value}
              role="option"
              aria-selected={option.value === value}
              onMouseEnter={() => setActiveIndex(i)}
              onMouseDown={(e) => {
                // mousedown (not click) + preventDefault: fires before any
                // focus/blur side effects, so selecting an option can't race
                // with the outside-click-close listener and leave the panel
                // open.
                e.preventDefault();
                e.stopPropagation();
                selectOption(option.value);
              }}
              className={`flex cursor-pointer items-center gap-2 rounded-md px-2.5 py-2 text-sm ${
                i === activeIndex ? "bg-surface-2" : ""
              } ${option.value === value ? "font-semibold text-accent" : "text-ink"}`}
            >
              <span className="w-4 flex-none">
                {option.value === value && "✓"}
              </span>
              <span className="truncate">{option.label}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
