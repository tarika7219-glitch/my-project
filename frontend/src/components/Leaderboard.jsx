import React, { useState, useEffect } from 'react';
import '../styles/Leaderboard.css';
import { FiX, FiAward, FiTrendingUp } from 'react-icons/fi';
import { API_BASE_URL } from '../api';

function Leaderboard({ onClose, userRank }) {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/gamification/leaderboard?limit=20`);
      const data = await response.json();
      
      if (data.success) {
        setLeaderboard(data.leaderboard);
      }
    } catch (err) {
      console.error('Error fetching leaderboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const getMedalEmoji = (rank) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return '#️⃣';
  };

  const getRankColor = (rank) => {
    if (rank === 1) return '#ffd700'; // Gold
    if (rank === 2) return '#c0c0c0'; // Silver
    if (rank === 3) return '#cd7f32'; // Bronze
    return '#667eea';
  };

  return (
    <div className="leaderboard-overlay">
      <div className="leaderboard-modal">
        <button className="leaderboard-close" onClick={onClose}>
          <FiX />
        </button>

        <div className="leaderboard-header">
          <h2>🏆 Global Leaderboard</h2>
          <p>Top Interview Performers</p>
        </div>

        {loading ? (
          <div className="leaderboard-loading">
            <p>Loading leaderboard...</p>
          </div>
        ) : (
          <>
            {userRank && (
              <div className="your-rank-section">
                <div className="your-rank-title">Your Position</div>
                <div className="your-rank-card">
                  <div className="rank-position" style={{ color: getRankColor(userRank.rank) }}>
                    {getMedalEmoji(userRank.rank)} #{userRank.rank}
                  </div>
                  <div className="rank-info">
                    <p className="rank-username">{userRank.username}</p>
                    <div className="rank-stats">
                      <span>📝 {userRank.total_interviews} interviews</span>
                      <span>⭐ {userRank.average_score}/10 avg</span>
                      <span>📈 Level {userRank.confidence_level}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="leaderboard-list">
              {leaderboard.map((entry) => (
                <div key={entry.rank} className="leaderboard-entry">
                  <div className="entry-rank" style={{ color: getRankColor(entry.rank) }}>
                    <span className="rank-medal">{getMedalEmoji(entry.rank)}</span>
                    <span className="rank-number">#{entry.rank}</span>
                  </div>

                  <div className="entry-info">
                    <p className="entry-username">{entry.username}</p>
                    <div className="entry-stats">
                      <span className="stat-badge">
                        📝 {entry.total_interviews}
                      </span>
                      <span className="stat-badge">
                        ⭐ {entry.average_score}
                      </span>
                      <span className="stat-badge">
                        📈 {entry.confidence_level}
                      </span>
                      {entry.interview_streak > 0 && (
                        <span className="stat-badge streak">
                          🔥 {entry.interview_streak}
                        </span>
                      )}
                      {entry.badge_count > 0 && (
                        <span className="stat-badge badges">
                          🏅 {entry.badge_count}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="entry-score" style={{ color: getRankColor(entry.rank) }}>
                    <span className="score-label">Score</span>
                    <span className="score-value">{entry.average_score}</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Leaderboard;

