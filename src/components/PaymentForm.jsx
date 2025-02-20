import { useState } from "react";
import "../styles/PaymentForm.css"; // Import CSS

// ✅ Use environment variable for API base URL
const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5001"; 

const PaymentForm = ({ ratingId, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handlePayment = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/pay`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ratingId }),
      });

      if (!response.ok) {
        throw new Error("Payment request failed.");
      }

      const data = await response.json();
      if (data.url) {
        window.location.href = data.url; // ✅ Redirect to Stripe Checkout
      } else {
        setError("Payment failed. Try again.");
      }
    } catch (err) {
      setError(`Payment error: ${err.message}`);
      console.error("Payment error:", err);
    }

    setLoading(false);
  };

  return (
    <div className="payment-modal">
      <h3>Confirm Payment</h3>
      {error && <p className="error">{error}</p>}
      <button className="pay-btn" onClick={handlePayment} disabled={loading}>
        {loading ? "Processing..." : "Pay $2.99"}
      </button>
      <button className="cancel-btn" onClick={() => onSuccess(null)}>
        Cancel
      </button>
    </div>
  );
};

export default PaymentForm;