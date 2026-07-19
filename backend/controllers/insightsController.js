const Product = require("../models/Product");
const Order = require("../models/Order");

exports.getInsights = async (req, res, next) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    const [totalProducts, totalOrders, incomeResult] = await Promise.all([
      Product.countDocuments(),
      Order.countDocuments(),
      Order.aggregate([
        {
          $match: {
            status: { $ne: "cancelled" },
            createdAt: { $gte: startOfMonth, $lt: startOfNextMonth },
          },
        },
        { $group: { _id: null, total: { $sum: "$total" } } },
      ]),
    ]);

    res.json({
      totalProducts,
      totalOrders,
      monthlyIncome: incomeResult[0]?.total ?? 0,
    });
  } catch (err) {
    next(err);
  }
};
