const Coupon = require("../models/Coupon");
const { findValidCoupon } = require("../utils/pricing");

// Admin-only — list every coupon, newest first.
exports.list = async (req, res, next) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.json({ coupons });
  } catch (err) {
    next(err);
  }
};

// Parses "YYYY-MM-DD" or "YYYY-MM-DDTHH:mm" as UAE time (UTC+4). A date without
// a time falls back to `defaultTime`. Returns null when the value is invalid.
function parseUaeDateTime(raw, defaultTime) {
  const match = /^(\d{4}-\d{2}-\d{2})(?:T(\d{2}:\d{2}))?$/.exec(String(raw ?? "").trim());
  if (!match) return null;
  const date = new Date(`${match[1]}T${match[2] || defaultTime}:00+04:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

// Admin-only — create a coupon. `startsAt` and `expiresAt` are UAE-time
// "YYYY-MM-DDTHH:mm" values; the coupon is valid between them.
exports.create = async (req, res, next) => {
  try {
    const code = String(req.body?.code ?? "").trim().toUpperCase();
    const discountPercent = Number(req.body?.discountPercent);

    if (!/^[A-Z0-9_-]{2,32}$/.test(code)) {
      return res.status(400).json({ message: "Code must be 2–32 letters, numbers, dashes or underscores." });
    }
    if (!Number.isFinite(discountPercent) || discountPercent < 1 || discountPercent > 100) {
      return res.status(400).json({ message: "Discount percentage must be between 1 and 100." });
    }
    const startsAt = parseUaeDateTime(req.body?.startsAt, "00:00");
    if (!startsAt) {
      return res.status(400).json({ message: "A valid start date and time is required." });
    }
    const expiresAt = parseUaeDateTime(req.body?.expiresAt, "23:59");
    if (!expiresAt) {
      return res.status(400).json({ message: "A valid end date and time is required." });
    }
    if (expiresAt < new Date()) {
      return res.status(400).json({ message: "End date and time cannot be in the past." });
    }
    if (expiresAt <= startsAt) {
      return res.status(400).json({ message: "End date and time must be after the start." });
    }

    const exists = await Coupon.findOne({ code }).select("_id").lean();
    if (exists) {
      return res.status(409).json({ message: "A coupon with this code already exists." });
    }

    const coupon = await Coupon.create({ code, discountPercent, startsAt, expiresAt });
    res.status(201).json({ coupon });
  } catch (err) {
    next(err);
  }
};

// Admin-only
exports.remove = async (req, res, next) => {
  try {
    await Coupon.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    if (err.name === "CastError") {
      return res.status(404).json({ message: "Coupon not found." });
    }
    next(err);
  }
};

// Public — checkout checks a code before applying it to the summary.
exports.validate = async (req, res, next) => {
  try {
    const coupon = await findValidCoupon(req.body?.code);
    if (!coupon) {
      return res.status(404).json({ message: "This coupon is invalid or has expired." });
    }
    res.json({ code: coupon.code, discountPercent: coupon.discountPercent });
  } catch (err) {
    next(err);
  }
};
