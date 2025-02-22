import { useState, useEffect } from "react";
import Search from "../components/Search";
import PaymentForm from "../components/PaymentForm";
import Footer from "../components/Footer"; 
import "./Home.css";
import { Link } from "react-router-dom"; // ✅ Import this

// ✅ Use Vite's Environment Variable System
const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5001";

const Home = () => {
  const [searchResults, setSearchResults] = useState([]);
  const [searchedName, setSearchedName] = useState("");
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState({ rating: "", tag: "", review: "" });
  const [selectedReviewId, setSelectedReviewId] = useState(null);
  const [message, setMessage] = useState(""); // ✅ Success message state

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
      setSearchResults([]);
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
      setMessage("❌ Please fill in all fields!");
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

      // ✅ Show success message
      setMessage("✅ Review submitted successfully! 🎉");

      // ✅ Auto-hide message after 3 seconds
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      console.error("Error submitting review:", error);
      setMessage("❌ Error submitting review. Try again.");
    }
  };

  // ✅ Function to determine rating background color
  const getRatingColor = (rating) => {
    if (rating >= 7.5) return "green";
    if (rating >= 4) return "yellow";
    return "red";
  };

  return (
    <div className="home-container">
      {/* ✅ Styled Title & Subtitle */}
      <h1 className="main-title" onClick={() => window.location.reload()}>
        🦝🌴 <span className="pink-text">GauchoGirls</span>
      </h1>
      <h3 className="subtitle">
        <span className="pink-text">Anonymously rate your experience with Isla Vista girls</span>
        <br />
        <span className="pink-text">(Like RateMyProfessor but for IV guys to rate IV girls)</span>
      </h3>

      <h2>Search for Reviews (ENTER LAST NAMES TOO)</h2>
      <Search onSearch={handleSearch} />

      {searchedName && (
        <>
          <h2>Results for: {searchedName}</h2>
          
          {/* ✅ Added Title with Dynamic Background Color */}
          {searchResults.length > 0 && (() => {
            const overallRating = (
              searchResults.reduce((sum, review) => sum + review.rating, 0) /
              searchResults.length
            ).toFixed(1);

            // ✅ Set background color based on rating
            const getColor = (rating) => {
              if (rating >= 7.5) return "green";
              if (rating >= 4) return "yellow";
              return "red";
            };

            return (
              <h3
                style={{
                  backgroundColor: getColor(overallRating),
                  color: "black",
                  padding: "10px",
                  borderRadius: "8px",
                  display: "inline-block",
                  fontWeight: "bold",
                }}
              >
                {searchResults[0].name} - Overall Rating: {overallRating}/10
              </h3>
            );
          })()}

          <div className="search-results">
            {searchResults.length === 0 ? (
              <p>No results found</p>
            ) : (
              <div className="review-list">
                {searchResults.map((review) => (
                  <div key={review._id || review.id} className="review-card">
                    <h3>{review.name}</h3>
                    <p>
                      Rating:{" "}
                      <span
                        style={{
                          backgroundColor: getRatingColor(review.rating),
                          color: "white",
                          padding: "4px 8px",
                          borderRadius: "4px",
                          fontWeight: "bold",
                          display: "inline-block",
                        }}
                      >
                        {review.rating}/10
                      </span>
                    </p>
                    <p>Tag: {review.tag}</p>
                    <p>{review.review}</p>

                    {/* ✅ Pay Now Button */}
                    <button
                      className="pay-button"
                      onClick={() => setSelectedReviewId(review._id)}
                    >
                      Pay Now ($0.99 to Remove)
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ✅ Leave a Review Section */}
          <div className="leave-review-container">
            <h3>Leave a Review for {searchedName}</h3>
            {message && <p className="success-message">{message}</p>}
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
          </div>
        </>
      )}

      {/* ✅ View Leaderboard Button */}
      <div className="leaderboard-button-container">
        <Link to="/leaderboard" className="leaderboard-button">
          View Leaderboard
        </Link>
      </div>

      {/* ✅ Most Recent Reviews Button */}
      <div className="most-recent-reviews-title">
        <Link to="/reviews" className="most-recent-reviews-button">
          Stream 📝
        </Link>
      </div>

      <Footer />

      {/* ✅ Payment Form Modal */}
      {selectedReviewId && (
        <PaymentForm ratingId={selectedReviewId} onSuccess={() => setSelectedReviewId(null)} />
      )}
    </div>
  );
};

export default Home;