const mongoose = require("mongoose");
const nodemailer = require("nodemailer");
const Order    = require("../models/Order");
const Product  = require("../models/Product");
const User     = require("../models/User");
const ShippingSetting = require("../models/ShippingSetting");

const mailer = nodemailer.createTransport({
  service: "gmail",
  auth: { user: process.env.BUSINESS_EMAIL, pass: process.env.EMAIL_PASS },
});

// â”€â”€ Shared email building blocks â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function emailHeader() {
  return `
    <tr>
      <td align="center" style="background:#173946;padding:32px 40px 28px;">
        <p style="margin:0;color:#f0f5f6;font-family:Georgia,serif;font-size:22px;font-weight:500;letter-spacing:0.22em;">LEGATEE</p>
        <p style="margin:6px 0 0;color:rgba(248,242,237,0.6);font-family:Georgia,serif;font-size:9px;letter-spacing:0.45em;">Ù„ÙŠØ¬Ø§ØªÙŠ</p>
      </td>
    </tr>
    <tr><td style="height:3px;background:#2a7a8c;"></td></tr>`;
}

function emailFooter(year) {
  return `
    <tr>
      <td style="background:#173946;padding:20px 40px;text-align:center;">
        <p style="margin:0;color:rgba(248,242,237,0.55);font-family:Arial,sans-serif;font-size:10px;font-weight:300;letter-spacing:0.04em;">
          Â© ${year} LEGATEE â€” Luxury Arabian Fragrances
        </p>
      </td>
    </tr>`;
}

function emailWrapper(bodyRows, year) {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/></head>
<body style="margin:0;padding:0;background:#f0f5f6;font-family:Georgia,serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f5f6;padding:40px 16px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#ffffff;">
        ${emailHeader()}
        ${bodyRows}
        ${emailFooter(year)}
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function labelRow(label, value) {
  return `
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:12px;">
      <tr>
        <td style="width:120px;padding:10px 14px;background:#f0f5f6;color:#4a6570;font-family:Arial,sans-serif;font-size:10px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;vertical-align:top;">${label}</td>
        <td style="padding:10px 14px;background:#f7fbfc;color:#0d1f26;font-family:Arial,sans-serif;font-size:13px;font-weight:300;line-height:1.5;vertical-align:top;">${value}</td>
      </tr>
    </table>`;
}

function sectionTitle(text) {
  return `<p style="margin:28px 0 14px;color:#173946;font-family:Georgia,serif;font-size:15px;font-weight:500;letter-spacing:0.06em;border-bottom:1px solid #d0e4e8;padding-bottom:8px;">${text}</p>`;
}

function itemsTable(items) {
  const rows = items.map((i) => {
    const desc = i.size ? `${i.name} <span style="color:#888;font-size:11px;">(${i.size})</span>` : i.name;
    return `
      <tr>
        <td style="padding:10px 14px;border-bottom:1px solid #F0E8DF;font-family:Arial,sans-serif;font-size:12px;color:#0d1f26;">${desc}</td>
        <td style="padding:10px 14px;border-bottom:1px solid #F0E8DF;font-family:Arial,sans-serif;font-size:12px;color:#4a6570;text-align:center;">${i.quantity}</td>
        <td style="padding:10px 14px;border-bottom:1px solid #F0E8DF;font-family:Arial,sans-serif;font-size:12px;color:#0d1f26;text-align:right;white-space:nowrap;">AED ${(i.price * i.quantity).toFixed(2)}</td>
      </tr>`;
  }).join("");

  return `
    <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
      <thead>
        <tr style="background:#f0f5f6;">
          <th style="padding:8px 14px;font-family:Arial,sans-serif;font-size:10px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#4a6570;text-align:left;">Product</th>
          <th style="padding:8px 14px;font-family:Arial,sans-serif;font-size:10px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#4a6570;text-align:center;">Qty</th>
          <th style="padding:8px 14px;font-family:Arial,sans-serif;font-size:10px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#4a6570;text-align:right;">Price</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>`;
}

function totalsBlock(shipping, tax, total) {
  const shippingLine = shipping > 0
    ? `<tr><td style="padding:5px 14px;font-family:Arial,sans-serif;font-size:12px;color:#4a6570;">Shipping</td><td style="padding:5px 14px;font-family:Arial,sans-serif;font-size:12px;color:#4a6570;text-align:right;">AED ${shipping.toFixed(2)}</td></tr>`
    : `<tr><td style="padding:5px 14px;font-family:Arial,sans-serif;font-size:12px;color:#4a6570;">Shipping</td><td style="padding:5px 14px;font-family:Arial,sans-serif;font-size:12px;color:#4a6570;text-align:right;">Free</td></tr>`;
  return `
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:4px;">
      ${shippingLine}
      <tr><td style="padding:5px 14px;font-family:Arial,sans-serif;font-size:12px;color:#4a6570;">Tax (5%)</td><td style="padding:5px 14px;font-family:Arial,sans-serif;font-size:12px;color:#4a6570;text-align:right;">AED ${tax.toFixed(2)}</td></tr>
      <tr style="background:#f0f5f6;">
        <td style="padding:10px 14px;font-family:Georgia,serif;font-size:14px;font-weight:600;color:#173946;">Total</td>
        <td style="padding:10px 14px;font-family:Georgia,serif;font-size:14px;font-weight:600;color:#173946;text-align:right;">AED ${total.toFixed(2)}</td>
      </tr>
    </table>`;
}

// â”€â”€ Admin notification email â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function buildAdminOrderHtml(order, year) {
  const orderId = String(order._id).slice(-8).toUpperCase();
  const body = `
    <tr><td style="padding:36px 40px 8px;">
      <p style="margin:0 0 4px;color:#173946;font-family:Georgia,serif;font-size:18px;font-weight:500;">New Order Received</p>
      <p style="margin:0;color:#4a6570;font-family:Arial,sans-serif;font-size:11px;letter-spacing:0.04em;">Order #${orderId}</p>
    </td></tr>
    <tr><td style="padding:0 40px 32px;">
      ${sectionTitle("Customer Details")}
      ${labelRow("Name", order.customer.name)}
      ${labelRow("Email", `<a href="mailto:${order.customer.email}" style="color:#173946;text-decoration:none;">${order.customer.email}</a>`)}
      ${labelRow("Phone", order.customer.phone)}
      ${labelRow("Address", `${order.customer.address}, ${order.customer.city}`)}
      ${labelRow("Payment", order.payment?.method || "â€”")}
      ${sectionTitle("Order Items")}
      ${itemsTable(order.items)}
      ${totalsBlock(order.shipping || 0, order.tax || 0, order.total || 0)}
    </td></tr>`;
  return emailWrapper(body, year);
}

// â”€â”€ Customer confirmation email â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function buildCustomerOrderHtml(order, year) {
  const orderId = String(order._id).slice(-8).toUpperCase();
  const body = `
    <tr><td style="padding:36px 40px 8px;">
      <p style="margin:0 0 8px;color:#173946;font-family:Georgia,serif;font-size:18px;font-weight:500;">Thank You for Your Order</p>
      <p style="margin:0;color:#4a6570;font-family:Arial,sans-serif;font-size:13px;line-height:1.6;">
        Dear ${order.customer.name},<br/>
        We have received your order and it is now being processed. You will be notified once it is on its way.
      </p>
      <p style="margin:12px 0 0;color:#4a6570;font-family:Arial,sans-serif;font-size:11px;letter-spacing:0.04em;">Order #${orderId}</p>
    </td></tr>
    <tr><td style="padding:0 40px 32px;">
      ${sectionTitle("Delivery Address")}
      ${labelRow("Name", order.customer.name)}
      ${labelRow("Address", `${order.customer.address}, ${order.customer.city}`)}
      ${labelRow("Phone", order.customer.phone)}
      ${labelRow("Payment", order.payment?.method || "â€”")}
      ${sectionTitle("Your Items")}
      ${itemsTable(order.items)}
      ${totalsBlock(order.shipping || 0, order.tax || 0, order.total || 0)}
      <p style="margin:28px 0 0;color:#4a6570;font-family:Arial,sans-serif;font-size:11px;line-height:1.7;text-align:center;">
        Questions? Contact us at <a href="mailto:${process.env.BUSINESS_EMAIL || ""}" style="color:#173946;text-decoration:none;">${process.env.BUSINESS_EMAIL || ""}</a>
      </p>
    </td></tr>`;
  return emailWrapper(body, year);
}

// â”€â”€ Send both emails â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function sendOrderEmail(order) {
  if (!process.env.BUSINESS_EMAIL) return;
  const year = new Date().getFullYear();
  const orderId = String(order._id).slice(-8).toUpperCase();

  // Notify admin
  mailer.sendMail({
    from: `"LEGATEE" <${process.env.BUSINESS_EMAIL}>`,
    to: process.env.BUSINESS_EMAIL,
    subject: `New Order #${orderId} â€” LEGATEE`,
    html: buildAdminOrderHtml(order, year),
  }).catch((err) => console.error("Admin order email failed:", err.message));

  // Confirm to customer
  const customerEmail = order.customer?.email;
  if (customerEmail) {
    mailer.sendMail({
      from: `"LEGATEE" <${process.env.BUSINESS_EMAIL}>`,
      to: customerEmail,
      subject: `Order Confirmed #${orderId} â€” LEGATEE`,
      html: buildCustomerOrderHtml(order, year),
    }).catch((err) => console.error("Customer order email failed:", err.message));
  }
}

const CUSTOMER_FIELDS = ["name", "email", "phone", "address", "city"];
const STATUSES = ["pending", "confirmed", "out for delivery", "delivered", "cancelled"];

exports.create = async (req, res, next) => {
  try {
    const { items, customer, userId } = req.body ?? {};

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Your cart is empty." });
    }

    for (const field of CUSTOMER_FIELDS) {
      if (!String(customer?.[field] ?? "").trim()) {
        return res.status(400).json({ message: "Please fill in all shipping details." });
      }
    }

    // Validate all item IDs and quantities upfront before touching DB
    const validatedItems = [];
    for (const item of items) {
      const quantity = Number(item.quantity);
      if (
        !mongoose.Types.ObjectId.isValid(item.productId) ||
        !Number.isInteger(quantity) ||
        quantity < 1
      ) {
        return res.status(400).json({ message: "Invalid cart item." });
      }
      validatedItems.push({ ...item, quantity });
    }

    // Single batch query instead of N individual findById calls
    const productIds = validatedItems.map((i) => i.productId);
    const products = await Product.find({ _id: { $in: productIds } });
    const productMap = new Map(products.map((p) => [p._id.toString(), p]));

    const orderItems = [];
    for (const item of validatedItems) {
      const product = productMap.get(item.productId);
      if (!product) {
        return res.status(400).json({ message: "One of the products in your cart is no longer available." });
      }

      // Stock check â€” only for products that track stock (legacy products don't)
      if (typeof product.stock === "number") {
        if (product.stock <= 0) {
          return res.status(400).json({ message: `"${product.name}" is out of stock.` });
        }
        if (product.stock < item.quantity) {
          return res.status(400).json({
            message: `Only ${product.stock} left in stock for "${product.name}".`,
          });
        }
      }

      orderItems.push({
        product: product._id,
        name: product.name,
        size: item.size || undefined,
        variants: Array.isArray(item.variants)
          ? item.variants
              .filter((v) => v?.name && v?.value)
              .map((v) => ({ name: String(v.name), value: String(v.value) }))
          : [],
        price: product.price,
        quantity: item.quantity,
      });
    }

    const itemsTotal = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

    // Flat shipping price set by the admin (0 when never configured)
    const shippingSetting = await ShippingSetting.findOne();
    const shipping = shippingSetting ? shippingSetting.price : 0;
    const tax = Math.round((itemsTotal + shipping) * 0.05 * 100) / 100;
    const total = itemsTotal + shipping + tax;

    const payment = req.body?.payment ?? {};

    const orderData = {
      items: orderItems,
      customer: {
        name: String(customer.name).trim(),
        email: String(customer.email).trim(),
        phone: String(customer.phone).trim(),
        address: String(customer.address).trim(),
        city: String(customer.city).trim(),
      },
      total,
      tax,
      shipping,
      payment: {
        method: String(payment.method ?? "").trim().slice(0, 40),
        status: String(payment.status ?? "").trim().slice(0, 40),
      },
    };
    if (userId && mongoose.Types.ObjectId.isValid(userId)) {
      orderData.userId = userId;
    }
    const order = await Order.create(orderData);
    sendOrderEmail(order);

    // Decrease stock by the ordered quantity (atomic, never below zero).
    // Only touches products that track stock â€” legacy products are skipped.
    await Promise.all(
      orderItems.map((item) =>
        Product.updateOne(
          { _id: item.product, stock: { $gte: item.quantity } },
          { $inc: { stock: -item.quantity } }
        )
      )
    );

    // Auto-fill user profile from order details if fields are still empty
    if (orderData.userId) {
      const profileUpdate = {};
      const fullName = String(customer.name).trim();
      const phone    = String(customer.phone).trim();
      const address  = String(customer.address).trim();
      const city     = String(customer.city).trim();
      if (fullName) profileUpdate["name"]    = fullName;
      if (phone)    profileUpdate["phone"]   = phone;
      if (address)  profileUpdate["address"] = address;
      if (city)     profileUpdate["city"]    = city;
      // Only set fields that are currently empty on the user
      await User.findOneAndUpdate(
        { _id: orderData.userId },
        [{ $set: {
          name:    { $cond: [{ $eq: ["$name",    ""] }, fullName || "$name",    "$name"]    },
          phone:   { $cond: [{ $eq: ["$phone",   ""] }, phone    || "$phone",   "$phone"]   },
          address: { $cond: [{ $eq: ["$address", ""] }, address  || "$address", "$address"] },
          city:    { $cond: [{ $eq: ["$city",    ""] }, city     || "$city",    "$city"]    },
        }}]
      );
    }

    res.status(201).json({ order });
  } catch (err) {
    next(err);
  }
};

exports.getOne = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ message: "Order not found." });
    }
    const order = await Order.findById(req.params.id).lean();
    if (!order) return res.status(404).json({ message: "Order not found." });
    res.json({ order });
  } catch (err) {
    next(err);
  }
};

exports.list = async (req, res, next) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json({ orders });
  } catch (err) {
    next(err);
  }
};

exports.updateStatus = async (req, res, next) => {
  try {
    const { status } = req.body ?? {};
    if (!STATUSES.includes(status)) {
      return res.status(400).json({ message: "Invalid status." });
    }

    const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!order) {
      return res.status(404).json({ message: "Order not found." });
    }

    res.json({ order });
  } catch (err) {
    next(err);
  }
};

