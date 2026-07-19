const { v2: cloudinary } = require("cloudinary");
const { Readable } = require("node:stream");
const sharp = require("sharp");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function toWebP(buffer) {
  return sharp(buffer)
    .webp({ quality: 82, effort: 4 })
    .toBuffer();
}

async function uploadBuffer(buffer, folder) {
  const webpBuffer = await toWebP(buffer);
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, format: "webp", resource_type: "image" },
      (error, result) => {
        if (error || !result) {
          reject(error ?? new Error("Cloudinary upload failed"));
          return;
        }
        resolve(result.secure_url);
      }
    );
    Readable.from(webpBuffer).pipe(stream);
  });
}

module.exports = { cloudinary, uploadBuffer };
