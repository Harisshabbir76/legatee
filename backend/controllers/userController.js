const User  = require("../models/User");
const Order = require("../models/Order");

function sanitize(user) {
  const obj = user.toObject ? user.toObject() : { ...user };
  delete obj.password;
  delete obj.tokenVersion;
  delete obj.__v;
  obj.id = obj._id?.toString();
  delete obj._id;
  return obj;
}

exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: "User not found." });
    res.json({ user: sanitize(user) });
  } catch (err) { next(err); }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const { name, phone, address, city } = req.body ?? {};
    const user = await User.findByIdAndUpdate(
      req.userId,
      { $set: { name: name?.trim() || "", phone: phone?.trim() || "", address: address?.trim() || "", city: city?.trim() || "" } },
      { new: true }
    );
    if (!user) return res.status(404).json({ message: "User not found." });
    res.json({ user: sanitize(user) });
  } catch (err) { next(err); }
};

exports.toggleEmailMarketing = async (req, res, next) => {
  try {
    const { enabled } = req.body ?? {};
    const user = await User.findByIdAndUpdate(
      req.userId,
      { $set: { emailMarketing: Boolean(enabled) } },
      { new: true }
    );
    if (!user) return res.status(404).json({ message: "User not found." });
    res.json({ user: sanitize(user) });
  } catch (err) { next(err); }
};

exports.getOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ userId: req.userId }).sort({ createdAt: -1 }).lean();
    res.json({ orders });
  } catch (err) { next(err); }
};
