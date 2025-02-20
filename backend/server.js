require("dotenv").config(); // ✅ Ensure environment variables are loaded FIRST

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
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

// 🔹 Connect to MongoDB Atlas
mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

// 🔹 Define Review Schema
const reviewSchema = new mongoose.Schema({
  name: String,
  rating: Number,
  tag: String,
  review: String,
});

const Review = mongoose.model("Review", reviewSchema);

// ✅ GET all reviews
app.get("/api/reviews", async (req, res) => {
  const reviews = await Review.find();
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

// ✅ Stripe Payment Route
app.post("/api/pay", async (req, res) => {
  const { ratingId } = req.body;

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: { name: `Remove Review #${ratingId}` },
            unit_amount: 29900, // $2.99 in cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `http://yourfrontendurl.com/success?ratingId=${ratingId}`,
      cancel_url: "http://yourfrontendurl.com/",
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error("❌ Stripe Error:", error);
    res.status(500).json({ error: "Payment processing failed" });
  }
});

// ✅ Delete Review After Successful Payment
app.post("/api/reviews/delete", async (req, res) => {
  const { ratingId } = req.body;

  try {
    const deleted = await Review.findByIdAndDelete(ratingId);
    if (deleted) {
      res.json({ message: "Review deleted successfully" });
    } else {
      res.status(404).json({ error: "Review not found" });
    }
  } catch (error) {
    console.error("❌ Error deleting review:", error);
    res.status(500).json({ error: "Failed to delete review" });
  }
});

// ✅ Start the Server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});