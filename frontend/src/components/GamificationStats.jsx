import React, { useState, useEffect } from 'react';
import '../styles/GamificationStats.css';
import { FiTrendingUp, FiAward, FiZap, FiBarChart2, FiX } from 'react-icons/fi';
import { API_BASE_URL } from '../api';

function GamificationStats({ user, onLeaderboardClick }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedBadge, setSelectedBadge] = useState(null);

  useEffect(() => {
    fetchStats();
  }, [user]);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE_URL}/gamification/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (err) {
      console.error('Error fetching gamification stats:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return null;
  if (!stats) return null;

  const getStreakMessage = () => {
    if (stats.interview_streak === 0) return 'Start your streak!';
    if (stats.interview_streak === 1) return 'You\'re on fire! 🔥';
    if (stats.interview_streak >= 7) return 'Incredible streak! 🚀';
    if (stats.interview_streak >= 30) return 'Legendary streak! 👑';
    return `${stats.interview_streak} days strong`;
  };

  const getConfidenceColor = () => {
    if (stats.confidence_level <= 3) return '#ff6b6b';
    if (stats.confidence_level <= 6) return '#ffd93d';
    if (stats.confidence_level <= 9) return '#6bcf7f';
    return '#4ecdc4';
  };

  const getConfidenceLabel = () => {
    const level = stats.confidence_level;
    if (level <= 2) return 'Building Confidence';
    if (level <= 4) return 'Growing Stronger';
    if (level <= 6) return 'Confident';
    if (level <= 8) return 'Very Confident';
    if (level <= 9) return 'Highly Confident';
    return 'Expert Level';
  };

  return (
    <div className="gamification-container">
      {/* Streak Card */}
      <div className="stat-card streak-card">
        <div className="stat-icon">🔥</div>
        <div className="stat-content">
          <p className="stat-label">Interview Streak</p>
          <p className="stat-value">{stats.interview_streak}</p>
          <p className="stat-message">{getStreakMessage()}</p>
        </div>
      </div>

      {/* Confidence Level Card */}
      <div className="stat-card confidence-card">
        <div className="stat-icon">📈</div>
        <div className="stat-content">
          <p className="stat-label">Confidence Level</p>
          <div className="confidence-visual">
            <div className="confidence-level-bar">
              {Array.from({ length: 10 }).map((_, idx) => (
                <div
                  key={idx}
                  className={`confidence-segment ${idx < stats.confidence_level ? 'filled' : ''}`}
                  style={idx < stats.confidence_level ? { backgroundColor: getConfidenceColor() } : {}}
                />
              ))}
            </div>
            <p className="confidence-text">{stats.confidence_level}/10 - {getConfidenceLabel()}</p>
          </div>
        </div>
      </div>

      {/* Badges Card */}
      <div className="stat-card badges-card">
        <div className="stat-icon">🏆</div>
        <div className="stat-content">
          <p className="stat-label">Badges Earned</p>
          <p className="stat-value">{stats.badges?.length || 0}</p>
          {stats.badges && stats.badges.length > 0 && (
            <div className="badges-display">
              {stats.badges.slice(0, 4).map((badge, idx) => (
                <div 
                  key={idx} 
                  className="badge-item" 
                  title={badge.name}
                  onClick={() => setSelectedBadge(badge)}
                  style={{ cursor: 'pointer' }}
                >
                  <span className="badge-emoji">{badge.icon}</span>
                  <span className="badge-name">{badge.name}</span>
                </div>
              ))}
              {stats.badges.length > 4 && (
                <div className="badge-more">+{stats.badges.length - 4} more</div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Interviews & Stats Card */}
      <div className="stat-card stats-card">
        <div className="stat-icon">📊</div>
        <div className="stat-content">
          <p className="stat-label">Interview Stats</p>
          <div className="stats-grid">
            <div className="stats-item">
              <span className="stats-key">Total Interviews:</span>
              <span className="stats-val">{stats.total_interviews}</span>
            </div>
            <div className="stats-item">
              <span className="stats-key">Average Score:</span>
              <span className="stats-val">{stats.average_score.toFixed(2)}/10</span>
            </div>
          </div>
        </div>
      </div>

      {/* Leaderboard Button */}
      <button className="leaderboard-btn" onClick={onLeaderboardClick}>
        <FiBarChart2 /> View Global Leaderboard
      </button>

      {/* Badge Detail Modal */}
      {selectedBadge && (
        <div className="badge-modal-overlay" onClick={() => setSelectedBadge(null)}>
          <div className="badge-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedBadge(null)}>
              <FiX />
            </button>
            <div className="badge-modal-content">
              <div className="badge-modal-emoji">{selectedBadge.icon}</div>
              <h3>{selectedBadge.name}</h3>
              <p className="badge-description">{selectedBadge.description}</p>
              {selectedBadge.unlock_date && (
                <p className="badge-unlock-date">
                  🎉 Unlocked on {new Date(selectedBadge.unlock_date).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default GamificationStats;

