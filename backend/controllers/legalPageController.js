const LegalPageContent = require("../models/LegalPageContent");

const b = (text, tag = "p") => ({ text, tag, style: {} });
const line = (text) => b(text);

const DEFAULT_SECTIONS = [
  ["Website & Intellectual Property", "All content on this website, including the LEGATEE name, logo, images, product photography, designs, and written content, belongs to LEGATEE and may not be copied or used without prior written permission."],
  ["Products & Orders", "We aim to ensure that all product descriptions, images, prices, and availability are accurate. Prices are displayed in AED and may be updated when necessary. An order is confirmed once payment has been successfully received."],
  ["Delivery", "Customers are responsible for providing accurate delivery details. Delivery times may vary depending on location and circumstances beyond our control."],
  ["Returns & Exchanges", "Due to the nature of fragrance products, opened or used products may not be eligible for return or exchange. Any request will be handled according to LEGATEE’s Return & Exchange Policy and applicable UAE consumer-protection laws."],
  ["Privacy", "Customer information is collected and used only where necessary to process orders, arrange delivery, provide customer support, and operate our services, in accordance with applicable UAE privacy laws."],
  ["Governing Law", "These terms are governed by the laws of the United Arab Emirates. Any disputes shall be subject to the jurisdiction of the competent UAE courts."],
].map(([title, text]) => ({ title: b(title, "h2"), lines: [line(text)] }));

const DEFAULT_CONTENT = {
  heroTitle: b("LEGAL", "h1"),
  heroImage: "",
  intro: b("By accessing or purchasing from the LEGATEE website, you agree to the following terms, which are governed by the applicable laws of the United Arab Emirates."),
  sections: DEFAULT_SECTIONS,
  outro: b("For any questions, please contact LEGATEE through the contact details provided on our website."),
};

const mb = (block, fallback) => (block?.text?.trim() ? block : fallback);

exports.getContent = async (req, res, next) => {
  try {
    const doc = await LegalPageContent.findOne({ _singleton: "legalpage" }).lean();
    if (!doc) return res.status(200).json({ content: DEFAULT_CONTENT });
    const { _id, __v, _singleton, createdAt, updatedAt, ...content } = doc;
    content.heroTitle = mb(content.heroTitle, DEFAULT_CONTENT.heroTitle);
    content.intro = mb(content.intro, DEFAULT_CONTENT.intro);
    content.outro = mb(content.outro, DEFAULT_CONTENT.outro);
    if (!content.sections?.length) content.sections = DEFAULT_SECTIONS;
    delete content.tabs;
    return res.status(200).json({ content });
  } catch (err) {
    next(err);
  }
};

exports.saveContent = async (req, res, next) => {
  try {
    const { content } = req.body;
    if (!content) return res.status(400).json({ message: "content is required." });
    const doc = await LegalPageContent.findOneAndUpdate(
      { _singleton: "legalpage" },
      { $set: content },
      { upsert: true, new: true, runValidators: false }
    ).lean();
    const { _id, __v, _singleton, createdAt, updatedAt, ...saved } = doc;
    return res.status(200).json({ content: saved });
  } catch (err) {
    next(err);
  }
};
