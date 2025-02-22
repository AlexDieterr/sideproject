import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Success from "./pages/successTemp";
import Cancel from "./pages/Cancel";
import Legal from "./pages/Legal_temp";
import Leaderboard from "./pages/Leaderboard";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/success" element={<Success />} />
        <Route path="/cancel" element={<Cancel />} />
        <Route path="/legal" element={<Legal />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
      </Routes>
    </Router>
  );
};

export default App;