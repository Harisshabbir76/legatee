import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { cookies } from "next/headers";
import { CartProvider } from "./components/CartContext";
import { WishlistProvider } from "./components/WishlistContext";
import { UserProvider } from "./components/UserContext";
import { LanguageProvider, type Lang } from "./components/LanguageContext";
import CartSidebar from "./components/CartSidebar";
import WishlistSidebar from "./components/WishlistSidebar";
import Shell from "./components/Shell";
import ScrollToTop from "./components/ScrollToTop";
import HtmlDir from "./components/HtmlDir";
import { fetchFooterContent } from "@/lib/api";

const palash = localFont({
  src: "../fonts/Palash-Regular.otf",
  variable: "--font-heading",
  display: "swap",
});

const chopin = localFont({
  src: [
    { path: "../fonts/chopin-font-family/Chopin-Trial-Thin-BF65b1d6921288d.otf",        weight: "100", style: "normal" },
    { path: "../fonts/chopin-font-family/Chopin-Trial-ThinItalic-BF65b1d6926c1b7.otf",  weight: "100", style: "italic" },
    { path: "../fonts/chopin-font-family/Chopin-Trial-ExtraLight-BF65b1d69203043.otf",   weight: "200", style: "normal" },
    { path: "../fonts/chopin-font-family/Chopin-Trial-ExtraLightItalic-BF65b1d691ecf37.otf", weight: "200", style: "italic" },
    { path: "../fonts/chopin-font-family/Chopin-Trial-Light-BF65b1d69151abf.otf",        weight: "300", style: "normal" },
    { path: "../fonts/chopin-font-family/Chopin-Trial-LightItalic-BF65b1d692b3426.otf",  weight: "300", style: "italic" },
    { path: "../fonts/chopin-font-family/Chopin-Trial-Regular-BF65b1d6917c0ec.otf",      weight: "400", style: "normal" },
    { path: "../fonts/chopin-font-family/Chopin-Trial-RegularItalic-BF65b1d692b0167.otf",weight: "400", style: "italic" },
    { path: "../fonts/chopin-font-family/Chopin-Trial-Medium-BF65b1d69162573.otf",       weight: "500", style: "normal" },
    { path: "../fonts/chopin-font-family/Chopin-Trial-MediumItalic-BF65b1d69242f5d.otf", weight: "500", style: "italic" },
    { path: "../fonts/chopin-font-family/Chopin-Trial-SemiBold-BF65b1d6917f846.otf",     weight: "600", style: "normal" },
    { path: "../fonts/chopin-font-family/Chopin-Trial-SemiBoldItalic-BF65b1d692add77.otf",weight: "600", style: "italic" },
    { path: "../fonts/chopin-font-family/Chopin-Trial-Bold-BF65b1d691a55be.otf",         weight: "700", style: "normal" },
    { path: "../fonts/chopin-font-family/Chopin-Trial-BoldItalic-BF65b1d691bc9ae.otf",   weight: "700", style: "italic" },
    { path: "../fonts/chopin-font-family/Chopin-Trial-ExtraBold-BF65b1d6912ca36.otf",    weight: "800", style: "normal" },
    { path: "../fonts/chopin-font-family/Chopin-Trial-ExtraBoldItalic-BF65b1d69278c77.otf", weight: "800", style: "italic" },
    { path: "../fonts/chopin-font-family/Chopin-Trial-Black-BF65b1d69136d83.otf",        weight: "900", style: "normal" },
    { path: "../fonts/chopin-font-family/Chopin-Trial-BlackItalic-BF65b1d6923aa3d.otf",  weight: "900", style: "italic" },
  ],
  variable: "--font-body",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: "LEGATEE — Rooted in Heritage. Crafted for Today.",
  description:
    "A modern fragrance house inspired by timeless Arabian scent traditions.",
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
    apple: "/favicon.png",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const savedLang = cookieStore.get("legatee_lang")?.value;
  const defaultLang: Lang = savedLang === "ar" ? "ar" : "en";
  const footerContent = await fetchFooterContent();

  return (
    <html lang="en" className={`h-full antialiased ${palash.variable} ${chopin.variable}`}>
      <head>
        <link rel="preconnect" href={process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000"} />
        <link rel="dns-prefetch" href={process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000"} />
        <link rel="preconnect" href="https://res.cloudinary.com" crossOrigin="" />
        <link rel="dns-prefetch" href="https://res.cloudinary.com" />
      </head>
      <body className="min-h-full flex flex-col bg-white text-ink font-body" suppressHydrationWarning>
        <LanguageProvider defaultLang={defaultLang}>
          <HtmlDir />
          <UserProvider>
            <CartProvider>
              <WishlistProvider>
                <ScrollToTop />
                <Shell footerContent={footerContent}>{children}</Shell>
                <CartSidebar />
                <WishlistSidebar />
              </WishlistProvider>
            </CartProvider>
          </UserProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
