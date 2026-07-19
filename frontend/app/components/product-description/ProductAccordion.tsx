"use client";

import { useState } from "react";
import styles from "./ProductDescription.module.css";

interface AccordionItem {
  title: string;
  body: string;
}

export default function ProductAccordion({ items }: { items: AccordionItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className={styles.detailsList}>
      {items.map((item, i) => (
        <div className={styles.detailRow} key={item.title}>
          <button
            type="button"
            className={styles.noteRowSummary}
            aria-expanded={openIndex === i}
            onClick={() => setOpenIndex(openIndex === i ? null : i)}
          >
            {item.title}
          </button>
          {openIndex === i && (
            <div className={styles.detailBody}>
              {item.body.split("\n").filter(Boolean).map((line, li) => (
                <p key={li}>{line}</p>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
