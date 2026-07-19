const mongoose = require("mongoose");

function idTransform(_doc, ret) {
  ret.id = ret._id.toString();
  delete ret._id;
  delete ret.__v;
  return ret;
}

const categorySchema = new mongoose.Schema(
  {
    name:  { type: String, required: true, trim: true, unique: true },
    image: { type: String, default: "" },
  },
  { timestamps: true, toJSON: { transform: idTransform } }
);

module.exports = mongoose.model("Category", categorySchema);
