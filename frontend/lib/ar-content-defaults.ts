import { getT } from "./translations";

const ar = getT("ar");

const HOMEPAGE: Record<string, string> = {
  "hero.title":              ar.home.heroTitle,
  "hero.copy":               ar.home.heroCopy,
  "hero.buttonText":         ar.home.heroButton,
  "heritage.heading":        ar.home.heritageHeading,
  "heritage.intro":          ar.home.heritageIntro,
  "heritage.copy":           ar.home.heritageCopy,
  "heritage.tagline":        ar.home.heritageTagline,
  "brandQuote.heading":      ar.home.brandQuoteHeading,
  "brandQuote.copy":         ar.home.brandQuoteCopy,
  "collection.title":        ar.home.collectionTitle,
  "collection.copy":         ar.home.collectionCopy,
  "lovedProducts.title":     ar.product.mostLoved,
  "lovedProducts.copy":      ar.product.mostLovedCopy,
  "lovedProducts.buttonText":ar.product.shopAll,
  "whyChoose.sectionTitle":  ar.home.whyTitle,
  "footer.signatureTitle":   ar.footer.signatureTitle,
  "footer.signatureCopy":    ar.footer.signatureCopy,
  "footer.buttonText":       ar.footer.buttonText,
};

const SHOP: Record<string, string> = {
  "shop.hero.title":           ar.shop.title,
  "shop.hero.copy":            ar.shop.copy,
  "signature.hero.title":      ar.shop.signaturePerfumeTitle,
  "signature.hero.copy":       ar.shop.signaturePerfumeCopy,
  "kandora.hero.title":        ar.shop.kandoraPerfumeTitle,
  "kandora.hero.copy":         ar.shop.kandoraPerfumeCopy,
  "allOverSpray.hero.title":   ar.shop.allOverSprayTitle,
  "allOverSpray.hero.copy":    ar.shop.allOverSprayCopy,
  "faq.title":                 ar.shop.gotQuestionsTitle,
  "faq.copy":                  ar.shop.gotQuestionsCopy,
  "footer.signatureTitle":     ar.footer.signatureTitle,
  "footer.signatureCopy":      ar.footer.signatureCopy,
  "footer.buttonText":         ar.footer.buttonText,
  ...Object.fromEntries(
    ar.faq.items.map((item, i) => [
      [`faq.items.${i}.q`, item.q],
      [`faq.items.${i}.a`, item.a],
    ]).flat()
  ),
};

const ABOUT: Record<string, string> = {
  "heroTitle":        ar.ourStory.heroTitle,
  "foundedHeading":   ar.ourStory.foundedHeading,
  "foundedIntro":     ar.ourStory.foundedIntro,
  "visionLabel":      ar.ourStory.visionLabel,
  "visionText":       ar.ourStory.visionText,
  "copy1":            ar.ourStory.copy1,
  "copy2":            ar.ourStory.copy2,
  "copy3":            ar.ourStory.copy3,
  "missionText":      ar.ourStory.missionText,
  "visionBig":        ar.ourStory.visionBig,
  "valuesHeading":    ar.ourStory.valuesHeading,
  "footer.signatureTitle": ar.footer.signatureTitle,
  "footer.signatureCopy":  ar.footer.signatureCopy,
  "footer.buttonText":     ar.footer.buttonText,
};

const FAQ: Record<string, string> = {
  "heroTitle":        ar.faq.title,
  "heroSubtitle":     ar.faq.subtitle,
  "helpTitle":        ar.faq.helpTitle,
  "helpCopy":         ar.faq.helpCopy,
  "helpButtonText":   ar.faq.helpButton,
  "footer.signatureTitle": ar.footer.signatureTitle,
  "footer.signatureCopy":  ar.footer.signatureCopy,
  "footer.buttonText":     ar.footer.buttonText,
  ...Object.fromEntries(
    ar.faq.items.map((item, i) => [
      [`items.${i}.q`, item.q],
      [`items.${i}.a`, item.a],
    ]).flat()
  ),
};

const CONTACT: Record<string, string> = {
  "heroTitle":         ar.contact.heroTitle,
  "formTitle":         ar.contact.formTitle,
  "formCopy":          ar.contact.formCopy,
  "submitButtonText":  ar.contact.submitButton,
  "instagramTitle":    ar.contact.instagramTitle,
  "instagramCopy":     ar.contact.instagramCopy,
  "footer.signatureTitle": ar.footer.signatureTitle,
  "footer.signatureCopy":  ar.footer.signatureCopy,
  "footer.buttonText":     ar.footer.buttonText,
};

const LEGAL: Record<string, string> = {
  "heroTitle":    ar.legal.title,
  "heroSubtitle": ar.legal.subtitle,
  "footer.signatureTitle": ar.footer.signatureTitle,
  "footer.signatureCopy":  ar.footer.signatureCopy,
  "footer.buttonText":     ar.footer.buttonText,
};

const PAGE_MAP: Record<string, Record<string, string>> = {
  homepage: HOMEPAGE,
  shop:     SHOP,
  about:    ABOUT,
  faq:      FAQ,
  contact:  CONTACT,
  legal:    LEGAL,
};

export function getArDefault(page: string, elKey: string): string {
  return PAGE_MAP[page]?.[elKey] ?? "";
}
