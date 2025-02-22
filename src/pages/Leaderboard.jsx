import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Leaderboard.css";

// ✅ Use Vite's Environment Variable System
const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5001";

const Leaderboard = () => {
  const [bestNames, setBestNames] = useState([]);
  const [worstNames, setWorstNames] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/reviews`);
        if (!response.ok) throw new Error("Failed to fetch reviews.");
        const data = await response.json();

        // ✅ Group ratings by name
        const ratingsMap = {};
        data.forEach((review) => {
          if (!ratingsMap[review.name]) {
            ratingsMap[review.name] = { total: 0, count: 0 };
          }
          ratingsMap[review.name].total += review.rating;
          ratingsMap[review.name].count += 1;
        });

        // ✅ Compute average ratings
        const nameRatings = Object.entries(ratingsMap).map(([name, { total, count }]) => ({
          name,
          average: total / count,
        }));

        // ✅ Sort names for leaderboards
        const sortedByBest = [...nameRatings].sort((a, b) => b.average - a.average).slice(0, 100);
        const sortedByWorst = [...nameRatings].sort((a, b) => a.average - b.average).slice(0, 100);

        setBestNames(sortedByBest);
        setWorstNames(sortedByWorst);
      } catch (error) {
        console.error("Error fetching leaderboard:", error);
      }
    };

    fetchLeaderboard();
  }, []);

  // ✅ Function to get color based on rating
  const getColor = (rating) => {
    if (rating >= 7.5) return "green";
    if (rating >= 4) return "yellow";
    return "red";
  };

  return (
    <div className="leaderboard-container">
      <h1 className="leaderboard-title">👑 LEADERBOARDS 👑</h1>
      <div className="leaderboard-columns">
        {/* Left Column - Worst */}
        <div className="leaderboard-section">
          <h2>TOP 100 Worst</h2>
          <ul>
            {worstNames.map((entry, index) => (
              <li
                key={entry.name}
                onClick={() => navigate(`/reviews/${encodeURIComponent(entry.name)}`)}
                className="leaderboard-item"
                style={{ backgroundColor: getColor(entry.average) }} // ✅ Dynamic color
              >
                #{index + 1} {entry.name} ({entry.average.toFixed(1)}/10)
              </li>
            ))}
          </ul>
        </div>

        {/* Right Column - Best */}
        <div className="leaderboard-section">
          <h2>TOP 100 Best</h2>
          <ul>
            {bestNames.map((entry, index) => (
              <li
                key={entry.name}
                onClick={() => navigate(`/reviews/${encodeURIComponent(entry.name)}`)}
                className="leaderboard-item"
                style={{ backgroundColor: getColor(entry.average) }} // ✅ Dynamic color
              >
                #{index + 1} {entry.name} ({entry.average.toFixed(1)}/10)
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;