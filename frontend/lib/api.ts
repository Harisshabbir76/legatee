import { cookies } from "next/headers";
import { API_URL } from "@/lib/api-client";
import { productSlug } from "@/lib/product-slug";

export interface Ingredient {
  id: string;
  name: string;
  description: string;
}

export interface VariantOption {
  id: string;
  name: string;
  values: string;
}

export interface Category {
  id: string;
  name: string;
  image?: string;
}

export interface Collection {
  id: string;
  name: string;
  description?: string;
  image?: string;
  order?: number;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  howToUse?: string;
  mood?: string;
  price: number;
  /** Products created before stock tracking have no stock value (not tracked). */
  stock?: number;
  category?: Category | null;
  collection?: Collection | null;
  sizes: string[];
  variants: VariantOption[];
  ingredients: Ingredient[];
  ingredientsImage?: string;
  images: string[];
  showOnHomepage?: boolean;
  slug?: string;
  createdAt: string;
}

export interface OrderItem {
  id: string;
  product: string;
  name: string;
  size?: string;
  variants: { name: string; value: string }[];
  price: number;
  quantity: number;
}

export type OrderStatus = "pending" | "confirmed" | "out for delivery" | "delivered" | "cancelled";

export interface Order {
  id: string;
  items: OrderItem[];
  customer: {
    name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
  };
  total: number;
  tax?: number;
  shipping?: number;
  payment?: {
    method?: string;
    status?: string;
  };
  status: OrderStatus;
  createdAt: string;
}

export interface Insights {
  totalProducts: number;
  totalOrders: number;
  monthlyIncome: number;
}

export async function checkAuth(): Promise<boolean> {
  try {
    const store = await cookies();
    const token = store.get("legatee_admin_token")?.value;
    if (!token) return false;
    const res = await fetch(`${API_URL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function fetchProducts(): Promise<Product[]> {
  try {
    const res = await fetch(`${API_URL}/api/products`, {
      next: { revalidate: 30 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.products as Product[];
  } catch {
    return [];
  }
}

export async function fetchHomepageProducts(): Promise<Product[]> {
  try {
    const res = await fetch(`${API_URL}/api/products/homepage`, {
      next: { revalidate: 30 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.products as Product[];
  } catch {
    return [];
  }
}

export async function fetchProduct(id: string): Promise<Product | null> {
  try {
    const res = await fetch(`${API_URL}/api/products/${id}`, {
      next: { revalidate: 30 },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.product as Product;
  } catch {
    return null;
  }
}

export async function fetchProductBySlug(slug: string): Promise<Product | null> {
  // Try the indexed slug endpoint first (O(1) DB lookup)
  try {
    const res = await fetch(`${API_URL}/api/products/slug/${encodeURIComponent(slug)}`, {
      cache: "no-store",
    });
    if (res.ok) {
      const data = await res.json();
      return data.product as Product;
    }
  } catch {
    // fall through
  }

  // Fallback: scan the list for older products that predate the slug field,
  // then fetch the full product by ID so we get all images and fields.
  const products = await fetchProducts();
  const match = products.find((item) => productSlug(item.name) === slug);
  if (match) {
    const full = await fetchProduct(match.id);
    if (full) return full;
    return match;
  }

  // Last resort: treat the slug as a MongoDB ID
  return fetchProduct(slug);
}

export async function fetchCategories(): Promise<Category[]> {
  try {
    const res = await fetch(`${API_URL}/api/categories`, { next: { revalidate: 120 } });
    if (!res.ok) return [];
    const data = await res.json();
    return data.categories as Category[];
  } catch {
    return [];
  }
}

export async function fetchCollections(): Promise<Collection[]> {
  try {
    const res = await fetch(`${API_URL}/api/collections`, { next: { revalidate: 60 } });
    if (!res.ok) return [];
    const data = await res.json();
    return data.collections as Collection[];
  } catch {
    return [];
  }
}

async function adminBearerHeader(): Promise<Record<string, string>> {
  const store = await cookies();
  const token = store.get("legatee_admin_token")?.value;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function fetchOrders(): Promise<Order[]> {
  try {
    const res = await fetch(`${API_URL}/api/orders`, {
      headers: await adminBearerHeader(),
      cache: "no-store",
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.orders as Order[];
  } catch {
    return [];
  }
}

export interface ContentBlock {
  text: string;
  textAr?: string;
  tag?: string;
  style?: Record<string, string>;
  styleAr?: Record<string, string>;
}


export interface ArrowConfig {
  image?: string;
  width?: number;
  labelMaxWidth?: number;
  marginTop?: number;
  marginRight?: number;
  marginBottom?: number;
  marginLeft?: number;
  paddingTop?: number;
  paddingRight?: number;
  paddingBottom?: number;
  paddingLeft?: number;
}

export interface WhyItem {
  title: ContentBlock;
  line1: ContentBlock;
  line2: ContentBlock;
  image?: string; // custom uploaded image URL (overrides default choose1–4)
}

export interface HomepageData {
  hero: {
    title: ContentBlock; eyebrow: ContentBlock; copy: ContentBlock;
    buttonText: ContentBlock; buttonLink: string;
    backgroundImage?: string; // custom uploaded hero background URL
    treeImage?: string;       // custom uploaded palm tree image URL
  };
  heritage: {
    heading: ContentBlock; intro: ContentBlock; copy: ContentBlock; tagline: ContentBlock;
    image?: string; // custom uploaded heritage image URL
  };
  collection: { title: ContentBlock; copy: ContentBlock; monogramImage?: string };
  brandQuote: { heading: ContentBlock; copy: ContentBlock; birdsImage?: string; monogramImage?: string };
  lovedProducts: { title: ContentBlock; copy: ContentBlock; buttonText: ContentBlock; buttonLink: string };
  whyChoose: { sectionTitle: ContentBlock; buttonText: ContentBlock; buttonLink: string; items: WhyItem[]; arrows?: { topLeft?: ArrowConfig; topRight?: ArrowConfig; bottomLeft?: ArrowConfig; bottomRight?: ArrowConfig; bottom?: ArrowConfig } };
}

export interface ShopHeroData {
  title: ContentBlock;
  copy: ContentBlock;
  backgroundImage?: string;
}

export interface ShopFaqItem {
  q: ContentBlock;
  a: ContentBlock;
}

export interface ShopPageData {
  shop:        { hero: ShopHeroData };
  perfumes:    { hero: ShopHeroData };
  bodyHairMist:{ hero: ShopHeroData };
  signature:   { hero: ShopHeroData };
  kandora:     { hero: ShopHeroData };
  allOverSpray:{ hero: ShopHeroData };
  faq: {
    title: ContentBlock;
    copy:  ContentBlock;
    items: ShopFaqItem[];
  };
}

export interface AboutPageData {
  hero: {
    title: ContentBlock;
    backgroundImage?: string;
    insetImage?: string;
  };
  story: {
    heading: ContentBlock;
    intro: ContentBlock;
    storyImage?: string;
    treeImage1?: string;
    treeImage2?: string;
    treeImage3?: string;
    copy: ContentBlock;
    philosophy: ContentBlock;
    philosophyStrong: ContentBlock;
    tagline: ContentBlock;
  };
  marquee?: {
    words?: string;
  };
}

export interface FaqPageData {
  heroTitle: ContentBlock;
  heroSubtitle: ContentBlock;
  heroImage?: string;
  items: { q: ContentBlock; a: ContentBlock }[];
  helpIcon?: string;
  helpTitle: ContentBlock;
  helpCopy: ContentBlock;
  helpButtonText: ContentBlock;
  helpButtonLink?: string;
}

export interface LegalSection {
  title: ContentBlock;
  lines: ContentBlock[];
}

export interface LegalTab {
  label: ContentBlock;
  intro: ContentBlock;
  sections: LegalSection[];
}

export interface LegalPageData {
  heroTitle: ContentBlock;
  heroImage?: string;
  tabs: LegalTab[];
}

export interface ContactPageData {
  heroTitle:           ContentBlock;
  heroImage?:          string;
  formTitle:           ContentBlock;
  formCopy:            ContentBlock;
  submitButtonText:    ContentBlock;
  instagramTitle:      ContentBlock;
  instagramCopy:       ContentBlock;
  instagramHandle:     ContentBlock;
  instagramHandleLink?: string;
  igImage1?: string;
  igImage2?: string;
  igImage3?: string;
  igImage4?: string;
  igImage5?: string;
  igImage6?: string;
  igImage7?: string;
}

export async function fetchContactPageContent(): Promise<ContactPageData | null> {
  try {
    const res = await fetch(`${API_URL}/api/contactpage`, { cache: "no-store" });
    if (!res.ok) return null;
    return (await res.json()).content as ContactPageData;
  } catch {
    return null;
  }
}

export async function fetchLegalPageContent(): Promise<LegalPageData | null> {
  try {
    const res = await fetch(`${API_URL}/api/legalpage`, { cache: "no-store" });
    if (!res.ok) return null;
    return (await res.json()).content as LegalPageData;
  } catch {
    return null;
  }
}

export async function fetchFaqPageContent(): Promise<FaqPageData | null> {
  try {
    const res = await fetch(`${API_URL}/api/faqpage`, { cache: "no-store" });
    if (!res.ok) return null;
    return (await res.json()).content as FaqPageData;
  } catch {
    return null;
  }
}

export async function fetchAboutPageContent(): Promise<AboutPageData | null> {
  try {
    const res = await fetch(`${API_URL}/api/aboutpage`, { cache: "no-store" });
    if (!res.ok) return null;
    return (await res.json()).content as AboutPageData;
  } catch {
    return null;
  }
}

export async function fetchShopPageContent(): Promise<ShopPageData | null> {
  try {
    const res = await fetch(`${API_URL}/api/shoppage`, { cache: "no-store" });
    if (!res.ok) return null;
    const data = await res.json();
    return data.content as ShopPageData;
  } catch {
    return null;
  }
}

export interface FooterData {
  quote:          ContentBlock;
  signatureTitle: ContentBlock;
  signatureCopy:  ContentBlock;
  buttonText:     ContentBlock;
  buttonLink:     string;
  footerImage?:   string;
}

export async function fetchFooterContent(): Promise<FooterData | null> {
  try {
    const res = await fetch(`${API_URL}/api/footer`, { cache: "no-store" });
    if (!res.ok) return null;
    return (await res.json()).content as FooterData;
  } catch {
    return null;
  }
}

export async function fetchHomepageContent(): Promise<HomepageData | null> {
  try {
    const res = await fetch(`${API_URL}/api/homepage`, { cache: "no-store" });
    if (!res.ok) return null;
    const data = await res.json();
    return data.content as HomepageData;
  } catch {
    return null;
  }
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  emailMarketing: boolean;
  createdAt: string;
}

export interface UserOrder {
  id: string;
  _id?: string;
  items: OrderItem[];
  customer: {
    name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
  };
  total: number;
  status: OrderStatus;
  createdAt: string;
}

export interface EmailMarketingData {
  subscribers: { id: string; name: string; email: string; createdAt: string; source: "opted_in" }[];
  guestEmails:  { name: string; email: string; createdAt: string; source: "guest_order" }[];
  total: number;
}

export async function fetchEmailMarketing(): Promise<EmailMarketingData> {
  const empty: EmailMarketingData = { subscribers: [], guestEmails: [], total: 0 };
  try {
    const res = await fetch(`${API_URL}/api/admin/email-marketing`, {
      headers: await adminBearerHeader(),
      cache: "no-store",
    });
    if (!res.ok) return empty;
    return (await res.json()) as EmailMarketingData;
  } catch {
    return empty;
  }
}

export async function fetchShippingPrice(): Promise<number> {
  try {
    const res = await fetch(`${API_URL}/api/shipping`, { next: { revalidate: 60 } });
    if (!res.ok) return 0;
    const data = await res.json();
    return Number(data.price) || 0;
  } catch {
    return 0;
  }
}

export async function fetchInsights(): Promise<Insights> {
  const fallback: Insights = { totalProducts: 0, totalOrders: 0, monthlyIncome: 0 };
  try {
    const res = await fetch(`${API_URL}/api/insights`, {
      headers: await adminBearerHeader(),
      cache: "no-store",
    });
    if (!res.ok) return fallback;
    return (await res.json()) as Insights;
  } catch {
    return fallback;
  }
}
