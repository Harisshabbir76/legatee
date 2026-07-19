"use client";

import { useMemo, useState } from "react";
import type { EmailMarketingData } from "@/lib/api";
import DateFilterBar, {
  EMPTY_DATE_FILTER,
  matchesDateFilter,
  type DateFilter,
} from "./DateFilterBar";
import emailStyles from "@/app/styles/dashboard styling/email-marketing.module.css";
import insightStyles from "@/app/styles/dashboard styling/insights.module.css";
import sharedStyles from "@/app/styles/dashboard styling/shared.module.css";

// Merge all style objects so existing JSX (styles.xxx) keeps working
const styles = { ...emailStyles, ...insightStyles, ...sharedStyles };

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

interface EmailEntry {
  name: string;
  email: string;
  createdAt: string;
}

function EmailList({ title, hint, dateLabel, entries, emptyText }: {
  title: string;
  hint?: string;
  dateLabel: string;
  entries: EmailEntry[];
  emptyText: string;
}) {
  return (
    <div className={styles.emailSection}>
      <div>
        <h2 className={styles.sectionTitle}>{title}</h2>
        {hint && <p className={styles.sectionHint}>{hint}</p>}
      </div>
      {entries.length === 0 ? (
        <p className={styles.empty}>{emptyText}</p>
      ) : (
        <div className={styles.emailListWrap}>
          <div className={styles.emailListHead}>
            <span>Name</span>
            <span>Email</span>
            <span>{dateLabel}</span>
          </div>
          <div className={styles.emailScroll}>
            {entries.map((entry, i) => (
              <div key={`${entry.email}-${i}`} className={styles.emailRow}>
                <span className={styles.emailCellName} title={entry.name}>{entry.name || "—"}</span>
                <span className={styles.emailCellEmail} title={entry.email}>{entry.email}</span>
                <span className={styles.emailCellDate}>{formatDate(entry.createdAt)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function EmailMarketingClient({ data }: { data: EmailMarketingData }) {
  const [dateFilter, setDateFilter] = useState<DateFilter>(EMPTY_DATE_FILTER);

  const subscribers = useMemo(
    () => data.subscribers.filter((s) => matchesDateFilter(s.createdAt, dateFilter)),
    [data.subscribers, dateFilter]
  );
  const guestEmails = useMemo(
    () => data.guestEmails.filter((g) => matchesDateFilter(g.createdAt, dateFilter)),
    [data.guestEmails, dateFilter]
  );

  return (
    <div className={styles.emailPage}>
      <div className={styles.emailStatsGrid}>
        <div className={styles.statCard}>
          <p className={styles.statLabel}>Total Emails</p>
          <p className={styles.statValue}>{data.total}</p>
        </div>
        <div className={styles.statCard}>
          <p className={styles.statLabel}>Opted-In Users</p>
          <p className={styles.statValue}>{data.subscribers.length}</p>
        </div>
        <div className={styles.statCard}>
          <p className={styles.statLabel}>Guest Orders</p>
          <p className={styles.statValue}>{data.guestEmails.length}</p>
        </div>
      </div>

      <DateFilterBar value={dateFilter} onChange={setDateFilter} />

      <EmailList
        title="Opted-In Subscribers"
        dateLabel="Joined"
        entries={subscribers}
        emptyText="No opted-in subscribers match these filters."
      />

      <EmailList
        title="Guest Order Emails"
        hint="Customers who ordered without signing in and are not already opted-in above."
        dateLabel="Last Order"
        entries={guestEmails}
        emptyText="No guest order emails match these filters."
      />
    </div>
  );
}
