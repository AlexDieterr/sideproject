import { useState } from "react";
import "../styles/RateForm.css";

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL;

const RateForm = ({ onReviewAdded }) => {
  const [name, setName] = useState("");
  const [rating, setRating] = useState("");
  const [tag, setTag] = useState("");
  const [review, setReview] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !rating || !tag || !review) {
      setMessage("All fields are required!");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, rating, tag, review }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit review");
      }

      setMessage("Review submitted successfully!");
      setName("");
      setRating("");
      setTag("");
      setReview("");
      onReviewAdded();
    } catch (error) {
      setMessage("Error submitting review. Please try again.");
      console.error(error);
    }
  };

  return (
    <div className="rate-form-container">
      <h2>Rate Someone</h2>
      {message && <p className="message">{message}</p>}
      <form onSubmit={handleSubmit} className="rate-form">
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          type="number"
          placeholder="Rating (1-10)"
          value={rating}
          onChange={(e) => setRating(e.target.value)}
          min="1"
          max="10"
          required
        />
        <input
          type="text"
          placeholder="Tag (e.g., Friendly, Rude, Kind)"
          value={tag}
          onChange={(e) => setTag(e.target.value)}
          required
        />
        <textarea
          placeholder="Write a description..."
          value={review}
          onChange={(e) => setReview(e.target.value)}
          required
        />
        <button type="submit">Submit</button>
      </form>
    </div>
  );
};

export default RateForm;