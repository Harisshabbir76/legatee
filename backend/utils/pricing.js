const Coupon = require("../models/Coupon");

// Price actually charged for a product: the discounted price when the admin
// set one lower than the original price, otherwise the original price.
function effectivePrice(product) {
  const discounted = product.discountedPrice;
  if (typeof discounted === "number" && discounted >= 0 && discounted < product.price) {
    return discounted;
  }
  return product.price;
}

// Returns the coupon document when `code` matches a coupon that has started
// and not yet expired, else null.
async function findValidCoupon(code) {
  const normalized = String(code ?? "").trim().toUpperCase();
  if (!normalized) return null;
  const now = new Date();
  return Coupon.findOne({
    code: normalized,
    expiresAt: { $gte: now },
    $or: [{ startsAt: { $exists: false } }, { startsAt: null }, { startsAt: { $lte: now } }],
  });
}

// Shared order totals: items + flat shipping + 5% tax, then the coupon
// percentage is taken off the grand total.
function computeTotals(itemsTotal, shipping, coupon) {
  const tax = Math.round((itemsTotal + shipping) * 0.05 * 100) / 100;
  const beforeDiscount = itemsTotal + shipping + tax;
  const discount = coupon
    ? Math.round(beforeDiscount * (coupon.discountPercent / 100) * 100) / 100
    : 0;
  const total = Math.max(0, Math.round((beforeDiscount - discount) * 100) / 100);
  return { tax, discount, total };
}

module.exports = { effectivePrice, findValidCoupon, computeTotals };
