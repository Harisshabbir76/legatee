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

const contactPageContentSchema = new mongoose.Schema({
  _singleton:          { type: String, default: "contactpage", unique: true },
  heroTitle:           { type: blockSchema, default: () => ({}) },
  heroImage:           { type: String, default: "" },
  formTitle:           { type: blockSchema, default: () => ({}) },
  formCopy:            { type: blockSchema, default: () => ({}) },
  submitButtonText:    { type: blockSchema, default: () => ({}) },
  instagramTitle:      { type: blockSchema, default: () => ({}) },
  instagramCopy:       { type: blockSchema, default: () => ({}) },
  instagramHandle:     { type: blockSchema, default: () => ({}) },
  instagramHandleLink: { type: String, default: "" },
  igImage1:            { type: String, default: "" },
  igImage2:            { type: String, default: "" },
  igImage3:            { type: String, default: "" },
  igImage4:            { type: String, default: "" },
  igImage5:            { type: String, default: "" },
  igImage6:            { type: String, default: "" },
  igImage7:            { type: String, default: "" },
}, { timestamps: true });

module.exports = mongoose.model("ContactPageContent", contactPageContentSchema);
