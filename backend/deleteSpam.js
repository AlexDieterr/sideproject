require("dotenv").config();
const mongoose = require("mongoose");

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const reviewSchema = new mongoose.Schema({
  name: String,
  rating: Number,
  tag: String,
  review: String,
}, { timestamps: true });

const Review = mongoose.model("Review", reviewSchema);

async function deleteSpamReviews() {
  try {
    console.log("🔍 Searching for spam reviews with special characters...");

    // Find reviews with special characters
    const spamReviews = await Review.find({ "review": { $regex: /[^a-zA-Z0-9 ]/ } });

    if (spamReviews.length === 0) {
      console.log("✅ No spam reviews found.");
      mongoose.connection.close();
      return;
    }

    console.log(`🚨 Found ${spamReviews.length} spam reviews! Deleting now...`);

    // Delete reviews with special characters
    await Review.deleteMany({ "review": { $regex: /[^a-zA-Z0-9 ]/ } });

    console.log("✅ All spam reviews deleted successfully.");
    mongoose.connection.close();
  } catch (error) {
    console.error("❌ Error deleting spam reviews:", error);
    mongoose.connection.close();
  }
}

deleteSpamReviews();