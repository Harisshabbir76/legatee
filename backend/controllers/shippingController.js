const ShippingSetting = require("../models/ShippingSetting");

// Public — checkout reads the flat shipping price.
exports.get = async (req, res, next) => {
  try {
    const setting = await ShippingSetting.findOne();
    res.json({ price: setting ? setting.price : 0 });
  } catch (err) {
    next(err);
  }
};

// Admin-only — set the flat shipping price.
exports.update = async (req, res, next) => {
  try {
    const price = Number(req.body.price);
    if (!Number.isFinite(price) || price < 0) {
      return res.status(400).json({ message: "A valid shipping price is required." });
    }

    const setting = await ShippingSetting.findOneAndUpdate(
      {},
      { price },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    res.json({ price: setting.price });
  } catch (err) {
    next(err);
  }
};
