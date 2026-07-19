const Category = require("../models/Category");
const { uploadBuffer } = require("../config/cloudinary");
const multer = require("multer");

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error("Only image files are allowed."));
  },
});

exports.uploadMiddleware = upload.single("image");

exports.uploadImage = async (req, res, next) => {
  if (!req.file) return res.status(400).json({ message: "No file received." });
  try {
    const url = await uploadBuffer(req.file.buffer, "legatee/categories");
    const category = await Category.findByIdAndUpdate(req.params.id, { image: url }, { new: true });
    if (!category) return res.status(404).json({ message: "Category not found." });
    res.json({ category });
  } catch (err) {
    next(err);
  }
};

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

exports.list = async (req, res, next) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.json({ categories });
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const name = String(req.body.name ?? "").trim();
    if (!name) {
      return res.status(400).json({ message: "Category name is required." });
    }

    const existing = await Category.findOne({ name: new RegExp(`^${escapeRegExp(name)}$`, "i") });
    if (existing) {
      return res.status(409).json({ message: "That category already exists." });
    }

    const category = await Category.create({ name });
    res.status(201).json({ category });
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const name = String(req.body.name ?? "").trim();
    if (!name) {
      return res.status(400).json({ message: "Category name is required." });
    }

    const existing = await Category.findOne({
      _id: { $ne: req.params.id },
      name: new RegExp(`^${escapeRegExp(name)}$`, "i"),
    });
    if (existing) {
      return res.status(409).json({ message: "That category already exists." });
    }

    const category = await Category.findByIdAndUpdate(req.params.id, { name }, { new: true });
    if (!category) {
      return res.status(404).json({ message: "Category not found." });
    }

    res.json({ category });
  } catch (err) {
    next(err);
  }
};

exports.remove = async (req, res, next) => {
  try {
    await Category.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};
