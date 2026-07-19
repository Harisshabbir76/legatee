"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import StoreProductCard from "../StoreProductCard";
import type { Product, Collection } from "@/lib/api";
import styles from "../../styles/ShopProducts.module.css";
import { useLanguage } from "../LanguageContext";
import { getT } from "@/lib/translations";

function SortIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M7 5v14m0 0-3-3m3 3 3-3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M14 8h6M14 12h4M14 16h2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

function FilterIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 6h16l-6 7v5l-4 2v-7L4 6Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
    </svg>
  );
}

function GridIcon({ cols }: { cols: 3 | 4 }) {
  const rows = 2;
  const gap = 2;
  const cellW = (24 - gap * (cols + 1)) / cols;
  const cellH = (24 - gap * (rows + 1)) / rows;
  const cells = Array.from({ length: cols * rows });
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      {cells.map((_, i) => {
        const col = i % cols;
        const row = Math.floor(i / cols);
        return <rect key={i} x={gap + col * (cellW + gap)} y={gap + row * (cellH + gap)} width={cellW} height={cellH} rx="1" />;
      })}
    </svg>
  );
}

function ListIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M18 6 6 18M6 6l12 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

type ViewMode = "grid-5" | "grid-3" | "list";
type SortMode = "newest" | "price-asc" | "price-desc" | "name-asc" | "name-desc";
type Availability = "all" | "in-stock" | "out-of-stock";

export default function ShopProducts({
  products,
  collections = [],
  showCategoryFilter: _showCategoryFilter,
  collectionSlug,
}: {
  products: Product[];
  collections?: Collection[];
  showCategoryFilter?: boolean;
  collectionSlug?: string;
}) {
  const { lang } = useLanguage();
  const t = getT(lang);

  const SORT_LABELS: Record<SortMode, string> = {
    newest: t.shop.sortNewest,
    "price-asc": t.shop.sortPriceLow,
    "price-desc": t.shop.sortPriceHigh,
    "name-asc": t.shop.sortNameAZ,
    "name-desc": t.shop.sortNameZA,
  };

  const [view, setView] = useState<ViewMode>("grid-5");
  const [filterOpen, setFilterOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const [sort, setSort] = useState<SortMode>("newest");

  const [selectedCollections, setSelectedCollections] = useState<string[]>([]);
  const [availability, setAvailability] = useState<Availability>("all");

  const prices = products.map((p) => p.price);
  const sliderMin = 0;
  const sliderMax = prices.length ? Math.max(...prices) : 1000;
  const [priceRange, setPriceRange] = useState<[number, number]>([sliderMin, sliderMax]);

  useEffect(() => {
    setPriceRange([sliderMin, sliderMax]);
  }, [sliderMax]);

  const activeFilterCount =
    selectedCollections.length +
    (availability !== "all" ? 1 : 0) +
    (priceRange[0] > sliderMin || priceRange[1] < sliderMax ? 1 : 0);

  const displayed = useMemo(() => {
    let list = [...products];

    if (selectedCollections.length > 0) {
      list = list.filter((p) =>
        p.collection && selectedCollections.includes(p.collection.id)
      );
    }

    if (availability === "in-stock") {
      list = list.filter((p) => (p.stock ?? 0) > 0);
    } else if (availability === "out-of-stock") {
      list = list.filter((p) => (p.stock ?? 0) === 0);
    }

    list = list.filter((p) => p.price >= priceRange[0] && p.price <= priceRange[1]);


    switch (sort) {
      case "price-asc":  list.sort((a, b) => a.price - b.price); break;
      case "price-desc": list.sort((a, b) => b.price - a.price); break;
      case "name-asc":   list.sort((a, b) => a.name.localeCompare(b.name)); break;
      case "name-desc":  list.sort((a, b) => b.name.localeCompare(a.name)); break;
      default:           list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return list;
  }, [products, selectedCollections, availability, priceRange, sort]);

  function clearFilters() {
    setSelectedCollections([]);
    setAvailability("all");
    setPriceRange([sliderMin, sliderMax]);
  }

  function toggleCollection(id: string) {
    setSelectedCollections((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  }

  const sortRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) {
        setSortOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const gridClassName = [
    styles.grid,
    view === "grid-3" ? styles.gridThree : "",
    view === "list" ? styles.gridList : "",
  ].filter(Boolean).join(" ");

  return (
    <section className={styles.section}>
      <div className={styles.content}>

        {/* Toolbar */}
        <div className={styles.toolbar}>
          <div className={styles.toolGroup}>
            <div className={styles.sortWrap} ref={sortRef}>
              <button
                aria-label="Sort"
                aria-expanded={sortOpen}
                className={`${styles.toolButton} ${sortOpen ? styles.toolButtonActive : ""}`}
                onClick={() => { setSortOpen((o) => !o); setFilterOpen(false); }}
              >
                <SortIcon />
              </button>
              {sortOpen && (
                <div className={styles.sortDropdown}>
                  <p className={styles.dropdownLabel}>{t.shop.sortBy}</p>
                  {(Object.keys(SORT_LABELS) as SortMode[]).map((key) => (
                    <button
                      key={key}
                      className={`${styles.sortOption} ${sort === key ? styles.sortOptionActive : ""}`}
                      onClick={() => { setSort(key); setSortOpen(false); }}
                    >
                      {SORT_LABELS[key]}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              aria-label="Filter"
              aria-expanded={filterOpen}
              className={`${styles.toolButton} ${filterOpen ? styles.toolButtonActive : ""}`}
              onClick={() => { setFilterOpen((o) => !o); setSortOpen(false); }}
            >
              <FilterIcon />
              {activeFilterCount > 0 && (
                <span className={styles.filterBadge}>{activeFilterCount}</span>
              )}
            </button>
          </div>

          <div className={styles.viewGroup}>
            <button aria-label="Five column grid" aria-pressed={view === "grid-5"} className={`${styles.viewButton} ${view === "grid-5" ? styles.viewButtonActive : ""}`} onClick={() => setView("grid-5")}>
              <GridIcon cols={4} />
            </button>
            <button aria-label="Three column grid" aria-pressed={view === "grid-3"} className={`${styles.viewButton} ${view === "grid-3" ? styles.viewButtonActive : ""}`} onClick={() => setView("grid-3")}>
              <GridIcon cols={3} />
            </button>
            <button aria-label="List view" aria-pressed={view === "list"} className={`${styles.viewButton} ${view === "list" ? styles.viewButtonActive : ""}`} onClick={() => setView("list")}>
              <ListIcon />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className={styles.body}>

          {/* Filter panel */}
          {filterOpen && (
            <aside className={styles.filterPanel}>
              <div className={styles.filterHeader}>
                <div className={styles.filterHeaderActions}>
                  {activeFilterCount > 0 && (
                    <button className={styles.clearAll} onClick={clearFilters}>{t.shop.filterClearAll}</button>
                  )}
                  <button className={styles.closeFilter} aria-label="Close filters" onClick={() => setFilterOpen(false)}>
                    <CloseIcon />
                  </button>
                </div>
              </div>

              {/* Category / Collections */}
              {collections.length > 0 && (
                <div className={styles.filterSection}>
                  <p className={styles.filterSectionTitle}>{t.shop.filterCategory}</p>
                  {collections.map((col) => (
                    <label key={col.id} className={styles.filterCheckLabel}>
                      <input
                        type="checkbox"
                        checked={selectedCollections.includes(col.id)}
                        onChange={() => toggleCollection(col.id)}
                        className={styles.filterCheck}
                      />
                      {col.name}
                    </label>
                  ))}
                </div>
              )}

              {/* Availability */}
              <div className={styles.filterSection}>
                <p className={styles.filterSectionTitle}>{t.shop.filterAvailability}</p>
                {(["all", "in-stock", "out-of-stock"] as Availability[]).map((val) => (
                  <label key={val} className={styles.filterCheckLabel}>
                    <input
                      type="radio"
                      name="availability"
                      value={val}
                      checked={availability === val}
                      onChange={() => setAvailability(val)}
                      className={styles.filterCheck}
                    />
                    {val === "all" ? t.shop.filterAll : val === "in-stock" ? t.shop.filterInStock : t.shop.filterOutOfStock}
                  </label>
                ))}
              </div>

              {/* Price range */}
              <div className={styles.filterSection}>
                <p className={styles.filterSectionTitle}>{t.shop.filterPrice}</p>
                <div className={styles.rangeWrap}>
                  <div className={styles.rangeTrack} />
                  <input
                    type="range"
                    min={sliderMin}
                    max={sliderMax}
                    value={priceRange[0]}
                    onChange={(e) => {
                      const v = Number(e.target.value);
                      if (v <= priceRange[1]) setPriceRange([v, priceRange[1]]);
                    }}
                    className={styles.rangeInput}
                  />
                  <input
                    type="range"
                    min={sliderMin}
                    max={sliderMax}
                    value={priceRange[1]}
                    onChange={(e) => {
                      const v = Number(e.target.value);
                      if (v >= priceRange[0]) setPriceRange([priceRange[0], v]);
                    }}
                    className={styles.rangeInput}
                  />
                </div>
                <p className={styles.rangeLabel}>
                  Price: Dhs. {priceRange[0].toFixed(2)} AED — Dhs. {priceRange[1].toFixed(2)} AED
                </p>
              </div>
            </aside>
          )}

          {/* Product grid */}
          <div className={styles.gridWrap} style={{ width: "100%" }}>
            {displayed.length === 0 ? (
              <p className={styles.empty}>{t.shop.noProducts}</p>
            ) : (
              <div className={gridClassName}>
                {displayed.map((product) => (
                  <StoreProductCard
                    key={product.id}
                    product={product}
                    layout={view === "list" ? "list" : "grid"}
                    collectionSlug={collectionSlug}
                  />
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </section>
  );
}
