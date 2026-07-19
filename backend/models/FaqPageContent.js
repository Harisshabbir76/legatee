const mongoose = require("mongoose");

const styleSchema = new mongoose.Schema({
  fontFamily: String, fontSize: String, fontWeight: String, color: String,
  letterSpacing: String, textAlign: String, lineHeight: String,
  width: String, maxWidth: String, minHeight: String,
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

const faqItemSchema = new mongoose.Schema({
  q: { type: blockSchema, default: () => ({}) },
  a: { type: blockSchema, default: () => ({}) },
}, { _id: false });

const faqPageContentSchema = new mongoose.Schema({
  _singleton:     { type: String, default: "faqpage", unique: true },
  heroTitle:      { type: blockSchema, default: () => ({}) },
  heroSubtitle:   { type: blockSchema, default: () => ({}) },
  heroImage:      { type: String, default: "" },
  items:          { type: [faqItemSchema], default: [] },
  helpIcon:       { type: String, default: "" },
  helpTitle:      { type: blockSchema, default: () => ({}) },
  helpCopy:       { type: blockSchema, default: () => ({}) },
  helpButtonText: { type: blockSchema, default: () => ({}) },
  helpButtonLink: { type: String, default: "" },
}, { timestamps: true });

module.exports = mongoose.model("FaqPageContent", faqPageContentSchema);
