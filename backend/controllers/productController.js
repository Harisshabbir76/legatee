const Product = require("../models/Product");
const Category = require("../models/Category");
const { uploadBuffer } = require("../config/cloudinary");
const { productSlug } = require("../utils/productSlug");

async function resolveCategoryId(name) {
  if (!name) return undefined;
  const doc = await Category.findOneAndUpdate(
    { name: { $regex: new RegExp(`^${name}$`, "i") } },
    { $setOnInsert: { name } },
    { upsert: true, new: true }
  );
  return doc._id;
}

function parseJSON(value, fallback) {
  try {
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function buildIngredients(metaRaw) {
  return parseJSON(metaRaw, [])
    .map((item) => ({
      name: String(item?.name ?? "").trim(),
      description: String(item?.description ?? "").trim(),
    }))
    .filter((item) => item.name && item.description);
}

function parseProductFields(req) {
  const name = String(req.body.name ?? "").trim();
  const description = String(req.body.description ?? "").trim();
const howToUse = String(req.body.howToUse ?? "").trim() || undefined;
  const mood = String(req.body.mood ?? "").trim() || undefined;
  const price = Number(req.body.price);
  const stock = Number(req.body.stock);
  const category = String(req.body.category ?? "").trim() || undefined;
  const collectionId = String(req.body.collection ?? "").trim() || undefined;

  const sizes = parseJSON(req.body.sizes, [])
    .map((size) => String(size).trim())
    .filter(Boolean);

  const variants = parseJSON(req.body.variants, [])
    .filter((variant) => variant.name?.trim())
    .map((variant) => ({
      name: variant.name.trim(),
      values: String(variant.values ?? "").trim(),
    }));

  const showOnHomepage = req.body.showOnHomepage === "true" || req.body.showOnHomepage === true;

  return { name, description, howToUse, mood, price, stock, category, collectionId, sizes, variants, showOnHomepage, slug: productSlug(name) };
}

async function resolveIngredientsImage(req, currentImage) {
  const file = (req.files || []).find((f) => f.fieldname === "ingredientsImage");
  if (file) {
    return uploadBuffer(file.buffer, "legatee/ingredients");
  }
  return currentImage;
}

async function buildProductImages(req) {
  const existing = parseJSON(req.body.existingImages, []).filter(
    (url) => typeof url === "string" && url.trim()
  );

  const files = (req.files || []).filter((file) => file.fieldname.startsWith("productImage_"));
  const uploaded = await Promise.all(
    files.map((file) => uploadBuffer(file.buffer, "legatee/products"))
  );

  return [...existing, ...uploaded].slice(0, 7);
}

exports.list = async (req, res, next) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 }).populate("category").populate("collection");
    res.json({ products });
  } catch (err) {
    next(err);
  }
};

exports.listHomepage = async (req, res, next) => {
  try {
    const products = await Product.find({ showOnHomepage: true }).sort({ createdAt: -1 }).populate("category").populate("collection");
    res.json({ products });
  } catch (err) {
    next(err);
  }
};

exports.getBySlug = async (req, res, next) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug }).populate("category").populate("collection");
    if (!product) {
      return res.status(404).json({ message: "Product not found." });
    }
    res.json({ product });
  } catch (err) {
    next(err);
  }
};

exports.getOne = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id).populate("category").populate("collection");
    if (!product) {
      return res.status(404).json({ message: "Product not found." });
    }
    res.json({ product });
  } catch (err) {
    if (err.name === "CastError") {
      return res.status(404).json({ message: "Product not found." });
    }
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const { name, description, howToUse, mood, price, stock, category, collectionId, sizes, variants, showOnHomepage, slug } =
      parseProductFields(req);

    if (!name || !description) {
      return res.status(400).json({ message: "Name and description are required." });
    }

    if (!Number.isFinite(price) || price < 0) {
      return res.status(400).json({ message: "A valid price is required." });
    }

    if (!Number.isInteger(stock) || stock < 0) {
      return res.status(400).json({ message: "A valid stock quantity is required." });
    }

    const ingredients = buildIngredients(req.body.ingredientsMeta);
    const [ingredientsImage, images, categoryId] = await Promise.all([
      resolveIngredientsImage(req, undefined),
      buildProductImages(req),
      resolveCategoryId(category),
    ]);

    const product = await Product.create({
      name,
      description,
      howToUse,
      mood,
      price,
      stock,
      category: categoryId,
      collection: collectionId || undefined,
      sizes,
      variants,
      ingredients,
      ingredientsImage,
      images,
      showOnHomepage,
      slug,
    });

    await product.populate("category"); await product.populate("collection");
    res.status(201).json({ product });
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found." });
    }

    const { name, description, howToUse, mood, price, stock, category, collectionId, sizes, variants, showOnHomepage, slug } =
      parseProductFields(req);

    if (!name || !description) {
      return res.status(400).json({ message: "Name and description are required." });
    }

    if (!Number.isFinite(price) || price < 0) {
      return res.status(400).json({ message: "A valid price is required." });
    }

    if (!Number.isInteger(stock) || stock < 0) {
      return res.status(400).json({ message: "A valid stock quantity is required." });
    }

    const ingredients = buildIngredients(req.body.ingredientsMeta);
    const [ingredientsImage, images, categoryId] = await Promise.all([
      resolveIngredientsImage(req, product.ingredientsImage),
      buildProductImages(req),
      resolveCategoryId(category),
    ]);

    product.name = name;
    product.slug = slug;
    product.description = description;
    product.howToUse = howToUse;
    product.mood = mood;
    product.price = price;
    product.stock = stock;
    product.category = categoryId;
    product.collection = collectionId || undefined;
    product.sizes = sizes;
    product.variants = variants;
    product.ingredients = ingredients;
    product.ingredientsImage = ingredientsImage;
    product.images = images;
    product.showOnHomepage = showOnHomepage;
    await product.save();
    await product.populate("category"); await product.populate("collection");

    res.json({ product });
  } catch (err) {
    next(err);
  }
};

exports.remove = async (req, res, next) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};
