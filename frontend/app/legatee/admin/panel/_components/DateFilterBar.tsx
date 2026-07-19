"use client";

import filterStyles from "@/app/styles/dashboard styling/filters.module.css";
import sharedStyles from "@/app/styles/dashboard styling/shared.module.css";

// Merge both style objects so existing JSX (styles.xxx) keeps working
const styles = { ...filterStyles, ...sharedStyles };

export interface DateFilter {
  mode: "all" | "today" | "yesterday" | "last3" | "last7" | "date" | "range";
  date: string;
  from: string;
  to: string;
}

export const EMPTY_DATE_FILTER: DateFilter = { mode: "all", date: "", from: "", to: "" };

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

/** Local-time yyyy-mm-dd for a date (or a shifted copy of today). */
function ymd(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return ymd(d);
}

export function matchesDateFilter(iso: string, filter: DateFilter): boolean {
  if (filter.mode === "all") return true;
  const day = ymd(new Date(iso));
  switch (filter.mode) {
    case "today":
      return day === daysAgo(0);
    case "yesterday":
      return day === daysAgo(1);
    case "last3":
      return day >= daysAgo(2);
    case "last7":
      return day >= daysAgo(6);
    case "date":
      return filter.date ? day === filter.date : true;
    case "range": {
      if (filter.from && day < filter.from) return false;
      if (filter.to && day > filter.to) return false;
      return true;
    }
  }
}

const QUICK_CHIPS: { mode: DateFilter["mode"]; label: string }[] = [
  { mode: "all", label: "All time" },
  { mode: "today", label: "Today" },
  { mode: "yesterday", label: "Yesterday" },
  { mode: "last3", label: "Last 3 days" },
  { mode: "last7", label: "Last week" },
];

export default function DateFilterBar({
  value,
  onChange,
}: {
  value: DateFilter;
  onChange: (next: DateFilter) => void;
}) {
  return (
    <div className={styles.filterBar}>
      <span className={styles.filterBarTitle}>Filters</span>
      <div className={styles.filterChips}>
        {QUICK_CHIPS.map((chip) => (
          <button
            key={chip.mode}
            type="button"
            onClick={() => onChange({ ...EMPTY_DATE_FILTER, mode: chip.mode })}
            className={`${styles.chipBtn} ${value.mode === chip.mode ? styles.chipBtnActive : ""}`}
          >
            {chip.label}
          </button>
        ))}
      </div>

      <div className={styles.filterDates}>
        <label className={styles.dateField}>
          On date
          <input
            type="date"
            value={value.date}
            onChange={(e) =>
              onChange({ ...EMPTY_DATE_FILTER, mode: e.target.value ? "date" : "all", date: e.target.value })
            }
            className={styles.input}
          />
        </label>
        <label className={styles.dateField}>
          From
          <input
            type="date"
            value={value.from}
            onChange={(e) => {
              const from = e.target.value;
              const to = value.mode === "range" ? value.to : "";
              onChange({ mode: from || to ? "range" : "all", date: "", from, to });
            }}
            className={styles.input}
          />
        </label>
        <label className={styles.dateField}>
          To
          <input
            type="date"
            value={value.to}
            onChange={(e) => {
              const to = e.target.value;
              const from = value.mode === "range" ? value.from : "";
              onChange({ mode: from || to ? "range" : "all", date: "", from, to });
            }}
            className={styles.input}
          />
        </label>
        {value.mode !== "all" && (
          <button
            type="button"
            onClick={() => onChange(EMPTY_DATE_FILTER)}
            className={styles.btnText}
          >
            Clear filter
          </button>
        )}
      </div>
    </div>
  );
}
