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

const sectionSchema = new mongoose.Schema({
  title: { type: blockSchema, default: () => ({}) },
  lines: { type: [blockSchema], default: [] },
}, { _id: false });

const tabSchema = new mongoose.Schema({
  label:    { type: blockSchema, default: () => ({}) },
  intro:    { type: blockSchema, default: () => ({}) },
  sections: { type: [sectionSchema], default: [] },
}, { _id: false });

const legalPageContentSchema = new mongoose.Schema({
  _singleton: { type: String, default: "legalpage", unique: true },
  heroTitle:  { type: blockSchema, default: () => ({}) },
  heroImage:  { type: String, default: "" },
  tabs:       { type: [tabSchema], default: [] },
}, { timestamps: true });

module.exports = mongoose.model("LegalPageContent", legalPageContentSchema);
