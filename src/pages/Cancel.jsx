import { Link } from "react-router-dom";

const Cancel = () => {
  return (
    <div className="container">
      <h2>Payment Canceled ❌</h2>
      <p>You have canceled your payment.</p>
      <Link to="/">Go Back</Link>
    </div>
  );
};

export default Cancel;