const AboutPageContent = require("../models/AboutPageContent");

const DEFAULT_CONTENT = {
  hero: {
    title: { text: "ABOUT LEGATEE", tag: "h1", style: {} },
  },
  story: {
    heading:          { text: "A STORY OF HERITAGE & MODERNITY", tag: "h2", style: {} },
    intro:            { text: "At LEGATEE, fragrance is more than a scent — it is a reflection of identity, memory, and culture. Inspired by the beauty of Arabian heritage and reimagined through a modern lens, LEGATEE creates fragrances that honor tradition while embracing contemporary elegance. Each creation is thoughtfully crafted for those who appreciate depth, character, and the timeless art of perfumery.", tag: "p", style: {} },
    copy:             { text: "Our collection bridges the past and the present, blending classic influences with modern fragrance craftsmanship to create scents that feel both familiar and refreshingly new. From bold, expressive perfumes to lighter everyday mists, every bottle is designed to accompany moments, evoke emotion, and leave a lasting impression.", tag: "p", style: {} },
    philosophy:       { text: "At the heart of LEGATEE lies a simple philosophy:", tag: "span", style: {} },
    philosophyStrong: { text: "to create fragrances that celebrate where we come from while inspiring who we become.", tag: "span", style: {} },
    tagline:          { text: "ROOTED IN HERITAGE, SHAPED FOR TODAY.", tag: "h3", style: {} },
  },
  marquee: {
    words: "Culture\nPrestige\nEssence\nExpression\nLuxury\nLegacy\nScent\nHeritage\nDepth\nElegance\nIdentity\nCraftsmanship\nCharacter\nTradition\nRefined\nDistinctive\nMemorable\nArtistry",
  },
};

exports.getContent = async (req, res, next) => {
  try {
    const doc = await AboutPageContent.findOne({ _singleton: "aboutpage" }).lean();
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
    const doc = await AboutPageContent.findOneAndUpdate(
      { _singleton: "aboutpage" },
      { $set: content },
      { upsert: true, new: true, runValidators: false }
    ).lean();
    const { _id, __v, _singleton, createdAt, updatedAt, ...saved } = doc;
    return res.status(200).json({ content: saved });
  } catch (err) {
    next(err);
  }
};
