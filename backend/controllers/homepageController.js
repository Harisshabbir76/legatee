const HomepageContent = require("../models/HomepageContent");

const DEFAULT_CONTENT = {
  hero: {
    title:      { text: "ROOTED IN HERITAGE. CRAFTED FOR TODAY.", tag: "h1", style: {} },
    eyebrow:    { text: "A modern fragrance house inspired by timeless Arabian scent traditions.", tag: "p", style: {} },
    copy:       { text: "LEGATEE creates fragrances that bridge the elegance of the past with the spirit of the present, rich, expressive scents designed for today's generation of fragrance lovers.", tag: "p", style: {} },
    buttonText: { text: "EXPLORE THE COLLECTION", tag: "span", style: {} },
    buttonLink: "/shop",
  },
  heritage: {
    heading: { text: "OUR STORY", tag: "h2", style: {} },
    intro:   { text: "Born from a lifelong passion for perfumery, LEGATEE was founded by Suhail with a simple belief: fragrance should become part of your identity.", tag: "p", style: {} },
    copy:    { text: "From the subtle scent that lingers on a kandora to the memories attached to a familiar aroma, every LEGATEE fragrance is crafted to evoke emotion, character, and connection.", tag: "p", style: {} },
    tagline: { text: "Designed with intention. Remembered with meaning.", tag: "p", style: {} },
  },
  collection: {
    title: { text: "FEATURED COLLECTION", tag: "h2", style: {} },
    copy:  { text: "Discover fragrances inspired by memory, identity, and the art of lasting impressions.", tag: "p", style: {} },
  },
  whyChoose: {
    sectionTitle: { text: "WHY LEGATEE?", tag: "h2", style: {} },
    buttonText:   { text: "SHOP NOW", tag: "span", style: {} },
    buttonLink:   "/shop",
    items: [
      { title: { text: "Inspired by Arabian Heritage", tag: "h3", style: {} }, line1: { text: "Fragrances influenced by timeless scent", tag: "p", style: {} }, line2: { text: "traditions and cultural richness.", tag: "p", style: {} } },
      { title: { text: "Modern Fragrance Craftsmanship", tag: "h3", style: {} }, line1: { text: "Classic inspiration blended with contemporary", tag: "p", style: {} }, line2: { text: "fragrance composition.", tag: "p", style: {} } },
      { title: { text: "Designed for Everyday Identity", tag: "h3", style: {} }, line1: { text: "Scents created to complement evolving", tag: "p", style: {} }, line2: { text: "lifestyles and personal expression.", tag: "p", style: {} } },
      { title: { text: "Elegant Minimal Packaging", tag: "h3", style: {} }, line1: { text: "A refined visual identity that reflects", tag: "p", style: {} }, line2: { text: "sophistication and warmth.", tag: "p", style: {} } },
    ],
  },
};

exports.getContent = async (req, res, next) => {
  try {
    let doc = await HomepageContent.findOne({ _singleton: "homepage" }).lean();
    if (!doc) return res.status(200).json({ content: DEFAULT_CONTENT });

    const { _id, __v, _singleton, createdAt, updatedAt, ...content } = doc;
    return res.status(200).json({ content });
  } catch (err) {
    next(err);
  }
};

exports.saveContent = async (req, res, next) => {
  try {
    const { content } = req.body;
    if (!content) return res.status(400).json({ message: "content is required." });

    const doc = await HomepageContent.findOneAndUpdate(
      { _singleton: "homepage" },
      { $set: content },
      { upsert: true, new: true, runValidators: false }
    ).lean();

    const { _id, __v, _singleton, createdAt, updatedAt, ...saved } = doc;
    return res.status(200).json({ content: saved });
  } catch (err) {
    next(err);
  }
};
