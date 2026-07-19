const mongoose = require("mongoose");

const styleSchema = new mongoose.Schema({
  fontFamily: String,
  fontSize: String,
  fontWeight: String,
  color: String,
  letterSpacing: String,
  textAlign: String,
  lineHeight: String,
  width: String,
  maxWidth: String,
  minHeight: String,
  marginTop: String,
  marginRight: String,
  marginBottom: String,
  marginLeft: String,
  paddingTop: String,
  paddingRight: String,
  paddingBottom: String,
  paddingLeft: String,
}, { _id: false });

const blockSchema = new mongoose.Schema({
  text:   { type: String, default: "" },
  textAr: { type: String, default: "" },
  tag:    { type: String, default: "p" },
  style:   { type: styleSchema, default: () => ({}) },
  styleAr: { type: styleSchema, default: () => ({}) },
}, { _id: false });

const whyItemSchema = new mongoose.Schema({
  title: { type: blockSchema, default: () => ({}) },
  line1: { type: blockSchema, default: () => ({}) },
  line2: { type: blockSchema, default: () => ({}) },
  image: { type: String, default: "" },
}, { _id: false });

const homepageContentSchema = new mongoose.Schema({
  // Singleton — always one document
  _singleton: { type: String, default: "homepage", unique: true },

  hero: {
    title:           { type: blockSchema, default: () => ({}) },
    eyebrow:         { type: blockSchema, default: () => ({}) },
    copy:            { type: blockSchema, default: () => ({}) },
    buttonText:      { type: blockSchema, default: () => ({}) },
    buttonLink:      { type: String, default: "/shop" },
    backgroundImage: { type: String, default: "" },
    treeImage:       { type: String, default: "" },
  },

  heritage: {
    heading: { type: blockSchema, default: () => ({}) },
    intro:   { type: blockSchema, default: () => ({}) },
    copy:    { type: blockSchema, default: () => ({}) },
    image:   { type: String, default: "" },
  },

  collection: {
    title: { type: blockSchema, default: () => ({}) },
    copy:  { type: blockSchema, default: () => ({}) },
  },

  whyChoose: {
    sectionTitle: { type: blockSchema, default: () => ({}) },
    buttonText:   { type: blockSchema, default: () => ({}) },
    buttonLink:   { type: String, default: "/shop" },
    items: { type: [whyItemSchema], default: () => [] },
  },
}, { timestamps: true });

module.exports = mongoose.model("HomepageContent", homepageContentSchema);
