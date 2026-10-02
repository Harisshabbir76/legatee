const FaqPageContent = require("../models/FaqPageContent");

const b = (text, tag = "p") => ({ text, tag, style: {} });

const DEFAULT_ITEMS = [
  { q: { ...b("What makes LEGATEE fragrances unique?", "span"), textAr: "ما الذي يجعل عطور LEGATEE مميزة؟" }, a: { ...b("LEGATEE is built around a distinctive international positioning, combining refined branding, a strong visual identity, and fragrances designed to make a lasting impression. Each scent is created to feel modern, elevated, and effortlessly unisex, with longevity that carries you throughout the day."), textAr: "تقوم LEGATEE على مكانة دولية مميزة، تجمع بين العلامة التجارية الراقية والهوية البصرية القوية، وعطور مصممة لتترك أثراً لا يُنسى. كل عطر مصمم ليشعرك بالحداثة والرقي، مع طول أمد يرافقك طوال اليوم." } },
  { q: { ...b("Are LEGATEE fragrances suitable for both men and women?", "span"), textAr: "هل عطور LEGATEE مناسبة للرجال والنساء؟" }, a: { ...b("Absolutely. LEGATEE fragrances are unisex, created to be worn and enjoyed by everyone. Each scent is designed to complement different personalities and styles rather than being limited by gender."), textAr: "بالتأكيد. عطور LEGATEE هي عطور للجنسين، مصممة لتُرتدى وتُستمتع بها من الجميع. كل عطر مصمم ليتناسب مع الشخصيات والأساليب المختلفة دون أن يكون مقيداً بالجنس." } },
  { q: { ...b("How long do LEGATEE perfumes last?", "span"), textAr: "كم تدوم عطور LEGATEE؟" }, a: { ...b("LEGATEE fragrances are designed for long-lasting wear, with longevity ranging from approximately 8–9 hours and extending up to 15–16 hours, depending on the fragrance, skin type, and application."), textAr: "صُممت عطور LEGATEE لتدوم طويلاً، حيث تتراوح مدة بقاء العطر من 8 إلى 9 ساعات تقريباً، وقد تمتد حتى 15 إلى 16 ساعة، وذلك حسب العطر ونوع البشرة وطريقة التطبيق." } },
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
