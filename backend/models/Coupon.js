const mongoose = require("mongoose");

function idTransform(_doc, ret) {
  ret.id = ret._id.toString();
  delete ret._id;
  delete ret.__v;
  return ret;
}

const couponSchema = new mongoose.Schema(
  {
    // Stored upper-cased so customers can type the code in any case.
    code: { type: String, required: true, trim: true, uppercase: true, unique: true },
    discountPercent: { type: Number, required: true, min: 1, max: 100 },
    // First moment the coupon can be used (admin-chosen date + time, UAE time).
    // Optional so coupons created before start dates existed stay usable.
    startsAt: { type: Date },
    // Last moment the coupon can be used (admin-chosen date + time, UAE time).
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true, toJSON: { transform: idTransform } }
);

module.exports = mongoose.model("Coupon", couponSchema);
