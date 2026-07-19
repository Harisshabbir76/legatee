const mongoose = require("mongoose");

function idTransform(_doc, ret) {
  ret.id = ret._id.toString();
  delete ret._id;
  delete ret.__v;
  return ret;
}

// Singleton document — there is only ever one shipping setting.
const shippingSettingSchema = new mongoose.Schema(
  {
    price: { type: Number, required: true, min: 0, default: 0 },
  },
  { timestamps: true, toJSON: { transform: idTransform } }
);

module.exports = mongoose.model("ShippingSetting", shippingSettingSchema);
