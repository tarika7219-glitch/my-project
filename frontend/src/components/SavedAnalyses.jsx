import React, { useMemo, useState } from 'react';
import '../styles/SavedAnalyses.css';
import { FiClock, FiTrash2, FiUploadCloud } from 'react-icons/fi';

function SavedAnalyses({ analyses, isLoading, onLoad, onDelete }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [minMatch, setMinMatch] = useState('');
  const [maxMatch, setMaxMatch] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const history = Array.isArray(analyses) ? analyses : [];

  const formatDate = (isoDate) => {
    if (!isoDate) return 'Unknown date';
    const date = new Date(isoDate);
    if (Number.isNaN(date.getTime())) return 'Unknown date';
    return date.toLocaleString();
  };

  const getMatchScore = (session) => {
    const raw = session?.analysis_data?.match_percentage;
    const numeric = Number(raw);
    return Number.isFinite(numeric) ? numeric : null;
  };

  const filteredHistory = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    const hasMin = minMatch !== '';
    const hasMax = maxMatch !== '';
    const minValue = hasMin ? Number(minMatch) : null;
    const maxValue = hasMax ? Number(maxMatch) : null;

    let list = history.filter((session) => {
      const title = (session.title || '').toLowerCase();
      const resumeName = (session.resume_filename || '').toLowerCase();
      const jobName = (session.job_description_filename || '').toLowerCase();
      const match = getMatchScore(session);

      const matchesSearch =
        !query ||
        title.includes(query) ||
        resumeName.includes(query) ||
        jobName.includes(query);

      let matchesRange = true;
      if (hasMin || hasMax) {
        if (match === null) {
          matchesRange = false;
        } else {
          if (hasMin && Number.isFinite(minValue)) {
            matchesRange = matchesRange && match >= minValue;
          }
          if (hasMax && Number.isFinite(maxValue)) {
            matchesRange = matchesRange && match <= maxValue;
          }
        }
      }

      return matchesSearch && matchesRange;
    });

    list.sort((a, b) => {
      const dateA = new Date(a.created_at).getTime() || 0;
      const dateB = new Date(b.created_at).getTime() || 0;
      const matchA = getMatchScore(a);
      const matchB = getMatchScore(b);

      if (sortBy === 'oldest') return dateA - dateB;
      if (sortBy === 'highest_match') return (matchB ?? -1) - (matchA ?? -1);
      if (sortBy === 'lowest_match') return (matchA ?? 101) - (matchB ?? 101);
      return dateB - dateA;
    });

    return list;
  }, [history, searchTerm, minMatch, maxMatch, sortBy]);

  const clearFilters = () => {
    setSearchTerm('');
    setMinMatch('');
    setMaxMatch('');
    setSortBy('newest');
  };

  return (
    <div className="saved-analyses">
      <div className="saved-analyses-header">
        <h2>Saved Analysis History</h2>
        <p>Reload previous analyses anytime.</p>
      </div>

      <div className="saved-analyses-controls">
        <input
          type="text"
          className="saved-control-input search-input"
          placeholder="Search by title or file name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <input
          type="number"
          className="saved-control-input match-input"
          min="0"
          max="100"
          placeholder="Min %"
          value={minMatch}
          onChange={(e) => setMinMatch(e.target.value)}
        />
        <input
          type="number"
          className="saved-control-input match-input"
          min="0"
          max="100"
          placeholder="Max %"
          value={maxMatch}
          onChange={(e) => setMaxMatch(e.target.value)}
        />
        <select
          className="saved-control-select"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="highest_match">Highest Match</option>
          <option value="lowest_match">Lowest Match</option>
        </select>
        <button className="saved-clear-btn" onClick={clearFilters}>
          Clear
        </button>
      </div>

      {isLoading ? (
        <div className="saved-analyses-empty">Loading saved analyses...</div>
      ) : history.length === 0 ? (
        <div className="saved-analyses-empty">No saved analyses yet.</div>
      ) : filteredHistory.length === 0 ? (
        <div className="saved-analyses-empty">No analyses match these filters.</div>
      ) : (
        <div className="saved-analyses-list">
          {filteredHistory.map((session) => {
            const title = session.title || `${session.resume_filename || 'Resume'} vs ${session.job_description_filename || 'Job Description'}`;
            const match = getMatchScore(session);

            return (
              <div key={session.id} className="saved-analysis-card">
                <div className="saved-analysis-main">
                  <h3>{title}</h3>
                  <div className="saved-analysis-meta">
                    <span><FiClock /> {formatDate(session.created_at)}</span>
                    {typeof match === 'number' && <span>Match: {match}%</span>}
                  </div>
                </div>

                <div className="saved-analysis-actions">
                  <button
                    className="saved-load-btn"
                    onClick={() => onLoad(session)}
                  >
                    <FiUploadCloud /> Load
                  </button>
                  <button
                    className="saved-delete-btn"
                    onClick={() => onDelete(session.id)}
                  >
                    <FiTrash2 /> Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default SavedAnalyses;
