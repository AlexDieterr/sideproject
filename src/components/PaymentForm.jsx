import { useState, useEffect } from "react";
import "../styles/PaymentForm.css";

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5001";

const PaymentForm = ({ ratingId, onSuccess }) => {
  console.log("📝 PaymentForm RENDERED with ratingId:", ratingId); // ✅ Check if PaymentForm appears

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handlePayment = async () => {
  console.log("🖱️ Pay Now button clicked!"); // ✅ Button Click Check
  if (!ratingId) {
    console.error("❌ No ratingId provided!");
    return;
  }

  setLoading(true);
  setError(null);

  try {
    console.log("🔍 Sending payment request for ratingId:", ratingId); // ✅ Logging ratingId before request

    const response = await fetch(`${API_BASE_URL}/api/pay`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ratingId }),
    });

    const data = await response.json();
    console.log("🎯 Response from backend:", data); // ✅ Log response

    if (response.ok && data.url) {
      console.log("✅ Redirecting to Stripe:", data.url);
      window.location.href = data.url;
    } else {
      throw new Error(data.error || "Failed to get Stripe URL");
    }
  } catch (err) {
    console.error("❌ Payment error:", err);
    setError("Payment error: " + err.message);
  }

  setLoading(false);
};

  return (
    <div className="payment-modal">
      <h3>Confirm Payment</h3>
      {error && <p className="error">{error}</p>}
      <button
        onClick={() => {
          console.log("🖱️ Button Clicked! Calling handlePayment");
          handlePayment();
        }}
        disabled={loading}
      >
        {loading ? "Processing..." : "Pay $0.99"}
      </button>
      <button onClick={() => onSuccess(null)} className="cancel-btn">
        Cancel
      </button>
    </div>
  );
};

export default PaymentForm;