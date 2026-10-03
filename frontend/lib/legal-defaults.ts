import type { ContentBlock, LegalSection } from "./api";

const mk = (text: string, tag = "p"): ContentBlock => ({ text, tag, style: {} });

export const LEGAL_DEFAULT_INTRO = mk(
  "By accessing or purchasing from the LEGATEE website, you agree to the following terms, which are governed by the applicable laws of the United Arab Emirates."
);

export const LEGAL_DEFAULT_SECTIONS: LegalSection[] = [
  ["Website & Intellectual Property", "All content on this website, including the LEGATEE name, logo, images, product photography, designs, and written content, belongs to LEGATEE and may not be copied or used without prior written permission."],
  ["Products & Orders", "We aim to ensure that all product descriptions, images, prices, and availability are accurate. Prices are displayed in AED and may be updated when necessary. An order is confirmed once payment has been successfully received."],
  ["Delivery", "Customers are responsible for providing accurate delivery details. Delivery times may vary depending on location and circumstances beyond our control."],
  ["Returns & Exchanges", "Due to the nature of fragrance products, opened or used products may not be eligible for return or exchange. Any request will be handled according to LEGATEE’s Return & Exchange Policy and applicable UAE consumer-protection laws."],
  ["Privacy", "Customer information is collected and used only where necessary to process orders, arrange delivery, provide customer support, and operate our services, in accordance with applicable UAE privacy laws."],
  ["Governing Law", "These terms are governed by the laws of the United Arab Emirates. Any disputes shall be subject to the jurisdiction of the competent UAE courts."],
].map(([title, text]) => ({ title: mk(title, "h2"), lines: [mk(text)] }));

export const LEGAL_DEFAULT_OUTRO = mk(
  "For any questions, please contact LEGATEE through the contact details provided on our website."
);
