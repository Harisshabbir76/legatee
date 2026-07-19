const ContactPageContent = require("../models/ContactPageContent");

const b = (text, tag = "p") => ({ text, tag, style: {} });

const DEFAULT_CONTENT = {
  heroTitle:           b("CONTACT US", "h1"),
  heroImage:           "",
  formTitle:           b("We'd Love to Hear From You", "h2"),
  formCopy:            b("Every fragrance tells a story, and every conversation begins a new one. Whether you're exploring our collection, seeking support, or sharing your thoughts, we're here to assist. Connect with us and discover the world of LEGATEE."),
  submitButtonText:    b("SEND YOUR MESSAGE", "span"),
  instagramTitle:      b("CONNECT WITH US ON INSTAGRAM", "h2"),
  instagramCopy:       b("Explore our latest fragrances, behind-the-scenes moments, and sensory inspiration. Follow along and immerse yourself in the world of LEGATEE."),
  instagramHandle:     b("@legatee_ae", "span"),
  instagramHandleLink: "https://www.instagram.com/",
  igImage1: "", igImage2: "", igImage3: "", igImage4: "",
  igImage5: "", igImage6: "", igImage7: "",
};

const mb = (block, fallback) => (block?.text?.trim() ? block : fallback);

exports.getContent = async (req, res, next) => {
  try {
    const doc = await ContactPageContent.findOne({ _singleton: "contactpage" }).lean();
    if (!doc) return res.status(200).json({ content: DEFAULT_CONTENT });
    const { _id, __v, _singleton, createdAt, updatedAt, ...content } = doc;
    content.heroTitle        = mb(content.heroTitle,        DEFAULT_CONTENT.heroTitle);
    content.formTitle        = mb(content.formTitle,        DEFAULT_CONTENT.formTitle);
    content.formCopy         = mb(content.formCopy,         DEFAULT_CONTENT.formCopy);
    content.submitButtonText = mb(content.submitButtonText, DEFAULT_CONTENT.submitButtonText);
    content.instagramTitle   = mb(content.instagramTitle,   DEFAULT_CONTENT.instagramTitle);
    content.instagramCopy    = mb(content.instagramCopy,    DEFAULT_CONTENT.instagramCopy);
    content.instagramHandle  = mb(content.instagramHandle,  DEFAULT_CONTENT.instagramHandle);
    return res.status(200).json({ content });
  } catch (err) {
    next(err);
  }
};

exports.saveContent = async (req, res, next) => {
  try {
    const { content } = req.body;
    if (!content) return res.status(400).json({ message: "content is required." });
    const doc = await ContactPageContent.findOneAndUpdate(
      { _singleton: "contactpage" },
      { $set: content },
      { upsert: true, new: true, runValidators: false }
    ).lean();
    const { _id, __v, _singleton, createdAt, updatedAt, ...saved } = doc;
    return res.status(200).json({ content: saved });
  } catch (err) {
    next(err);
  }
};
