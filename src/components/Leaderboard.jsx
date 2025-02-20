import { useState, useEffect } from "react";

const Leaderboard = () => {
  const [topRated, setTopRated] = useState([]);
  const [mostReviewed, setMostReviewed] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const topRatedRes = await fetch("http://localhost:5001/api/leaderboard/top-rated");
      const mostReviewedRes = await fetch("http://localhost:5001/api/leaderboard/most-reviewed");
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

      {loading ? <p>Loading...</p> : (
        <>
          <h3>⭐ Top Rated Girls</h3>
          <ul>
            {topRated.map((girl, index) => (
              <li key={index}>
                <strong>{girl.name}</strong> - Avg Rating: {girl.avgRating.toFixed(1)} ⭐
              </li>
            ))}
          </ul>

          <h3>📊 Most Reviewed Girls</h3>
          <ul>
            {mostReviewed.map((girl, index) => (
              <li key={index}>
                <strong>{girl.name}</strong> - {girl.reviewCount} Reviews
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
};

export default Leaderboard;