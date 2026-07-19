import tamaraLogo from "@/app/images/tamara-logo.webp";
import TabbyBadgeSvg from "./TabbyBadgeSvg";

export function TabbyBadge() {
  return <TabbyBadgeSvg height={28} />;
}

export function TamaraBadge() {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={tamaraLogo.src}
      alt="Tamara — Pay in 3"
      height={22}
      style={{ height: 22, width: "auto", display: "block" }}
    />
  );
}
