const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const { v4: uuidv4 } = require("uuid");

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5001;

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

  const newReview = new Review({ name, rating, tag, review });
  await newReview.save();
  res.json({ message: "Review added!", review: newReview });
});

// ✅ Stripe payment route
app.post("/api/pay", async (req, res) => {
  const { ratingId } = req.body;
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [{ price_data: { currency: "usd", product_data: { name: `Remove Review #${ratingId}` }, unit_amount: 299 }, quantity: 1 }],
      mode: "payment",
      success_url: `http://yourfrontendurl.com/success?ratingId=${ratingId}`,
      cancel_url: "http://yourfrontendurl.com/",
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error("Stripe Error:", error);
    res.status(500).json({ error: "Payment failed" });
  }
});

// ✅ Delete review after successful payment
app.post("/api/reviews/delete", async (req, res) => {
  const { ratingId } = req.body;
  const deleted = await Review.findByIdAndDelete(ratingId);
  if (deleted) res.json({ message: "Review deleted" });
  else res.status(404).json({ error: "Review not found" });
});

// ✅ Start the server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});