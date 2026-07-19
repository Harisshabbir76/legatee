const Collection = require("../models/Collection");
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

exports.list = async (req, res, next) => {
  try {
    const collections = await Collection.find().sort({ order: 1, createdAt: 1 });
    res.json({ collections });
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const name        = String(req.body.name ?? "").trim();
    const description = String(req.body.description ?? "").trim();
    if (!name) return res.status(400).json({ message: "Collection name is required." });

    const existing = await Collection.findOne({ name: new RegExp(`^${name}$`, "i") });
    if (existing) return res.status(409).json({ message: "That collection already exists." });

    const collection = await Collection.create({ name, description });
    res.status(201).json({ collection });
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const name        = String(req.body.name ?? "").trim();
    const description = String(req.body.description ?? "").trim();
    if (!name) return res.status(400).json({ message: "Collection name is required." });

    const existing = await Collection.findOne({ _id: { $ne: req.params.id }, name: new RegExp(`^${name}$`, "i") });
    if (existing) return res.status(409).json({ message: "That collection name already exists." });

    const collection = await Collection.findByIdAndUpdate(req.params.id, { name, description }, { new: true });
    if (!collection) return res.status(404).json({ message: "Collection not found." });
    res.json({ collection });
  } catch (err) {
    next(err);
  }
};

exports.remove = async (req, res, next) => {
  try {
    await Collection.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};

exports.uploadImage = async (req, res, next) => {
  if (!req.file) return res.status(400).json({ message: "No file received." });
  try {
    const url = await uploadBuffer(req.file.buffer, "legatee/collections");
    const collection = await Collection.findByIdAndUpdate(req.params.id, { image: url }, { new: true });
    if (!collection) return res.status(404).json({ message: "Collection not found." });
    res.json({ collection });
  } catch (err) {
    next(err);
  }
};
