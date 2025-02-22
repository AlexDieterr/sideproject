require("dotenv").config();
console.log("🔑 Using STRIPE_SECRET_KEY:", process.env.STRIPE_SECRET_KEY);
console.log("✅ Live Mode:", process.env.STRIPE_SECRET_KEY.startsWith("sk_live") ? "✅ Yes" : "❌ No");

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const rateLimit = require("express-rate-limit");

const app = express();
const PORT = process.env.PORT || 5001;
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

// ✅ Apply Security Headers
app.use((req, res, next) => {
  res.setHeader(
    "Content-Security-Policy",
    "connect-src 'self' https://sideproject-kbo3.onrender.com https://api.stripe.com;"
  );
  next();
});

// ✅ Check for Required Environment Variables
if (!process.env.PORT || !process.env.MONGO_URI || !process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
  console.error("❌ Missing environment variables! Check .env file.");
  process.exit(1);
}

// ✅ Middleware
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

// 🔹 Connect to MongoDB Atlas
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

// 🔹 Define Review Schema
const reviewSchema = new mongoose.Schema({
  name: String,
  rating: Number,
  tag: String,
  review: String,
}, { timestamps: true });

const Review = mongoose.model("Review", reviewSchema);

// 🔹 Store Blocked IPs with Expiration
const blockedIps = new Map(); // Key: IP, Value: Timestamp when block expires (24 hrs)

// ✅ IP Blocking Middleware
app.use((req, res, next) => {
  const blockExpiration = blockedIps.get(req.ip);
  if (blockExpiration && Date.now() < blockExpiration) {
    console.log(`🚨 BLOCKED: IP ${req.ip} tried to access but is banned.`);
    return res.status(403).json({ error: "You are blocked for 24 hours due to excessive requests." });
  }
  next();
});

// ✅ Rate Limiting: Ban for 24 Hours After Exceeding Limit
const reviewLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 60 minutes
  max: 5, // Limit to 5 reviews per 60 minutes
  message: { error: "Too many reviews submitted. Try again later." },
  onLimitReached: (req, res, options) => {
    console.log(`🚨 SPAM DETECTED: Banning IP ${req.ip} for 24 hours.`);
    blockedIps.set(req.ip, Date.now() + 48 * 60 * 60 * 1000); // Block for 24 hours
  }
});

// ✅ GET all reviews
app.get("/api/reviews", async (req, res) => {
  const reviews = await Review.find().sort({ createdAt: -1 });
  res.json(reviews);
});

// ✅ SEARCH reviews by name
app.get("/api/reviews/search", async (req, res) => {
  const { name } = req.query;
  if (!name) return res.status(400).json({ error: "Name query required." });

  const filteredReviews = await Review.find({ name: new RegExp(name, "i") });
  res.json(filteredReviews);
});

// ✅ POST a new review (Now Rate-Limited + 24-Hour Ban)
app.post("/api/reviews", reviewLimiter, async (req, res) => {
  const { name, rating, tag, review } = req.body;
  if (!name || !rating || !tag || !review) {
    return res.status(400).json({ error: "All fields required." });
  }

  try {
    const newReview = new Review({ name, rating, tag, review });
    await newReview.save();
    res.json({ message: "Review added!", review: newReview });
  } catch (error) {
    console.error("❌ Error adding review:", error);
    res.status(500).json({ error: "Failed to add review" });
  }
});

// ✅ Payment Route
app.post("/api/pay", async (req, res) => {
  console.log("🌍 FRONTEND_URL:", process.env.FRONTEND_URL);
  console.log("🛒 Received Payment Request for Rating ID:", req.body.ratingId);

  const { ratingId } = req.body;
  if (!ratingId) {
    console.error("❌ Missing ratingId in request");
    return res.status(400).json({ error: "Missing ratingId" });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: { name: "Remove Review" },
            unit_amount: 99,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.FRONTEND_URL}/success?ratingId=${ratingId}`,
      cancel_url: `${process.env.FRONTEND_URL}/cancel`,
    });

    console.log("✅ Stripe Session Created! Redirecting to:", session.url);
    res.json({ url: session.url });
  } catch (error) {
    console.error("❌ Stripe Checkout Error:", error);
    res.status(500).json({ error: "Failed to create payment session" });
  }
});

// ✅ DELETE review after payment success
app.post("/api/reviews/delete", async (req, res) => {
  const { ratingId } = req.body;
  if (!ratingId) return res.status(400).json({ error: "Missing ratingId" });

  try {
    const deleted = await Review.findByIdAndDelete(ratingId);
    res.json({ message: deleted ? "Review deleted successfully" : "Review not found" });
  } catch (error) {
    console.error("❌ Error deleting review:", error);
    res.status(500).json({ error: "Failed to delete review" });
  }
});

// ✅ Stripe Webhook to Confirm Payment
app.post("/webhook", express.raw({ type: "application/json" }), async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error("❌ Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const ratingId = session.metadata?.ratingId;

    if (ratingId) {
      try {
        const deleted = await Review.findByIdAndDelete(ratingId);
        console.log(deleted ? `✅ Review ${ratingId} deleted successfully` : `❌ Review ${ratingId} not found`);
      } catch (error) {
        console.error(`❌ Error deleting review: ${error.message}`);
      }
    }
  }

  res.status(200).json({ received: true });
});

// ✅ Convert raw body for other routes
app.use(bodyParser.json());

// ✅ Start the Server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
});