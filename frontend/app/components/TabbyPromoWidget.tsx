"use client";

import TabbyBadgeSvg from "./TabbyBadgeSvg";

interface TabbyPromoWidgetProps {
  price: number;
  currency?: string;
  source?: "product" | "cart";
}

export default function TabbyPromoWidget({ price, currency = "AED" }: TabbyPromoWidgetProps) {
  const installment = (price / 4).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return (
    <div className="flex flex-wrap items-center justify-between bg-white border border-[#6CFF93]/40 rounded-md px-4 py-3 gap-3">
      <div className="flex flex-col gap-0.5 min-w-0 flex-1">
        <p className="text-xs text-[#1A1A1A] font-medium leading-snug">
          4 interest-free payments of{" "}
          <span className="font-bold">{installment} {currency}</span>
        </p>
        <p className="text-[10px] text-gray-400">No interest, no fees. Ever.</p>
      </div>
      <TabbyBadgeSvg height={32} />
    </div>
  );
}
