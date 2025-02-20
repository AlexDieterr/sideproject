import { Link } from "react-router-dom";

const Success = () => {
  return (
    <div className="container">
      <h2>Payment Successful 🎉</h2>
      <p>Your rating removal was successful!</p>
      <Link to="/">Go Back</Link>
    </div>
  );
};

export default Success;