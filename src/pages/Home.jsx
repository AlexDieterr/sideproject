import { useState, useEffect } from "react";
import Search from "../components/Search";
import PaymentForm from "../components/PaymentForm";
import Footer from "../components/Footer"; // ✅ Import Footer
import "./Home.css";

// ✅ Fix: Use Vite's import.meta.env instead of process.env for React
const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5001";

const Home = () => {
  const [searchResults, setSearchResults] = useState([]);
  const [searchedName, setSearchedName] = useState("");
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState({ rating: "", tag: "", review: "" });
  const [selectedReviewId, setSelectedReviewId] = useState(null);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/reviews`);
        if (!response.ok) throw new Error("Failed to fetch reviews.");
        const data = await response.json();
        setReviews(data);
      } catch (error) {
        console.error("Error fetching reviews:", error);
      }
    };

    fetchReviews();
  }, []);

  const handleSearch = async (query) => {
    if (!query) {
      setSearchResults(reviews);
      setSearchedName("");
      return;
    }

    setSearchedName(query);

    try {
      const response = await fetch(`${API_BASE_URL}/api/reviews/search?name=${query}`);
      if (!response.ok) throw new Error("Search request failed.");
      const data = await response.json();
      setSearchResults(data);
    } catch (error) {
      console.error("Error fetching search results:", error);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!searchedName || !newReview.rating || !newReview.tag || !newReview.review) {
      alert("Please fill in all fields!");
      return;
    }

    const reviewData = {
      name: searchedName,
      rating: newReview.rating,
      tag: newReview.tag,
      review: newReview.review,
    };

    try {
      const response = await fetch(`${API_BASE_URL}/api/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reviewData),
      });

      if (!response.ok) throw new Error("Failed to submit review.");
      const data = await response.json();

      setSearchResults([...searchResults, data.review]);
      setNewReview({ rating: "", tag: "", review: "" });
      alert("Review submitted successfully!");
    } catch (error) {
      console.error("Error submitting review:", error);
      alert("Error submitting review. Try again.");
    }
  };

  return (
    <div className="home-container">
      {/* ✅ Clicking resets the page to its initial state */}
      <h1 className="main-title" onClick={() => window.location.reload()}>
        GauchoGirls
      </h1>

      <h2>Search for Reviews</h2>
      <Search onSearch={handleSearch} />

      {searchedName && (
        <>
          <h2>Results for: {searchedName}</h2>

          <div className="search-results">
            {searchResults.length === 0 ? (
              <p>No results found</p>
            ) : (
              searchResults.map((review, index) => (
                <div key={review._id || review.id || `review-${index}`} className="review-card">
                  <h3>{review.name}</h3>
                  <p>Rating: {review.rating}/10</p>
                  <p>Tag: {review.tag}</p>
                  <p>{review.review}</p>
              
                  <button
                    className="pay-button"
                    onClick={() => setSelectedReviewId(review._id)}
                  >
                    Pay Now ($2.99 to Remove)
                  </button>
                </div>
              ))
            )}
          </div>

          {selectedReviewId && (
            <PaymentForm
              ratingId={selectedReviewId}
              onSuccess={() => setSelectedReviewId(null)}
            />
          )}

          <h3>Leave a Review for {searchedName}</h3>
          <form onSubmit={handleReviewSubmit} className="review-form">
            <input
              type="number"
              placeholder="Rating (1-10)"
              value={newReview.rating}
              onChange={(e) => setNewReview({ ...newReview, rating: e.target.value })}
              min="1"
              max="10"
              required
            />
            <input
              type="text"
              placeholder="Tag (e.g., Nice, Rude, Funny)"
              value={newReview.tag}
              onChange={(e) => setNewReview({ ...newReview, tag: e.target.value })}
              required
            />
            <textarea
              placeholder="Write your review..."
              value={newReview.review}
              onChange={(e) => setNewReview({ ...newReview, review: e.target.value })}
              required
            ></textarea>
            <button type="submit">Submit Review</button>
          </form>
        </>
      )}

      <h2>All Reviews</h2>
      <div className="reviews-list">
        {reviews.map((review) => (
          <div key={review.id} className="review-card">
            <h3>{review.name}</h3>
            <p>Rating: {review.rating}/10</p>
            <p>Tag: {review.tag}</p>
            <p>{review.review}</p>
          </div>
        ))}
      </div>

      {/* ✅ Add Footer Here */}
      <Footer />
    </div>
  );
};

export default Home;