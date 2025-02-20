import { useState, useEffect } from "react";

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL;

const Leaderboard = () => {
  const [topRated, setTopRated] = useState([]);
  const [mostReviewed, setMostReviewed] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const topRatedRes = await fetch(`${API_BASE_URL}/api/leaderboard/top-rated`);
      const mostReviewedRes = await fetch(`${API_BASE_URL}/api/leaderboard/most-reviewed`);

      if (!topRatedRes.ok || !mostReviewedRes.ok) {
        throw new Error("Failed to fetch leaderboards.");
      }

      const topRatedData = await topRatedRes.json();
      const mostReviewedData = await mostReviewedRes.json();
      
      setTopRated(topRatedData);
      setMostReviewed(mostReviewedData);
    } catch (error) {
      console.error("Error fetching leaderboards:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  return (
    <div>
      <h2>🏆 Leaderboards</h2>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          <h3>⭐ Top Rated Girls</h3>
          {topRated.length > 0 ? (
            <ul>
              {topRated.map((girl, index) => (
                <li key={index}>
                  <strong>{girl.name}</strong> - Avg Rating: {girl.avgRating.toFixed(1)} ⭐
                </li>
              ))}
            </ul>
          ) : (
            <p>No top-rated users yet.</p>
          )}

          <h3>📊 Most Reviewed Girls</h3>
          {mostReviewed.length > 0 ? (
            <ul>
              {mostReviewed.map((girl, index) => (
                <li key={index}>
                  <strong>{girl.name}</strong> - {girl.reviewCount} Reviews
                </li>
              ))}
            </ul>
          ) : (
            <p>No most-reviewed users yet.</p>
          )}
        </>
      )}
    </div>
  );
};

export default Leaderboard;