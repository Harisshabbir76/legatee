const LegalPageContent = require("../models/LegalPageContent");

const b = (text, tag = "p") => ({ text, tag, style: {} });
const line = (text) => b(text);

const DEFAULT_TABS = [
  {
    label: b("PRIVACY POLICY", "span"),
    intro: b("At LEGATEE, we respect your privacy and are committed to protecting your personal information. This Privacy Policy explains how we collect, use, and safeguard your information when you visit our website, place an order, or interact with our services. By using our website, you agree to the practices described in this Privacy Policy."),
    sections: [
      { title: b("Information We Collect", "h2"), lines: [
          line("We may collect personal information that you voluntarily provide, including:"),
          line("Full name"), line("Email address"), line("Phone number"),
          line("Shipping and billing address"), line("Payment information"),
          line("Order history"), line("Information submitted through contact forms"),
        ],
      },
      { title: b("We may also collect certain non-personal information automatically, such as:", "h2"), lines: [
          line("IP address"), line("Browser type"), line("Device information"),
          line("Website usage data"), line("Cookies and analytics information"),
        ],
      },
      { title: b("How We Use Your Information", "h2"), lines: [
          line("We use the information we collect to:"),
          line("Process and fulfill orders"), line("Provide customer support"),
          line("Communicate order updates and confirmations"),
          line("Improve our website and services"),
          line("Respond to inquiries and requests"),
          line("Send marketing communications (with your consent)"),
          line("Maintain website security and prevent fraudulent activity"),
        ],
      },
      { title: b("Payment Security", "h2"), lines: [
          line("We do not store your complete payment card information on our servers. Payments are processed through trusted third-party payment providers that use industry-standard security measures to protect your information."),
        ],
      },
      { title: b("Sharing of Information", "h2"), lines: [
          line("We do not sell, rent, or trade your personal information."),
          line("We may share information with trusted third-party service providers when necessary to:"),
          line("Process payments"), line("Deliver orders"),
          line("Provide website hosting and maintenance"),
          line("Conduct analytics and performance monitoring"),
          line("These service providers are required to keep your information secure and confidential."),
        ],
      },
      { title: b("Cookies", "h2"), lines: [
          line("Our website may use cookies and similar technologies to enhance your browsing experience, remember preferences, and analyze website traffic."),
          line("You may choose to disable cookies through your browser settings; however, some features of the website may not function properly."),
        ],
      },
      { title: b("Data Protection", "h2"), lines: [
          line("We implement reasonable technical and organizational measures to protect your personal information against unauthorized access, disclosure, alteration, or destruction."),
          line("While we strive to protect your information, no online transmission or storage system can be guaranteed to be completely secure."),
        ],
      },
      { title: b("Third-Party Links", "h2"), lines: [
          line("Our website may contain links to third-party websites."),
          line("We are not responsible for the privacy practices or content of external websites."),
          line("We encourage users to review the privacy policies of any third-party sites they visit."),
        ],
      },
      { title: b("Your Rights", "h2"), lines: [
          line("Depending on applicable laws, you may have the right to:"),
          line("Access your personal information"),
          line("Request correction of inaccurate information"),
          line("Request deletion of your personal information"),
          line("Withdraw consent for marketing communications"),
          line("Request information about how your data is used"),
          line("To exercise these rights, please contact us using the details provided below."),
        ],
      },
      { title: b("Changes to This Policy", "h2"), lines: [
          line("LEGATEE reserves the right to update this Privacy Policy at any time."),
          line("Any changes will be posted on this page with an updated revision date."),
        ],
      },
      { title: b("Contact Us", "h2"), lines: [
          line("If you have any questions regarding this Privacy Policy or the handling of your personal information, please contact us:"),
          line("Email: [Your Email Address]"), line("Phone: [Your Phone Number]"),
          line("Address: [Your Business Address]"), line("We will be happy to assist you."),
        ],
      },
    ],
  },
  {
    label: b("TERMS & CONDITIONS", "span"),
    intro: b("By using the LEGATEE website, you agree to the terms and conditions outlined below. Please read them carefully before browsing, purchasing, or using our services."),
    sections: [
      { title: b("Use of Website", "h2"), lines: [
          line("You agree to use this website only for lawful purposes."),
          line("You may not misuse the website, interfere with its security, or attempt to access restricted areas."),
        ],
      },
      { title: b("Product Information", "h2"), lines: [
          line("We aim to display product details, pricing, and availability as accurately as possible."),
          line("Colors, packaging, and descriptions may vary slightly due to screen settings or product updates."),
        ],
      },
      { title: b("Orders and Payments", "h2"), lines: [
          line("All orders are subject to acceptance and availability."),
          line("LEGATEE reserves the right to cancel or refuse an order if payment, stock, or account details cannot be verified."),
        ],
      },
      { title: b("Intellectual Property", "h2"), lines: [
          line("All website content, including text, imagery, logos, product names, and design elements, belongs to LEGATEE and may not be copied or used without permission."),
        ],
      },
    ],
  },
  {
    label: b("PRODUCTS RETURN", "span"),
    intro: b("We want you to be pleased with your LEGATEE experience. Please review our product return guidelines before requesting an exchange or return."),
    sections: [
      { title: b("Return Eligibility", "h2"), lines: [
          line("Products must be unused, unopened, and returned in their original packaging."),
          line("Returns may be requested within the stated return window after delivery."),
        ],
      },
      { title: b("Damaged or Incorrect Orders", "h2"), lines: [
          line("If your order arrives damaged or incorrect, contact our team with your order number and clear photos of the item and packaging."),
          line("We will review the issue and guide you through the next steps."),
        ],
      },
      { title: b("Non-Returnable Items", "h2"), lines: [
          line("Opened fragrances, used body mists, promotional items, and products without original packaging may not be eligible for return."),
        ],
      },
      { title: b("Processing", "h2"), lines: [
          line("Approved returns or exchanges are processed after the returned item is received and inspected."),
          line("Shipping fees may be non-refundable unless the return is due to an error from our side."),
        ],
      },
    ],
  },
];

const DEFAULT_CONTENT = {
  heroTitle: b("LEGAL", "h1"),
  heroImage: "",
  tabs: DEFAULT_TABS,
};

const mb = (block, fallback) => (block?.text?.trim() ? block : fallback);

exports.getContent = async (req, res, next) => {
  try {
    const doc = await LegalPageContent.findOne({ _singleton: "legalpage" }).lean();
    if (!doc) return res.status(200).json({ content: DEFAULT_CONTENT });
    const { _id, __v, _singleton, createdAt, updatedAt, ...content } = doc;
    content.heroTitle = mb(content.heroTitle, DEFAULT_CONTENT.heroTitle);
    const hasRealTabs = content.tabs?.some((t) => t.label?.text?.trim());
    if (!hasRealTabs) content.tabs = DEFAULT_TABS;
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
