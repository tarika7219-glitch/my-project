

import React, { useState, useEffect } from 'react';
import '../styles/LearningRoadmap.css';
import { FiX, FiDownload, FiCheckCircle } from 'react-icons/fi';

function LearningRoadmap({ roadmap, onClose }) {
  const [expandedWeek, setExpandedWeek] = useState(0);
  const [completedTopics, setCompletedTopics] = useState({});
  const [overallCompletion, setOverallCompletion] = useState(0);

  // Initialize from localStorage on component mount
  useEffect(() => {
    const storageKey = `roadmap_progress_${roadmap?.title?.replace(/\s+/g, '_')}`;
    const savedProgress = localStorage.getItem(storageKey);
    if (savedProgress) {
      try {
        setCompletedTopics(JSON.parse(savedProgress));
      } catch (e) {
        console.error('Error loading progress:', e);
      }
    }
  }, [roadmap?.title]);

  // Calculate completion percentage whenever completedTopics changes
  useEffect(() => {
    const weeks = Array.isArray(roadmap?.weeks) ? roadmap.weeks : [];
    let totalTopics = 0;
    let completedCount = 0;

    weeks.forEach((week, weekIndex) => {
      const topics = week.topics || [];
      totalTopics += topics.length;
      
      topics.forEach((_, topicIndex) => {
        const key = `${weekIndex}-${topicIndex}`;
        if (completedTopics[key]) {
          completedCount++;
        }
      });
    });

    const completion = totalTopics > 0 ? Math.round((completedCount / totalTopics) * 100) : 0;
    setOverallCompletion(completion);
  }, [completedTopics, roadmap?.weeks]);

  // Safe array handling
  const weeks = Array.isArray(roadmap?.weeks) ? roadmap.weeks : [];
  const projects = Array.isArray(roadmap?.projects) ? roadmap.projects : [];
  const milestones = Array.isArray(roadmap?.milestones) ? roadmap.milestones : [];

  const downloadRoadmapAsText = () => {
    let text = `${roadmap.title || 'Learning Roadmap'}\n`;
    text += `Duration: ${roadmap.duration_weeks || 0} weeks\n`;
    text += `${roadmap.overview || ''}\n\n`;

    text += `WEEKLY BREAKDOWN\n`;
    text += `${'='.repeat(60)}\n\n`;

    weeks.forEach((week) => {
      text += `WEEK ${week.week || ''}: ${week.title || ''}\n`;
      text += `Topics: ${(week.topics || []).join(' • ')}\n`;
      text += `Time Commitment: ${week.time_commitment || ''}\n`;
      text += `What You'll Learn:\n`;

      (week.learnings || []).forEach((learning) => {
        text += `  • ${learning}\n`;
      });

      text += `Resources:\n`;
      (week.resources || []).forEach((resource) => {
        text += `  • ${resource}\n`;
      });

      text += `\n`;
    });

    if (projects.length > 0) {
      text += `\nPROJECTS\n`;
      text += `${'='.repeat(60)}\n\n`;

      projects.forEach((project) => {
        text += `${project.name || ''}\n`;
        text += `${project.description || ''}\n`;
        text += `Skills: ${(project.skills_practiced || []).join(', ')}\n`;
        text += `Timeline: ${project.timeline || ''}\n\n`;
      });
    }

    if (milestones.length > 0) {
      text += `\nMILESTONES\n`;
      text += `${'='.repeat(60)}\n\n`;

      milestones.forEach((milestone) => {
        text += `Week ${milestone.week || ''}: ${milestone.milestone || ''}\n`;
      });
    }

    text += `\nExpected Final Match: ${roadmap.estimated_final_match || ''}\n`;

    const element = document.createElement('a');
    element.setAttribute(
      'href',
      'data:text/plain;charset=utf-8,' + encodeURIComponent(text)
    );
    element.setAttribute('download', 'Learning_Roadmap.txt');
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // Handle topic checkbox change
  const handleTopicToggle = (weekIndex, topicIndex) => {
    const key = `${weekIndex}-${topicIndex}`;
    const updated = { ...completedTopics };
    
    if (updated[key]) {
      delete updated[key];
    } else {
      updated[key] = true;
    }
    
    setCompletedTopics(updated);
    
    // Save to localStorage
    const storageKey = `roadmap_progress_${roadmap.title.replace(/\s+/g, '_')}`;
    localStorage.setItem(storageKey, JSON.stringify(updated));
  };

  // Calculate completion percentage for a specific week
  const getWeekCompletion = (weekIndex) => {
    const week = weeks[weekIndex];
    const topics = week?.topics || [];
    
    if (topics.length === 0) return 0;
    
    let completed = 0;
    topics.forEach((_, topicIndex) => {
      const key = `${weekIndex}-${topicIndex}`;
      if (completedTopics[key]) {
        completed++;
      }
    });
    
    return Math.round((completed / topics.length) * 100);
  };

  // Clear all progress
  const handleClearProgress = () => {
    if (window.confirm('Are you sure you want to clear all your progress?')) {
      setCompletedTopics({});
      const storageKey = `roadmap_progress_${roadmap.title.replace(/\s+/g, '_')}`;
      localStorage.removeItem(storageKey);
    }
  };

  return (
    <div className="roadmap-modal-overlay" onClick={onClose}>
      <div className="roadmap-modal" onClick={(e) => e.stopPropagation()}>
        <div className="roadmap-header">
          <div className="roadmap-title-section">
            <h2>{roadmap.title || 'Learning Roadmap'}</h2>
            <p className="roadmap-subtitle">
              {roadmap.duration_weeks || 0} weeks to reach{' '}
              {roadmap.estimated_final_match || 'your goal'}
            </p>
            <div className="overall-progress">
              <div className="progress-bar-container">
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${overallCompletion}%` }}
                  />
                </div>
              </div>
              <span className="completion-text">{overallCompletion}% Complete</span>
            </div>
          </div>
          <button className="close-btn" onClick={onClose}>
            <FiX />
          </button>
        </div>

        <div className="roadmap-content">
          {/* Overview */}
          <div className="roadmap-section">
            <h3>📋 Overview</h3>
            <p>{roadmap.overview || 'No overview available.'}</p>
          </div>

          {/* Weekly Breakdown */}
          <div className="roadmap-section">
            <h3>📅 Weekly Breakdown</h3>
            <div className="weeks-container">
              {weeks.map((week, index) => (
                <div
                  key={index}
                  className={`week-card ${expandedWeek === index ? 'expanded' : ''}`}
                >
                  <div
                    className="week-header"
                    onClick={() =>
                      setExpandedWeek(expandedWeek === index ? -1 : index)
                    }
                  >
                    <div className="week-info">
                      <div className="week-number">
                        Week {week.week || index + 1}
                      </div>
                      <h4>{week.title || 'Untitled Week'}</h4>
                    </div>
                    <div className="week-meta">
                      <span className="time-badge">
                        {week.time_commitment || 'N/A'}
                      </span>
                      <span className="topics-count">
                        {week.topics?.length || 0} topics
                      </span>
                    </div>
                  </div>

                  {/* Weekly Progress Bar */}
                  <div className="week-progress-bar-container">
                    <div className="week-progress-bar">
                      <div 
                        className="week-progress-fill" 
                        style={{ width: `${getWeekCompletion(index)}%` }}
                      />
                    </div>
                    <span className="week-progress-text">{getWeekCompletion(index)}%</span>
                  </div>

                  {expandedWeek === index && (
                    <div className="week-details">
                      <div className="detail-section">
                        <h5>Topics</h5>
                        <ul className="topics-list">
                          {week.topics?.map((topic, i) => {
                            const topicKey = `${index}-${i}`;
                            const isCompleted = completedTopics[topicKey];
                            return (
                              <li key={i} className={isCompleted ? 'completed' : ''}>
                                <input
                                  type="checkbox"
                                  checked={isCompleted || false}
                                  onChange={() => handleTopicToggle(index, i)}
                                  className="topic-checkbox"
                                />
                                <span className="topic-text">{topic}</span>
                              </li>
                            );
                          })}
                        </ul>
                      </div>

                      <div className="detail-section">
                        <h5>What You'll Learn</h5>
                        <ul className="learnings-list">
                          {week.learnings?.map((learning, i) => (
                            <li key={i}>
                              <FiCheckCircle /> {learning}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="detail-section">
                        <h5>Resources</h5>
                        <ul className="resources-list">
                          {week.resources?.map((resource, i) => (
                            <li key={i}>📚 {resource}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Projects */}
          {projects.length > 0 && (
            <div className="roadmap-section">
              <h3>🚀 Hands-On Projects</h3>
              <div className="projects-grid">
                {projects.map((project, index) => (
                  <div key={index} className="project-card">
                    <h4>{project.name || 'Project'}</h4>
                    <p>{project.description || ''}</p>
                    <div className="skills-badge">
                      {project.skills_practiced?.map((skill, i) => (
                        <span key={i} className="skill-tag">
                          {skill}
                        </span>
                      ))}
                    </div>
                    <p className="project-timeline">
                      📅 {project.timeline || ''}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Milestones */}
          {milestones.length > 0 && (
            <div className="roadmap-section">
              <h3>🏆 Key Milestones</h3>
              {milestones.map((milestone, index) => (
                <p key={index}>
                  Week {milestone.week || ''}: {milestone.milestone || ''}
                </p>
              ))}
            </div>
          )}

          {/* Summary */}
          <div className="roadmap-section summary-section">
            <h3>✨ Expected Outcome</h3>
            <p>
              Improve your match percentage to{' '}
              <strong>{roadmap.estimated_final_match || ''}</strong> within{' '}
              <strong>{roadmap.duration_weeks || 0} weeks</strong>.
            </p>
          </div>
        </div>

        <div className="roadmap-footer">
          <button
            className="clear-progress-btn"
            onClick={handleClearProgress}
          >
            🔄 Clear Progress
          </button>
          <button
            className="download-roadmap-btn"
            onClick={downloadRoadmapAsText}
          >
            <FiDownload /> Download Roadmap
          </button>
          <button className="close-roadmap-btn" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default LearningRoadmap;