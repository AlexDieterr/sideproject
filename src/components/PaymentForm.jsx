import { useState } from "react";
import "../styles/PaymentForm.css"; // Import CSS

const PaymentForm = ({ ratingId, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handlePayment = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("http://localhost:5001/api/pay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ratingId }),
      });

      const data = await response.json();
      if (data.url) {
        window.location.href = data.url; // Redirect to Stripe Checkout
      } else {
        setError("Payment failed. Try again.");
      }
    } catch (err) {
      setError("Payment error: " + err.message);
    }

    setLoading(false);
  };

  return (
    <div className="payment-modal">
      <h3>Confirm Payment</h3>
      {error && <p className="error">{error}</p>}
      <button onClick={handlePayment} disabled={loading}>
        {loading ? "Processing..." : "Pay $2.99"}
      </button>
      <button onClick={() => onSuccess(null)} className="cancel-btn">
        Cancel
      </button>
    </div>
  );
};

export default PaymentForm;