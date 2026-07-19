const FaqPageContent = require("../models/FaqPageContent");

const b = (text, tag = "p") => ({ text, tag, style: {} });

const DEFAULT_ITEMS = [
  { q: b("What makes LEGATEE fragrances unique?", "span"),        a: b("LEGATEE blends timeless Arabian scent traditions with refined, modern composition techniques — creating fragrances that feel both nostalgic and contemporary.") },
  { q: b("Are LEGATEE fragrances suitable for both men and women?", "span"), a: b("Yes. Our scents are designed as expressive, character-rich profiles that can be worn and enjoyed by anyone, regardless of gender.") },
  { q: b("What is the difference between Sadeem and Smoke of Arabia?", "span"), a: b("Sadeem is a warm, elegant composition with soft amber depth, while Smoke of Arabia is bolder and smokier — built around rich, resinous oud-inspired notes.") },
  { q: b("What is VELOURA Body & Hair Mist?", "span"),           a: b("VELOURA is a lightweight body and hair mist that delivers a gentle, lingering scent — perfect for refreshing throughout the day.") },
  { q: b("How long do LEGATEE perfumes last?", "span"),           a: b("Our eau de parfum concentrations are crafted for longevity, typically lasting 6–8 hours on skin depending on application and conditions.") },
  { q: b("How should I apply perfume for the best results?", "span"), a: b("Apply to pulse points such as the wrists, neck, and behind the ears where body heat helps the fragrance bloom throughout the day.") },
  { q: b("Are LEGATEE fragrances suitable for daily wear?", "span"), a: b("Absolutely. Our fragrances are designed to be versatile enough for everyday wear while still feeling special for evenings and occasions.") },
  { q: b("How should I store my fragrance?", "span"),            a: b("Store your fragrance in a cool, dry place away from direct sunlight and heat to preserve its scent and longevity.") },
  { q: b("Do you offer gifting options?", "span"),               a: b("Yes, LEGATEE offers elegant gift packaging for special occasions — perfect for surprising someone with a signature scent.") },
  { q: b("Where can I purchase LEGATEE products?", "span"),       a: b("You can purchase LEGATEE fragrances directly through our online store, with more stockists being added soon.") },
  { q: b("Do you offer nationwide or international shipping?", "span"), a: b("We currently ship nationwide across the UAE, with international shipping options expanding soon.") },
  { q: b("How long will my order take to arrive?", "span"),      a: b("Orders are typically processed within 1–2 business days and delivered within 3–5 business days, depending on your location.") },
  { q: b("How can I track my order?", "span"),                   a: b("Once your order ships, you'll receive a tracking link via email or SMS to follow its journey to your doorstep.") },
  { q: b("Can I return or exchange my fragrance?", "span"),      a: b("Yes, unopened and unused items can be returned or exchanged within 14 days of delivery. Please see our return policy for full details.") },
  { q: b("What should I do if my order arrives damaged or incorrect?", "span"), a: b("Please contact our support team within 48 hours of delivery with photos of the issue, and we'll arrange a replacement or refund promptly.") },
];

const DEFAULT_CONTENT = {
  heroTitle:      b("FREQUENTLY ASKED QUESTIONS", "h1"),
  heroSubtitle:   b("Find answers to common questions about Legatee, our fragrances, orders, shipping, and product care. We're here to ensure your experience is as seamless as the scents we create."),
  heroImage:      "",
  items:          DEFAULT_ITEMS,
  helpIcon:       "",
  helpTitle:      b("CAN'T FIND WHAT YOU ARE LOOKING FOR?", "h2"),
  helpCopy:       b("Still have a question? We're always happy to assist. Contact our team and we'll help you find the information you need, ensuring your LEGATEE experience is seamless from start to finish."),
  helpButtonText: b("CONTACT US", "span"),
  helpButtonLink: "/contact-us",
};

exports.getContent = async (req, res, next) => {
  try {
    const doc = await FaqPageContent.findOne({ _singleton: "faqpage" }).lean();
    if (!doc) return res.status(200).json({ content: DEFAULT_CONTENT });
    const { _id, __v, _singleton, createdAt, updatedAt, ...content } = doc;
    // Fall back to defaults for any ContentBlock that has no text (empty migration)
    const mb = (block, fallback) => (block?.text?.trim() ? block : fallback);
    content.heroTitle      = mb(content.heroTitle,      DEFAULT_CONTENT.heroTitle);
    content.heroSubtitle   = mb(content.heroSubtitle,   DEFAULT_CONTENT.heroSubtitle);
    content.helpTitle      = mb(content.helpTitle,      DEFAULT_CONTENT.helpTitle);
    content.helpCopy       = mb(content.helpCopy,       DEFAULT_CONTENT.helpCopy);
    content.helpButtonText = mb(content.helpButtonText, DEFAULT_CONTENT.helpButtonText);
    const hasRealItems = content.items?.some((i) => i.q?.text?.trim());
    if (!hasRealItems) content.items = DEFAULT_ITEMS;
    return res.status(200).json({ content });
  } catch (err) {
    next(err);
  }
};

exports.saveContent = async (req, res, next) => {
  try {
    const { content } = req.body;
    if (!content) return res.status(400).json({ message: "content is required." });
    const doc = await FaqPageContent.findOneAndUpdate(
      { _singleton: "faqpage" },
      { $set: content },
      { upsert: true, new: true, runValidators: false }
    ).lean();
    const { _id, __v, _singleton, createdAt, updatedAt, ...saved } = doc;
    return res.status(200).json({ content: saved });
  } catch (err) {
    next(err);
  }
};
