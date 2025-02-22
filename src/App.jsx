import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Success from "./pages/successTemp";
import Cancel from "./pages/Cancel";
import Legal from "./pages/Legal_temp";
import Leaderboard from "./pages/Leaderboard";
import Reviews from "./pages/Reviews";
import ReviewPage from "./pages/Reviewspage";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/success" element={<Success />} />
        <Route path="/cancel" element={<Cancel />} />
        <Route path="/legal" element={<Legal />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/reviews" element={<Reviews />} />
        <Route path="/reviews/:name" element={<ReviewPage />} /> {/* ✅ Added Route */}
      </Routes>
    </Router>
  );
};

export default App;