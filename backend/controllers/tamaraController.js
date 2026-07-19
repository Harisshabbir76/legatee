const fetch = require("node-fetch");
const jwt = require("jsonwebtoken");

const TAMARA_BASE_URL = process.env.TAMARA_BASE_URL || "https://api-sandbox.tamara.co";

// ─── Helper ─────────────────────────────────────────────────────────────────
function tamaraHeaders() {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${process.env.TAMARA_API_TOKEN || ""}`,
  };
}

// ─── Create checkout session ─────────────────────────────────────────────────
exports.createSession = async (req, res, next) => {
  try {
    const { 
      amount, 
      buyer, 
      orderItems, 
      successUrl, 
      failureUrl, 
      cancelUrl, 
      orderReferenceId 
    } = req.body;

    const payload = {
      order_reference_id: orderReferenceId || `LEGATEE-${Date.now()}`,
      total_amount: { amount: String(Number(amount).toFixed(2)), currency: "AED" },
      description: "Legatee Fragrance Order",
      country_code: "AE",
      payment_type: "PAY_BY_INSTALMENTS",
      instalments: 3,
      locale: "en_AE",
      items: orderItems.map((item) => ({
        reference_id: item.productId || item.name,
        type: "Physical",
        name: item.name,
        sku: item.productId || item.name,
        quantity: item.quantity,
        unit_price: { amount: String(Number(item.price).toFixed(2)), currency: "AED" },
        total_amount: { amount: String((item.price * item.quantity).toFixed(2)), currency: "AED" },
      })),
      consumer: {
        first_name: buyer.firstName || buyer.name?.split(" ")[0] || "Customer",
        last_name: buyer.lastName || buyer.name?.split(" ").slice(1).join(" ") || "Name",
        phone_number: buyer.phone,
        email: buyer.email,
      },
      billing_address: {
        first_name: buyer.firstName || buyer.name?.split(" ")[0] || "Customer",
        last_name: buyer.lastName || buyer.name?.split(" ").slice(1).join(" ") || "Name",
        line1: buyer.address || "UAE Address",
        city: buyer.city || "Dubai",
        country_code: "AE",
        phone_number: buyer.phone,
      },
      shipping_address: {
        first_name: buyer.firstName || buyer.name?.split(" ")[0] || "Customer",
        last_name: buyer.lastName || buyer.name?.split(" ").slice(1).join(" ") || "Name",
        line1: buyer.address || "UAE Address",
        city: buyer.city || "Dubai",
        country_code: "AE",
        phone_number: buyer.phone,
      },
      merchant_url: {
        success: successUrl,
        failure: failureUrl,
        cancel: cancelUrl,
        notification: `${process.env.BACKEND_URL || ""}/api/tamara/webhook`,
      },
    };

    const response = await fetch(`${TAMARA_BASE_URL}/checkout`, {
      method: "POST",
      headers: tamaraHeaders(),
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        message: data.message || "Failed to create Tamara checkout session.",
        details: data,
      });
    }

    return res.status(200).json({
      checkoutId: data.checkout_id,
      checkoutUrl: data.checkout_url,
      orderId: data.order_id,
    });
  } catch (err) {
    next(err);
  }
};

// ─── Webhook ─────────────────────────────────────────────────────────────────
exports.webhook = async (req, res) => {
  try {
    const notificationToken = process.env.TAMARA_NOTIFICATION_TOKEN;

    if (!notificationToken) {
      console.error("TAMARA_NOTIFICATION_TOKEN not configured");
      return res.status(500).json({ message: "Notification token not configured." });
    }

    const authHeader = req.headers["authorization"] || "";
    const incomingToken = authHeader.startsWith("Bearer ")
      ? authHeader.slice(7)
      : req.query.tamaraToken;

    if (!incomingToken) {
      return res.status(401).json({ message: "Missing Tamara notification token." });
    }

    try {
      jwt.verify(incomingToken, notificationToken, { algorithms: ["HS256"] });
    } catch (verifyErr) {
      return res.status(401).json({ message: "Invalid Tamara notification token." });
    }

    const { event_type, order_id } = req.body;
    console.log(`Tamara webhook event received: event=${event_type}, order=${order_id}`);

    if (event_type === "order_approved" || event_type === "ORDER_APPROVED") {
      try {
        const orderRes = await fetch(`${TAMARA_BASE_URL}/orders/${order_id}`, {
          headers: tamaraHeaders(),
        });
        const orderData = await orderRes.json();

        if (orderRes.ok && (orderData.status === "approved" || orderData.status === "APPROVED")) {
          const capturePayload = {
            order_id,
            total_amount: orderData.total_amount,
            items_capture_details: (orderData.items || []).map((item) => ({
              reference_id: item.reference_id,
              total_amount: item.total_amount,
              unit_price: item.unit_price,
              quantity: item.quantity,
              discount_amount: { amount: "0.00", currency: "AED" },
              tax_amount: { amount: "0.00", currency: "AED" },
              shipping_amount: { amount: "0.00", currency: "AED" },
            })),
            shipping_info: {
              shipped_at: new Date().toISOString(),
              shipping_company: "Standard Delivery",
            },
          };

          const captureRes = await fetch(`${TAMARA_BASE_URL}/payments/capture`, {
            method: "POST",
            headers: tamaraHeaders(),
            body: JSON.stringify(capturePayload),
          });
          const captureData = await captureRes.json();
          console.log(`Tamara capture execution for order ${order_id}:`, captureData);
        }
      } catch (captureErr) {
        console.error(`Error during capture execution for ${order_id}:`, captureErr);
      }
    }

    return res.status(200).json({ received: true });
  } catch (err) {
    console.error("Tamara Webhook Error:", err);
    return res.status(200).json({ received: true });
  }
};

// ─── Manual Capture ─────────────────────────────────────────────────────────
exports.capture = async (req, res, next) => {
  try {
    const { orderId } = req.params;

    const orderRes = await fetch(`${TAMARA_BASE_URL}/orders/${orderId}`, {
      headers: tamaraHeaders(),
    });
    const orderData = await orderRes.json();
    if (!orderRes.ok) return res.status(orderRes.status).json(orderData);

    const capturePayload = {
      order_id: orderId,
      total_amount: orderData.total_amount,
      items_capture_details: (orderData.items || []).map((item) => ({
        reference_id: item.reference_id,
        total_amount: item.total_amount,
        unit_price: item.unit_price,
        quantity: item.quantity,
        discount_amount: { amount: "0.00", currency: "AED" },
        tax_amount: { amount: "0.00", currency: "AED" },
        shipping_amount: { amount: "0.00", currency: "AED" },
      })),
      shipping_info: {
        shipped_at: new Date().toISOString(),
        shipping_company: "Standard Delivery",
      },
    };

    const captureRes = await fetch(`${TAMARA_BASE_URL}/payments/capture`, {
      method: "POST",
      headers: tamaraHeaders(),
      body: JSON.stringify(capturePayload),
    });
    const captureData = await captureRes.json();
    if (!captureRes.ok) return res.status(captureRes.status).json(captureData);
    return res.status(200).json(captureData);
  } catch (err) {
    next(err);
  }
};

// ─── Payment Status ──────────────────────────────────────────────────────────
exports.getPaymentStatus = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const response = await fetch(`${TAMARA_BASE_URL}/orders/${orderId}`, {
      headers: tamaraHeaders(),
    });
    const data = await response.json();
    if (!response.ok) return res.status(response.status).json(data);
    return res.status(200).json({ status: data.status, order: data });
  } catch (err) {
    next(err);
  }
};