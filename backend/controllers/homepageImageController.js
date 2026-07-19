const multer = require("multer");
const { v2: cloudinary } = require("cloudinary");
const { Readable } = require("node:stream");
const { uploadBuffer } = require("../config/cloudinary");

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: (_req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error("Only image files are allowed."));
  },
});

exports.uploadMiddleware = upload.single("image");

exports.uploadImage = async (req, res) => {
  if (!req.file) return res.status(400).json({ message: "No file received." });

  try {
    let url;

    if (req.file.mimetype === "image/svg+xml") {
      // Upload SVG as-is to Cloudinary (raw resource type)
      url = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "legatee/cms", resource_type: "image", format: "svg" },
          (error, result) => {
            if (error || !result) reject(error ?? new Error("Cloudinary upload failed"));
            else resolve(result.secure_url);
          }
        );
        Readable.from(req.file.buffer).pipe(stream);
      });
    } else {
      url = await uploadBuffer(req.file.buffer, "legatee/cms");
    }

    return res.status(200).json({ url });
  } catch (err) {
    console.error("CMS image upload error:", err);
    return res.status(500).json({ message: "Failed to upload image." });
  }
};
