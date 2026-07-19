const mongoose = require("mongoose");

function idTransform(_doc, ret) {
  ret.id = ret._id.toString();
  delete ret._id;
  delete ret.__v;
  return ret;
}

const ingredientSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
  },
  { toJSON: { transform: idTransform } }
);

const variantSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    values: { type: String, required: true, trim: true },
  },
  { toJSON: { transform: idTransform } }
);

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    howToUse: { type: String, trim: true },
    mood: { type: String, trim: true },
    price: { type: Number, required: true, min: 0 },
    /* No default on purpose: products created before stock tracking stay
       undefined (treated as not tracked) until the admin edits them. */
    stock: { type: Number, min: 0 },
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
    collection: { type: mongoose.Schema.Types.ObjectId, ref: "PerfumeCollection" },
    sizes: { type: [String], default: [] },
    variants: { type: [variantSchema], default: [] },
    ingredients: { type: [ingredientSchema], default: [] },
    ingredientsImage: { type: String },
    images: {
      type: [String],
      default: [],
      validate: {
        validator: (value) => value.length <= 7,
        message: "A product can have at most 7 images.",
      },
    },
    showOnHomepage: { type: Boolean, default: false },
    slug: { type: String, trim: true, index: true },
  },
  { timestamps: true, toJSON: { transform: idTransform } }
);

productSchema.index({ category: 1 });
productSchema.index({ showOnHomepage: 1 });

module.exports = mongoose.model("Product", productSchema);
