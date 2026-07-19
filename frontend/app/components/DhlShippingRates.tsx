"use client";

import { useState } from "react";
import { useLanguage } from "./LanguageContext";
import { getT } from "@/lib/translations";

interface DhlRate {
  productCode: string;
  productName: string;
  totalPrice: number;
  currency: string;
  deliveryTime: string | null;
}

interface DhlShippingRatesProps {
  city: string;
  weight?: number;
  onRateSelect?: (rate: DhlRate) => void;
}

export default function DhlShippingRates({ city, weight = 0.5, onRateSelect }: DhlShippingRatesProps) {
  const [rates, setRates] = useState<DhlRate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const { lang } = useLanguage();
  const t = getT(lang);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  async function fetchRates() {
    if (!city) return;
    setLoading(true);
    setError(null);
    const controller = new AbortController();
    try {
      const res = await fetch(`${API_URL}/api/dhl/rates`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ toCity: city, weight }),
        signal: controller.signal,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch DHL rates.");
      setRates(data.rates || []);
    } catch (err: any) {
      if (err.name !== "AbortError") setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function selectRate(rate: DhlRate) {
    setSelected(rate.productCode);
    onRateSelect?.(rate);
  }

  return (
    <div className="mt-2">
      {rates.length === 0 && !loading && (
        <button
          type="button"
          onClick={fetchRates}
          disabled={!city}
          className="text-xs text-maroon underline hover:opacity-80 transition disabled:opacity-40 cursor-pointer"
        >
          {city ? t.dhl.checkRates : t.dhl.enterCity}
        </button>
      )}

      {loading && (
        <p className="text-xs text-muted mt-1 animate-pulse">{t.dhl.fetchingRates}</p>
      )}

      {error && (
        <p className="text-xs text-red-500 mt-1">{error}</p>
      )}

      {rates.length > 0 && (
        <div className="mt-3 flex flex-col gap-2">
          <p className="text-xs font-semibold text-ink uppercase tracking-wider">{t.dhl.shippingOptions}</p>
          {rates.map((rate) => (
            <label
              key={rate.productCode}
              className={`flex items-center justify-between border rounded-sm px-3.5 py-3 cursor-pointer transition ${
                selected === rate.productCode
                  ? "border-maroon bg-cream-light/30"
                  : "border-line hover:border-maroon/50"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <input
                  type="radio"
                  name="dhl-rate"
                  value={rate.productCode}
                  checked={selected === rate.productCode}
                  onChange={() => selectRate(rate)}
                  className="accent-maroon"
                />
                <div>
                  <p className="text-xs font-semibold text-ink">{rate.productName}</p>
                  {rate.deliveryTime && (
                    <p className="text-3xs text-muted mt-0.5">
                      {t.dhl.estDelivery} {new Date(rate.deliveryTime).toLocaleDateString("en-AE", { weekday: "short", month: "short", day: "numeric" })}
                    </p>
                  )}
                </div>
              </div>
              <p className="text-xs font-bold text-ink">
                {rate.totalPrice.toLocaleString("en-US", { minimumFractionDigits: 2 })} {rate.currency}
              </p>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
