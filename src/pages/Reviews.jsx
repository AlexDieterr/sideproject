import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../styles/Reviews.css"; // ✅ Keep the CSS file for styling

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5001";

const Reviews = () => {
  const [reviews, setReviews] = useState([]);

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

  // ✅ Function to determine rating background color
  const getRatingColor = (rating) => {
    if (rating >= 7.5) return "green";
    if (rating >= 4) return "yellow";
    return "red";
  };

  return (
    <div className="reviews-container">
      <h1>All Reviews</h1>
      <Link to="/" className="back-button">Back to Home</Link>
      
      <div className="reviews-list">
        {reviews.map((review) => (
          <div key={review._id} className="review-card">
            <h3>{review.name}</h3>
            {/* ✅ Colored Rating Box */}
            <p>
              Rating:{" "}
              <span className={`rating-box ${getRatingColor(review.rating)}`}>
                {review.rating}/10
              </span>
            </p>
            <p>Tag: {review.tag}</p>
            <p>{review.review}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Reviews;