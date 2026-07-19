export function productSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function productPath(
  product: {
    name: string;
    slug?: string;
    category?: { name: string } | null;
    collection?: { name: string } | null;
  },
  collectionSlugOverride?: string
): string {
  const groupSlug =
    collectionSlugOverride ??
    (product.collection?.name
      ? productSlug(product.collection.name)
      : product.category?.name
      ? productSlug(product.category.name)
      : "perfumes");
  const slug = product.slug ?? productSlug(product.name);
  return `/${groupSlug}/${slug}`;
}
