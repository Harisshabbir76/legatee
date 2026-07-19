const fetch  = require("node-fetch");
const crypto = require("crypto");

const TABBY_BASE_URL = "https://api.tabby.ai/api/v2";
const TABBY_CHECKOUT_URL = "https://api.tabby.ai/api/v2/checkout";

// ─── Eligibility check ───────────────────────────────────────────────────────
exports.checkEligibility = async (req, res, next) => {
  try {
    const { amount } = req.body;
    const eligible = amount >= 15 && amount <= 3000;
    return res.status(200).json({ eligible });
  } catch (err) {
    next(err);
  }
};

// ─── Create checkout session ─────────────────────────────────────────────────
exports.createSession = async (req, res, next) => {
  try {
    const { amount, buyer, orderItems, successUrl, cancelUrl, failureUrl, lang } = req.body;

    if (amount < 15 || amount > 3000) {
      return res.status(400).json({
        eligible: false,
        message: "Tabby installments are only eligible for orders between 15 AED and 3000 AED.",
      });
    }

    const payload = {
      payment: {
        amount: String(Number(amount).toFixed(2)),
        currency: "AED",
        buyer: {
          phone: buyer.phone,
          email: buyer.email,
          name: buyer.name,
          dob: buyer.dob || "1990-01-01",
        },
        shipping_address: {
          city: buyer.city || "Dubai",
          address: buyer.address || "UAE Address",
          zip: buyer.postalCode || "00000",
        },
        order: {
          reference_id: `LEGATEE-${Date.now()}`,
          items: orderItems.map((item) => ({
            title: item.name,
            quantity: item.quantity,
            unit_price: String(Number(item.price).toFixed(2)),
            category: "Fragrance",
            reference_id: item.productId || item.name,
          })),
        },
        description: "Legatee Fragrance Order",
      },
      lang: lang || "en",
      merchant_code: process.env.TABBY_MERCHANT_CODE || "",
      // FIXED: Must be plural "merchant_urls"
      merchant_urls: {
        success: successUrl,
        cancel: cancelUrl,
        failure: failureUrl,
      },
    };

    const response = await fetch(TABBY_CHECKOUT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.TABBY_SECRET_KEY || ""}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        eligible: false,
        message: data.error || "Failed to create Tabby session.",
        details: data,
      });
    }

    const paymentUrl =
      data.web_url ||
      data.configuration?.available_products?.installments?.[0]?.web_url;

    return res.status(200).json({
      eligible: true,
      sessionId: data.id,
      paymentId: data.payment?.id,
      paymentUrl,
    });
  } catch (err) {
    next(err);
  }
};

// ─── Payment status ──────────────────────────────────────────────────────────
exports.getPaymentStatus = async (req, res, next) => {
  try {
    const { paymentId } = req.params;

    const response = await fetch(`${TABBY_BASE_URL}/payments/${paymentId}`, {
      headers: {
        Authorization: `Bearer ${process.env.TABBY_SECRET_KEY || ""}`,
      },
    });

    const data = await response.json();
    if (!response.ok) return res.status(response.status).json(data);
    return res.status(200).json({ status: data.status, payment: data });
  } catch (err) {
    next(err);
  }
};

// ─── Capture payment ─────────────────────────────────────────────────────────
exports.capture = async (req, res, next) => {
  try {
    const { paymentId } = req.params;
    const { amount } = req.body;

    const response = await fetch(`${TABBY_BASE_URL}/payments/${paymentId}/captures`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.TABBY_SECRET_KEY || ""}`,
      },
      body: JSON.stringify({ amount: String(Number(amount).toFixed(2)) }),
    });

    const data = await response.json();
    if (!response.ok) return res.status(response.status).json(data);
    return res.status(200).json({ captured: true, capture: data });
  } catch (err) {
    next(err);
  }
};

// ─── Webhook ─────────────────────────────────────────────────────────────────
exports.webhook = async (req, res, next) => {
  try {
    const signature = req.headers["x-tabby-signature"];
    const secret = process.env.TABBY_WEBHOOK_SECRET;

    if (!secret) {
      console.error("TABBY_WEBHOOK_SECRET not configured");
      return res.status(500).json({ message: "Webhook secret not configured." });
    }

    const rawBody = req.rawBody || Buffer.from(JSON.stringify(req.body));
    const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
    const sigBuf = Buffer.from(signature || "");
    const expBuf = Buffer.from(expected);
    if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
      return res.status(401).json({ message: "Invalid or missing webhook signature." });
    }

    const { id, status, amount } = req.body;
    console.log(`Tabby webhook received: id=${id}, status=${status}`);

    // Auto-capture payment when Tabby authorizes it
    if (status?.toUpperCase() === "AUTHORIZED") {
      const captureRes = await fetch(`${TABBY_BASE_URL}/payments/${id}/captures`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.TABBY_SECRET_KEY || ""}`,
        },
        body: JSON.stringify({ amount: String(Number(amount).toFixed(2)) }),
      });

      const captureData = await captureRes.json();
      console.log(`Tabby Payment Captured for ID ${id}:`, captureData);
    }

    return res.status(200).json({ received: true });
  } catch (err) {
    console.error("Tabby Webhook Error:", err);
    return res.status(200).json({ received: true });
  }
};