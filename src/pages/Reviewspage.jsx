import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import PaymentForm from "../components/PaymentForm"; // ✅ Import PaymentForm component
import "../styles/Reviews.css"; // ✅ Import CSS

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5001";

const ReviewPage = () => {
  const { name } = useParams();
  const [reviews, setReviews] = useState([]);
  const [selectedReviewId, setSelectedReviewId] = useState(null);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/reviews/search?name=${name}`);
        if (!response.ok) throw new Error("Failed to fetch reviews.");
        const data = await response.json();
        setReviews(data);
      } catch (error) {
        console.error("Error fetching reviews:", error);
      }
    };

    fetchReviews();
  }, [name]);

  return (
    <div className="reviews-container">
      <h1 className="reviews-title">Reviews for {decodeURIComponent(name)}</h1>
      <Link to="/" className="back-button">🏠 Back to Home</Link>
      <div className="reviews-list">
        {reviews.length === 0 ? (
          <p>No reviews found.</p>
        ) : (
          reviews.map((review) => (
            <div key={review._id} className="review-card">
              <h3>{review.name}</h3>
              <p>
                Rating:{" "}
                <span
                  className="rating-box"
                  style={{
                    backgroundColor: review.rating >= 7.5 ? "green" : review.rating >= 4 ? "yellow" : "red",
                  }}
                >
                  {review.rating}/10
                </span>
              </p>
              <p>Tag: {review.tag}</p>
              <p>{review.review}</p>

              {/* ✅ "Pay Now" Button */}
              <button
                className="pay-button"
                onClick={() => setSelectedReviewId(review._id)}
              >
                Pay Now ($0.99 to Remove)
              </button>
            </div>
          ))
        )}
      </div>

      {/* ✅ Payment Form */}
      {selectedReviewId && (
        <PaymentForm
          ratingId={selectedReviewId}
          onSuccess={() => setSelectedReviewId(null)}
        />
      )}
    </div>
  );
};

export default ReviewPage;