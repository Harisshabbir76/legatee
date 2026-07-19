const mongoose = require("mongoose");

const styleSchema = new mongoose.Schema({
  fontFamily: String, fontSize: String, fontWeight: String, color: String,
  letterSpacing: String, textAlign: String, lineHeight: String, width: String,
  maxWidth: String, minHeight: String,
  marginTop: String, marginRight: String, marginBottom: String, marginLeft: String,
  paddingTop: String, paddingRight: String, paddingBottom: String, paddingLeft: String,
}, { _id: false });

const blockSchema = new mongoose.Schema({
  text:    { type: String, default: "" },
  textAr:  { type: String, default: "" },
  tag:     { type: String, default: "p" },
  style:   { type: styleSchema, default: () => ({}) },
  styleAr: { type: styleSchema, default: () => ({}) },
}, { _id: false });

const footerContentSchema = new mongoose.Schema({
  _singleton:     { type: String, default: "footer", unique: true },
  quote:          { type: blockSchema, default: () => ({}) },
  signatureTitle: { type: blockSchema, default: () => ({}) },
  signatureCopy:  { type: blockSchema, default: () => ({}) },
  buttonText:     { type: blockSchema, default: () => ({}) },
  buttonLink:     { type: String, default: "/shop" },
  footerImage:    { type: String, default: "" },
}, { timestamps: true });

module.exports = mongoose.model("FooterContent", footerContentSchema);
