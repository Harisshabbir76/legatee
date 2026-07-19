const mongoose = require("mongoose");

const otpStoreSchema = new mongoose.Schema({
  email:     { type: String, required: true, index: true },
  otp:       { type: String, required: true },
  expiresAt: { type: Date,   required: true, index: { expires: 0 } }, // TTL index
});

module.exports = mongoose.model("OtpStore", otpStoreSchema);
