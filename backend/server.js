require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const orderRoutes = require("./routes/orderRoutes");
const shippingRoutes = require("./routes/shippingRoutes");
const insightsRoutes = require("./routes/insightsRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
// const tabbyRoutes = require("./routes/tabbyRoutes");
// const tamaraRoutes = require("./routes/tamaraRoutes");
// const dhlRoutes = require("./routes/dhlRoutes");
const homepageRoutes = require("./routes/homepageRoutes");
const shopPageRoutes = require("./routes/shopPageRoutes");
const aboutPageRoutes = require("./routes/aboutPageRoutes");
const faqPageRoutes   = require("./routes/faqPageRoutes");
const legalPageRoutes   = require("./routes/legalPageRoutes");
const contactPageRoutes    = require("./routes/contactPageRoutes");
const userAuthRoutes       = require("./routes/userAuthRoutes");
const userRoutes           = require("./routes/userRoutes");
const emailMarketingRoutes = require("./routes/emailMarketingRoutes");
const footerRoutes         = require("./routes/footerRoutes");
const collectionRoutes     = require("./routes/collectionRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = (process.env.CORS_ORIGIN || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`Origin ${origin} is not allowed by CORS`));
      }
    },
    allowedHeaders: ["Content-Type", "Authorization"],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json({
  verify(req, _res, buf) {
    req.rawBody = buf;
  },
}));

// Security headers
app.use((req, res, next) => {
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  if (process.env.NODE_ENV === "production") {
    res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  }
  next();
});

// Serve uploaded homepage images statically
const path = require("path");
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/health", (req, res) => res.json({ ok: true }));

app.use("/api/auth",          authRoutes);
app.use("/api/user/auth",     userAuthRoutes);
app.use("/api/contactpage",   contactPageRoutes);
app.use("/api/products",      productRoutes);
app.use("/api/orders",        orderRoutes);
app.use("/api/shipping",      shippingRoutes);
app.use("/api/insights",      insightsRoutes);
app.use("/api/categories",    categoryRoutes);
app.use("/api/collections",   collectionRoutes);
// app.use("/api/tabby",         tabbyRoutes);
// app.use("/api/tamara",        tamaraRoutes);
// app.use("/api/dhl",           dhlRoutes);
app.use("/api/homepage",      homepageRoutes);
app.use("/api/shoppage",      shopPageRoutes);
app.use("/api/aboutpage",     aboutPageRoutes);
app.use("/api/faqpage",       faqPageRoutes);
app.use("/api/legalpage",     legalPageRoutes);
app.use("/api/user",          userRoutes);
app.use("/api/admin/email-marketing", emailMarketingRoutes);
app.use("/api/footer",               footerRoutes);
app.use((req, res) => {
  res.status(404).json({ message: "Not found." });
});

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: "Internal server error." });
});

app.listen(PORT, () => console.log(`Backend listening on port ${PORT}`));

connectDB().catch((err) => {
  console.error(
    "Failed to connect to MongoDB — product routes will fail until this is fixed:",
    err.message
  );
});
