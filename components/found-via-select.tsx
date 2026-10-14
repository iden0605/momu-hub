"use client";

import { EVENT_DISCOVERY_SOURCES, type EventDiscoverySource } from "@/lib/types";
import { EVENT_DISCOVERY_SOURCE_LABELS } from "@/lib/format";
import { CustomSelect } from "@/components/custom-select";

const inputClass =
  "rounded-md border border-line bg-bg px-3 py-2 text-sm font-normal placeholder:text-ink-soft/60";

// Asked once per check-in (not once per person, on the roster): the same
// returning attendee can hear about different events through different
// channels, so this is never pre-filled or remembered from a prior visit.
export function FoundViaSelect({
  value,
  onChange,
  otherDetails,
  onOtherDetailsChange,
  disabled = false,
}: {
  value: EventDiscoverySource | "";
  onChange: (value: EventDiscoverySource) => void;
  otherDetails: string;
  onOtherDetailsChange: (value: string) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1 text-sm font-medium">
      Where did you find this event?
      <CustomSelect
        value={value}
        onChange={(v) => onChange(v as EventDiscoverySource)}
        options={EVENT_DISCOVERY_SOURCES.map((s) => ({ value: s, label: EVENT_DISCOVERY_SOURCE_LABELS[s] }))}
        placeholder="Select one"
        disabled={disabled}
        triggerClassName="rounded-md border border-line bg-bg px-3.5 py-2.5 font-normal"
      />
      {value === "other" && (
        <input
          value={otherDetails}
          onChange={(e) => onOtherDetailsChange(e.target.value)}
          placeholder="Please specify"
          disabled={disabled}
          className={`${inputClass} mt-1 disabled:cursor-not-allowed disabled:opacity-50`}
        />
      )}
    </div>
  );
}
