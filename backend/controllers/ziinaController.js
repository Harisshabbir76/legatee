const crypto = require('crypto');
const mongoose = require('mongoose');
const Order = require('../models/Order');
const Product = require('../models/Product');
const ShippingSetting = require('../models/ShippingSetting');
const { sendOrderEmail } = require('./orderController');

const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

function getZiinaToken() {
  const token = process.env.ZIINA_ACCESS_TOKEN;
  if (!token) throw new Error('ZIINA_ACCESS_TOKEN is not configured in environment variables.');
  return token;
}

async function fetchZiinaPaymentIntent(intentId) {
  const response = await fetch(`https://api-v2.ziina.com/api/payment_intent/${intentId}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${getZiinaToken()}`,
      'Content-Type': 'application/json',
    },
  });
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    const err = new Error(data?.message || 'Unable to verify payment with Ziina.');
    err.status = response.status || 502;
    throw err;
  }
  return data;
}

function isPaid(status) {
  return ['completed', 'paid', 'succeeded', 'success'].includes(String(status || '').toLowerCase());
}

async function finalizePaidOrder(order) {
  if (order.payment.status === 'paid') return order;
  order.payment.status = 'paid';
  order.status = 'confirmed';
  await order.save();
  await Promise.all(
    order.items.map((item) =>
      Product.updateOne(
        { _id: item.product, stock: { $gte: item.quantity } },
        { $inc: { stock: -item.quantity } }
      )
    )
  );
  sendOrderEmail(order);
  return order;
}

exports.createPaymentIntent = async (req, res) => {
  try {
    const { items, customer, operation_id, userId } = req.body ?? {};

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty.' });
    }
    if (!customer?.email) {
      return res.status(400).json({ message: 'Customer email is required.' });
    }
    if (!operation_id) {
      return res.status(400).json({ message: 'operation_id is required.' });
    }

    const productIds = items.map((i) => i.productId);
    if (productIds.some((id) => !mongoose.Types.ObjectId.isValid(id))) {
      return res.status(400).json({ message: 'Invalid cart item.' });
    }

    const products = await Product.find({ _id: { $in: productIds } });
    const productMap = new Map(products.map((p) => [p._id.toString(), p]));

    const orderItems = [];
    for (const item of items) {
      const quantity = Math.max(1, Math.floor(Number(item.quantity) || 1));
      const product = productMap.get(item.productId);
      if (!product) {
        return res.status(400).json({ message: 'A product in your cart is no longer available.' });
      }
      if (typeof product.stock === 'number') {
        if (product.stock <= 0) {
          return res.status(409).json({ message: `"${product.name}" is out of stock.` });
        }
        if (quantity > product.stock) {
          return res.status(409).json({
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
        quantity,
      });
    }

    const itemsTotal = orderItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const shippingSetting = await ShippingSetting.findOne();
    const shipping = shippingSetting ? shippingSetting.price : 0;
    const tax = Math.round((itemsTotal + shipping) * 0.05 * 100) / 100;
    const total = itemsTotal + shipping + tax;

    const orderData = {
      items: orderItems,
      customer: {
        name: String(customer.name || '').trim(),
        email: String(customer.email || '').trim(),
        phone: String(customer.phone || '').trim(),
        address: String(customer.address || '').trim(),
        city: String(customer.city || '').trim(),
      },
      total,
      tax,
      shipping,
      payment: { method: 'Ziina', status: 'pending' },
    };
    if (userId && mongoose.Types.ObjectId.isValid(userId)) {
      orderData.userId = userId;
    }

    const order = await Order.create(orderData);

    const payload = {
      amount: Math.round(total * 100),
      currency_code: 'AED',
      message: 'Order Payment for Legatee',
      success_url: `${frontendUrl}/checkout/success?payment_intent_id={PAYMENT_INTENT_ID}`,
      cancel_url: `${frontendUrl}/checkout/cancel`,
      failure_url: `${frontendUrl}/checkout/failure`,
      test: false,
      allow_tips: false,
      operation_id,
    };

    const response = await fetch('https://api-v2.ziina.com/api/payment_intent', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${getZiinaToken()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    const data = await response.json();

    if (!response.ok) {
      console.error('Ziina API error:', data);
      return res.status(response.status || 502).json({
        message: data.message || 'Failed to create payment intent with Ziina.',
        details: data,
      });
    }

    order.ziinaPaymentIntentId = data.id;
    await order.save();

    return res.status(201).json({ success: true, id: data.id, redirect_url: data.redirect_url });
  } catch (err) {
    console.error('createPaymentIntent error:', err);
    return res.status(500).json({ message: err.message || 'Internal server error.' });
  }
};

exports.getOrderByIntent = async (req, res) => {
  try {
    const { intentId } = req.params;
    if (!intentId) {
      return res.status(400).json({ message: 'Payment intent ID is required.' });
    }

    const order = await Order.findOne({ ziinaPaymentIntentId: intentId });
    if (!order) {
      return res.status(404).json({ message: 'Order not found.' });
    }

    if (order.payment.status !== 'paid') {
      try {
        const intentData = await fetchZiinaPaymentIntent(intentId);
        const ziinaStatus = intentData?.status || intentData?.data?.status;

        if (isPaid(ziinaStatus)) {
          const updated = await finalizePaidOrder(order);
          return res.status(200).json({ success: true, order: updated });
        }

        if (String(ziinaStatus || '').toLowerCase() === 'failed') {
          order.payment.status = 'failed';
          await order.save();
          return res.status(402).json({ message: 'Payment was not successful.' });
        }

        return res.status(202).json({
          success: false,
          message: 'Payment is still being verified. Please wait a moment.',
          paymentStatus: ziinaStatus || order.payment.status,
        });
      } catch (verifyErr) {
        console.error('Ziina verification error:', verifyErr);
        return res.status(202).json({
          success: false,
          message: 'Payment is still being verified. Please wait a moment.',
          paymentStatus: order.payment.status,
        });
      }
    }

    return res.status(200).json({ success: true, order });
  } catch (err) {
    console.error('getOrderByIntent error:', err);
    return res.status(500).json({ message: err.message || 'Internal server error.' });
  }
};

const ZIINA_ALLOWED_IPS = ['3.29.184.186', '3.29.190.95', '20.233.47.127', '13.202.161.181'];

function isAllowedIp(req) {
  if (process.env.NODE_ENV !== 'production') return true;
  const forwardedFor = req.headers['x-forwarded-for'];
  let ip = forwardedFor ? forwardedFor.split(',')[0].trim() : req.socket.remoteAddress || '';
  if (ip.startsWith('::ffff:')) ip = ip.slice(7);
  return ZIINA_ALLOWED_IPS.includes(ip);
}

function verifySignature(req) {
  const secret = process.env.ZIINA_WEBHOOK_SECRET;
  if (!secret) return true;
  const headerSig = req.headers['x-hmac-signature'];
  if (!headerSig || !req.rawBody) return false;
  const computed = crypto.createHmac('sha256', secret).update(req.rawBody).digest('hex');
  try {
    return crypto.timingSafeEqual(Buffer.from(computed, 'hex'), Buffer.from(headerSig, 'hex'));
  } catch {
    return false;
  }
}

exports.handleZiinaWebhook = async (req, res) => {
  try {
    if (!isAllowedIp(req)) {
      const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
      console.warn(`Unauthorized Ziina webhook from IP: ${ip}`);
      return res.status(403).json({ message: 'Forbidden.' });
    }

    if (!verifySignature(req)) {
      console.warn('Ziina webhook signature verification failed.');
      return res.status(401).json({ message: 'Invalid signature.' });
    }

    const { event, data } = req.body;
    console.log(`Ziina webhook event: ${event}`);

    if (event !== 'payment_intent.status.updated') {
      return res.status(200).json({ received: true });
    }

    if (!data?.id || !data?.status) {
      return res.status(400).json({ message: 'Invalid webhook payload.' });
    }

    const paymentStatus = String(data.status).toLowerCase();
    const order = await Order.findOne({ ziinaPaymentIntentId: data.id });

    if (!order) {
      console.warn(`Ziina webhook: no order found for intent ${data.id}`);
      return res.status(200).json({ received: true });
    }

    if (isPaid(paymentStatus)) {
      await finalizePaidOrder(order);
      console.log(`Order ${order._id} finalized as paid via Ziina webhook.`);
    } else if (paymentStatus === 'failed') {
      order.payment.status = 'failed';
      await order.save();
      console.log(`Order ${order._id} marked as failed via Ziina webhook.`);
    }

    return res.status(200).json({ received: true });
  } catch (err) {
    console.error('Ziina webhook error:', err);
    return res.status(500).json({ message: err.message || 'Internal server error.' });
  }
};
