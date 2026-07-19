const mongoose = require("mongoose");

function idTransform(_doc, ret) {
  ret.id = ret._id.toString();
  delete ret._id;
  delete ret.__v;
  return ret;
}

const orderItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
    name: { type: String, required: true, trim: true },
    size: { type: String, trim: true },
    variants: [
      {
        _id: false,
        name: { type: String, trim: true },
        value: { type: String, trim: true },
      },
    ],
    price: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 },
  },
  { toJSON: { transform: idTransform } }
);

const orderSchema = new mongoose.Schema(
  {
    items: { type: [orderItemSchema], required: true, validate: (v) => v.length > 0 },
    customer: {
      name: { type: String, required: true, trim: true },
      email: { type: String, required: true, trim: true },
      phone: { type: String, required: true, trim: true },
      address: { type: String, required: true, trim: true },
      city: { type: String, required: true, trim: true },
    },
    total: { type: Number, required: true, min: 0 },
    tax: { type: Number, min: 0, default: 0 },
    shipping: { type: Number, min: 0, default: 0 },
    payment: {
      method: { type: String, trim: true, default: "" },
      status: { type: String, trim: true, default: "" },
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "out for delivery", "delivered", "cancelled"],
      default: "pending",
    },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true, toJSON: { transform: idTransform } }
);

orderSchema.index({ userId: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Order", orderSchema);
