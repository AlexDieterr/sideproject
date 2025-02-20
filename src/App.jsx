import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Success from "./pages/success";
import Cancel from "./pages/Cancel";
import Legal from "./pages/Legal_temp";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/success" element={<Success />} />
        <Route path="/cancel" element={<Cancel />} />
        <Route path="/Legal" element={<Legal />} />
      </Routes>
    </Router>
  );
};

export default App;