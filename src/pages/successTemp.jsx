import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5001";

const Success = () => {
  const [searchParams] = useSearchParams();
  const ratingId = searchParams.get("ratingId");
  const navigate = useNavigate();

  console.log("🎯 Success.jsx LOADED!");
  console.log("🔍 Received ratingId:", ratingId);

  useEffect(() => {
    if (!ratingId) {
      console.error("❌ No ratingId! Redirecting to home...");
      navigate("/");
      return;
    }

    console.log("✅ Success.jsx: ratingId received:", ratingId);

    const deleteReview = async () => {
      console.log("🚀 Sending DELETE request for ratingId:", ratingId);

      try {
        const response = await fetch(`${API_BASE_URL}/api/reviews/delete`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ratingId }),
        });

        const data = await response.json();
        console.log("🎯 Response from DELETE API:", data);

        if (response.ok) {
          console.log("✅ Review deleted successfully!");
        } else {
          console.error("❌ Error deleting review:", data.error);
        }
      } catch (error) {
        console.error("❌ Network error deleting review:", error);
      }
    };

    deleteReview();
  }, [ratingId, navigate]);

  return (
    <div className="container">
      <h2>Payment Successful 🎉</h2>
      <p>Your rating removal was successful!</p>
      <button onClick={() => navigate("/")}>Go Back</button>
    </div>
  );
};

export default Success;