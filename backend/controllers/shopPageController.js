const ShopPageContent = require("../models/ShopPageContent");

const DEFAULT_CONTENT = {
  shop: {
    hero: {
      title: { text: "SHOP", tag: "h1", style: {} },
      copy:  { text: "A curated collection of scents where tradition meets contemporary elegance. Discover perfumes and mists crafted to celebrate culture, individuality, and the timeless art of fragrance.", tag: "p", style: {} },
    },
  },
  perfumes: {
    hero: {
      title: { text: "PERFUMES", tag: "h1", style: {} },
      copy:  { text: "A curated collection of scents where tradition meets contemporary elegance. Discover perfumes crafted to celebrate culture, individuality, and the timeless art of fragrance.", tag: "p", style: {} },
    },
  },
  bodyHairMist: {
    hero: {
      title: { text: "BODY AND HAIR MIST", tag: "h1", style: {} },
      copy:  { text: "A curated collection of scents where tradition meets contemporary elegance. Discover body and hair mists crafted to celebrate culture, individuality, and the timeless art of fragrance.", tag: "p", style: {} },
    },
  },
  signature: {
    hero: {
      title: { text: "SIGNATURE PERFUME", tag: "h1", style: {} },
      copy:  { text: "Timeless Arabian scent traditions refined for today. Each signature fragrance is crafted to become a personal statement — expressive, enduring, and unmistakably yours.", tag: "p", style: {} },
    },
  },
  kandora: {
    hero: {
      title: { text: "KANDORA PERFUME", tag: "h1", style: {} },
      copy:  { text: "Scents inspired by the elegance of the kandora — rich, refined, and deeply rooted in Arabian heritage. Crafted for those who carry tradition with pride.", tag: "p", style: {} },
    },
  },
  allOverSpray: {
    hero: {
      title: { text: "ALL OVER SPRAY", tag: "h1", style: {} },
      copy:  { text: "A light, refreshing mist designed for all-day wear. Layer it over your signature scent or wear it alone for a subtle, lingering fragrance that follows you everywhere.", tag: "p", style: {} },
    },
  },
  faq: {
    title: { text: "GOT QUESTIONS?", tag: "h2", style: {} },
    copy:  { text: "Discover everything you need to know about our fragrances, craftsmanship, and how to make the most of your scent journey.", tag: "p", style: {} },
    items: [
      { q: { text: "1. What makes LEGATEE fragrances unique?", tag: "p", style: {} }, a: { text: "LEGATEE blends timeless Arabian scent traditions with refined, modern composition techniques — creating fragrances that feel both nostalgic and contemporary.", tag: "p", style: {} } },
      { q: { text: "2. Are LEGATEE fragrances suitable for both men and women?", tag: "p", style: {} }, a: { text: "Yes. Our scents are designed as expressive, character-rich profiles that can be worn and enjoyed by anyone, regardless of gender.", tag: "p", style: {} } },
      { q: { text: "3. What is the difference between Sadeem and Smoke of Arabia?", tag: "p", style: {} }, a: { text: "Sadeem is a warm, elegant composition with soft amber depth, while Smoke of Arabia is bolder and smokier — built around rich, resinous oud-inspired notes.", tag: "p", style: {} } },
      { q: { text: "4. What is VELOURA Body & Hair Mist?", tag: "p", style: {} }, a: { text: "VELOURA is a lightweight body and hair mist that delivers a gentle, lingering scent — perfect for refreshing throughout the day.", tag: "p", style: {} } },
      { q: { text: "5. How long do LEGATEE perfumes last?", tag: "p", style: {} }, a: { text: "Our eau de parfum concentrations are crafted for longevity, typically lasting 6–8 hours on skin depending on application and conditions.", tag: "p", style: {} } },
    ],
  },
};

exports.getContent = async (req, res, next) => {
  try {
    let doc = await ShopPageContent.findOne({ _singleton: "shoppage" }).lean();
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

    const doc = await ShopPageContent.findOneAndUpdate(
      { _singleton: "shoppage" },
      { $set: content },
      { upsert: true, new: true, runValidators: false }
    ).lean();

    const { _id, __v, _singleton, createdAt, updatedAt, ...saved } = doc;
    return res.status(200).json({ content: saved });
  } catch (err) {
    next(err);
  }
};
