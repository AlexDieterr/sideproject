require("dotenv").config();
require("dotenv").config();

console.log("🚀 Server is starting...");
require("dotenv").config();

console.log("✅ ENV VARIABLES LOADED:");
console.log("PORT:", process.env.PORT);
console.log("MONGO_URI:", process.env.MONGO_URI ? "✅ Loaded" : "❌ Not Loaded");
console.log("STRIPE_SECRET_KEY:", process.env.STRIPE_SECRET_KEY ? "✅ Loaded" : "❌ Not Loaded");
console.log("FRONTEND_URL:", process.env.FRONTEND_URL ? "✅ Loaded" : "❌ Not Loaded");

// Exit if .env is missing
if (!process.env.PORT || !process.env.MONGO_URI || !process.env.STRIPE_SECRET_KEY) {
  console.error("❌ Missing environment variables! Check .env file.");
  process.exit(1); // Stop the server
}
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const bodyParser = require("body-parser");
const { randomUUID } = require("crypto");

const app = express();
const PORT = process.env.PORT || 5001;

// ✅ Ensure Stripe Key is Loaded
if (!process.env.STRIPE_SECRET_KEY) {
  console.error("❌ STRIPE_SECRET_KEY is missing! Check your .env file.");
  process.exit(1);
}

// ✅ Ensure MongoDB Connection String is Loaded
if (!process.env.MONGO_URI) {
  console.error("❌ MONGO_URI is missing! Check your .env file.");
  process.exit(1);
}

// ✅ Middleware
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

// 🔹 Connect to MongoDB Atlas
mongoose
  .connect(process.env.MONGO_URI)
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

// ✅ GET all reviews
app.get("/api/reviews", async (req, res) => {
  const reviews = await Review.find().sort({ createdAt: -1 }); // 🔹 Sort by most recent
  res.json(reviews);
});

// ✅ SEARCH reviews by name
app.get("/api/reviews/search", async (req, res) => {
  const { name } = req.query;
  if (!name) return res.status(400).json({ error: "Name query required." });

  const filteredReviews = await Review.find({ name: new RegExp(name, "i") });
  res.json(filteredReviews);
});

// ✅ POST a new review (Store in Database)
app.post("/api/reviews", async (req, res) => {
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
app.post("/api/pay", async (req, res) => {
  const { ratingId } = req.body;
  console.log("🚀 Received a request to /api/pay");
  console.log("🚀 Received a request to /api/pay");

  console.log("🚀 Received payment request for ratingId:", ratingId); // ✅ Log received ratingId

  if (!ratingId) {
    console.error("❌ Missing ratingId");
    return res.status(400).json({ error: "Missing ratingId" });
  }

  try {
    const unitAmount = 99; // ✅ Should be 99 for $0.99

    console.log("💰💰💰💰💰💰💰💰💰💰💰💰💰💰💰💰 Stripe unit_amount before sending:", unitAmount); // ✅ Log amount

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: { name: "Remove Review" },
            unit_amount: unitAmount, // ✅ This value is CRUCIAL
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `http://localhost:5173/success?ratingId=${ratingId}`,
      cancel_url: `http://localhost:5173/cancel`,
      metadata: { ratingId },
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
  
  if (!ratingId) {
    return res.status(400).json({ error: "Missing ratingId" });
  }

  try {
    const deleted = await Review.findByIdAndDelete(ratingId);
    if (deleted) {
      console.log("✅ Review deleted:", deleted); // ✅ Log this
      res.json({ message: "Review deleted successfully" });
    } else {
      console.error("❌ Review not found");
      res.status(404).json({ error: "Review not found" });
    }
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
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error("❌ Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const ratingId = session.metadata.ratingId;

    if (ratingId) {
      try {
        const deleted = await Review.findByIdAndDelete(ratingId);
        if (deleted) {
          console.log(`✅ Review ${ratingId} deleted successfully`);
        } else {
          console.error(`❌ Review ${ratingId} not found`);
        }
      } catch (error) {
        console.error(`❌ Error deleting review: ${error.message}`);
      }
    }
  }

  res.status(200).json({ received: true });
});

// ✅ Start the Server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});