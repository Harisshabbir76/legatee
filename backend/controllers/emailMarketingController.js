const User  = require("../models/User");
const Order = require("../models/Order");

exports.getList = async (req, res, next) => {
  try {
    // 1. Users who opted in
    const optedIn = await User.find({ emailMarketing: true })
      .select("name email createdAt")
      .lean();

    // 2. Guest order emails (orders with no userId)
    const guestOrders = await Order.find({ userId: null })
      .select("customer.name customer.email createdAt")
      .sort({ createdAt: -1 })
      .lean();

    // Deduplicate guest emails
    const seenEmails = new Set(optedIn.map((u) => u.email.toLowerCase()));
    const guestEmails = [];
    for (const o of guestOrders) {
      const em = o.customer?.email?.toLowerCase();
      if (em && !seenEmails.has(em)) {
        seenEmails.add(em);
        guestEmails.push({ name: o.customer.name, email: o.customer.email, createdAt: o.createdAt, source: "guest_order" });
      }
    }

    const subscribers = optedIn.map((u) => ({
      id: u._id?.toString(),
      name: u.name || "—",
      email: u.email,
      createdAt: u.createdAt,
      source: "opted_in",
    }));

    res.json({ subscribers, guestEmails, total: subscribers.length + guestEmails.length });
  } catch (err) { next(err); }
};
