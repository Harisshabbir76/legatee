const FooterContent = require("../models/FooterContent");

const DEFAULT_CONTENT = {
  quote:          { text: "FRAGRANCE IS MEMORY, IDENTITY, AND EMOTION - CAPTURED IN A BOTTLE.", tag: "h2", style: {} },
  signatureTitle: { text: "FIND YOUR SIGNATURE SCENT", tag: "h3", style: {} },
  signatureCopy:  { text: "Discover fragrances that combine tradition, elegance, and modern expression.", tag: "p", style: {} },
  buttonText:     { text: "EXPLORE THE COLLECTION", tag: "span", style: {} },
  buttonLink:     "/shop",
  footerImage:    "",
};

exports.getContent = async (req, res, next) => {
  try {
    let doc = await FooterContent.findOne({ _singleton: "footer" }).lean();
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
    const doc = await FooterContent.findOneAndUpdate(
      { _singleton: "footer" },
      { $set: content },
      { upsert: true, new: true, runValidators: false }
    ).lean();
    const { _id, __v, _singleton, createdAt, updatedAt, ...saved } = doc;
    return res.status(200).json({ content: saved });
  } catch (err) {
    next(err);
  }
};
