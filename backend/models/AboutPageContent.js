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

const aboutPageContentSchema = new mongoose.Schema({
  _singleton: { type: String, default: "aboutpage", unique: true },

  hero: {
    title:           { type: blockSchema, default: () => ({}) },
    backgroundImage: { type: String, default: "" },
    insetImage:      { type: String, default: "" },
  },

  story: {
    heading:           { type: blockSchema, default: () => ({}) },
    intro:             { type: blockSchema, default: () => ({}) },
    storyImage:        { type: String, default: "" },
    treeImage1:        { type: String, default: "" },
    treeImage2:        { type: String, default: "" },
    treeImage3:        { type: String, default: "" },
    copy:              { type: blockSchema, default: () => ({}) },
    philosophy:        { type: blockSchema, default: () => ({}) },
    philosophyStrong:  { type: blockSchema, default: () => ({}) },
    tagline:           { type: blockSchema, default: () => ({}) },
  },

  marquee: {
    words: { type: String, default: "" },
  },
}, { timestamps: true });

module.exports = mongoose.model("AboutPageContent", aboutPageContentSchema);
