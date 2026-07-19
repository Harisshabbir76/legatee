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

const heroSchema = new mongoose.Schema({
  title:           { type: blockSchema, default: () => ({}) },
  copy:            { type: blockSchema, default: () => ({}) },
  backgroundImage: { type: String, default: "" },
}, { _id: false });

const shopPageContentSchema = new mongoose.Schema({
  _singleton: { type: String, default: "shoppage", unique: true },

  shop:        { hero: { type: heroSchema, default: () => ({}) } },
  perfumes:    { hero: { type: heroSchema, default: () => ({}) } },
  bodyHairMist:{ hero: { type: heroSchema, default: () => ({}) } },
  signature:   { hero: { type: heroSchema, default: () => ({}) } },
  kandora:     { hero: { type: heroSchema, default: () => ({}) } },
  allOverSpray:{ hero: { type: heroSchema, default: () => ({}) } },

  faq: {
    title: { type: blockSchema, default: () => ({}) },
    copy:  { type: blockSchema, default: () => ({}) },
    items: { type: [faqItemSchema], default: () => [] },
  },
}, { timestamps: true });

module.exports = mongoose.model("ShopPageContent", shopPageContentSchema);
