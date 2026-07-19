const mongoose = require("mongoose");

function idTransform(_doc, ret) {
  ret.id = ret._id.toString();
  delete ret._id;
  delete ret.__v;
  return ret;
}

const collectionSchema = new mongoose.Schema(
  {
    name:        { type: String, required: true, trim: true, unique: true },
    description: { type: String, default: "" },
    image:       { type: String, default: "" },
    order:       { type: Number, default: 0 },
  },
  { timestamps: true, toJSON: { transform: idTransform } }
);

module.exports = mongoose.model("PerfumeCollection", collectionSchema);
