/**
 * Adds Cloudinary transformations for automatic quality, format, and optional width.
 * f_auto picks AVIF/WebP/JPEG based on browser support.
 * Non-Cloudinary URLs pass through unchanged.
 */
export function optimizeImage(url: string | undefined | null, width?: number): string {
  if (!url) return "";
  if (!url.includes("res.cloudinary.com")) return url;

  const transforms = ["q_auto:good", "f_auto", ...(width ? [`w_${width}`, "c_limit"] : [])].join(",");

  return url.replace("/upload/", `/upload/${transforms}/`);
}
