"use client";

import tamaraLogo from "@/app/images/tamara-logo.webp";

interface TamaraWidgetProps {
  price: number;
  currency?: string;
  type?: "installment-plan" | "card-installment";
}

export default function TamaraPromoWidget({
  price,
  currency = "AED",
}: TamaraWidgetProps) {
  const installment = (price / 3).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return (
    <div className="flex flex-wrap items-center justify-between bg-white border border-[#E8D5C4] rounded-md px-4 py-3 gap-3">
      <div className="flex flex-col gap-0.5 min-w-0 flex-1">
        <p className="text-xs text-[#1A1A1A] font-medium leading-snug">
          3 interest-free payments of{" "}
          <span className="font-bold">{installment} {currency}</span>
        </p>
        <p className="text-[10px] text-gray-400">Shop now, pay later. 0% interest.</p>
      </div>
      <div className="flex flex-col items-end gap-1 shrink-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={tamaraLogo.src} alt="Tamara" style={{ height: 22, width: "auto", maxWidth: 100 }} />
        <button type="button" className="text-[10px] text-[#C4784A] underline hover:opacity-70 transition">
          Learn more
        </button>
      </div>
    </div>
  );
}
