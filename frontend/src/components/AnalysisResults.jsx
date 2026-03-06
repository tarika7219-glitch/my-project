import React, { useState } from 'react';
import '../styles/AnalysisResults.css';
import { FiCheckCircle, FiAlertCircle, FiTrendingUp, FiZap, FiDownload, FiCompass, FiMic, FiEdit3 } from 'react-icons/fi';
import LearningRoadmap from './LearningRoadmap';
import InterviewQuestions from './InterviewQuestions';
import ResumeBulletRewriter from './ResumeBulletRewriter';
import { API_BASE_URL } from '../api';

function AnalysisResults({ analysis, resumeText = '', jobDescriptionText = '' }) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [showRoadmap, setShowRoadmap] = useState(false);
  const [roadmapData, setRoadmapData] = useState(null);
  const [loadingRoadmap, setLoadingRoadmap] = useState(false);
  const [showInterviewQuestions, setShowInterviewQuestions] = useState(false);
  const [interviewQuestionsData, setInterviewQuestionsData] = useState(null);
  const [loadingInterview, setLoadingInterview] = useState(false);
  const [showBulletRewriter, setShowBulletRewriter] = useState(false);
  
  if (!analysis) return null;

  const {
    matching_skills = [],
    missing_skills = [],
    skills_to_learn = [],
    match_percentage = 0,
    summary = '',
    resume_improvements = {}
  } = analysis;

  const {
    quantified_achievements = [],
    summary_section = '',
    keywords = [],
    ats_compatibility = ''
  } = resume_improvements;

  const handleDownloadPDF = async () => {
    setIsDownloading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/download-report`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(analysis),
      });

      if (!response.ok) {
        throw new Error('Failed to download report');
      }

      // Get the PDF blob
      const blob = await response.blob();
      
      // Create a temporary URL and download
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'Resume_Analysis_Report.pdf');
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading report:', error);
      alert('Failed to download report. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleGenerateRoadmap = async () => {
    setLoadingRoadmap(true);
    try {
      const response = await fetch(`${API_BASE_URL}/generate-roadmap`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          missing_skills,
          skills_to_learn,
          match_percentage,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate roadmap');
      }

      const data = await response.json();
      if (data.roadmap) {
        setRoadmapData(data.roadmap);
        setShowRoadmap(true);
      } else {
        alert('Failed to generate roadmap. Please try again.');
      }
    } catch (error) {
      console.error('Error generating roadmap:', error);
      alert('Failed to generate learning roadmap. Please try again.');
    } finally {
      setLoadingRoadmap(false);
    }
  };

  const handleGenerateInterviewQuestions = async () => {
    setLoadingInterview(true);
    try {
      const response = await fetch(`${API_BASE_URL}/generate-interview-questions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          resume_text: resumeText,
          job_description: jobDescriptionText,
          missing_skills,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate interview questions');
      }

      const data = await response.json();
      if (data.questions) {
        setInterviewQuestionsData(data.questions);
        setShowInterviewQuestions(true);
      } else {
        alert('Failed to generate interview questions. Please try again.');
      }
    } catch (error) {
      console.error('Error generating interview questions:', error);
      alert('Failed to generate interview questions. Please try again.');
    } finally {
      setLoadingInterview(false);
    }
  };

  return (
    <div className="analysis-results">
      <div className="report-header">
        <h2>📊 Analysis Results</h2>
        <div className="header-buttons">
          <button
            onClick={handleGenerateInterviewQuestions}
            disabled={loadingInterview}
            className="interview-btn"
            title="Generate interview questions"
          >
            <FiMic />
            {loadingInterview ? 'Generating...' : 'Interview Questions'}
          </button>
          <button
            onClick={handleGenerateRoadmap}
            disabled={loadingRoadmap}
            className="roadmap-btn"
            title="Generate week-by-week learning roadmap"
          >
            <FiCompass />
            {loadingRoadmap ? 'Generating...' : 'Generate Roadmap'}
          </button>
          <button
            onClick={() => setShowBulletRewriter(true)}
            className="rewrite-btn"
            title="Rewrite resume bullets with impact"
          >
            <FiEdit3 />
            Rewrite Bullets
          </button>
          <button
            onClick={handleDownloadPDF}
            disabled={isDownloading}
            className="download-btn"
            title="Download analysis report as PDF"
          >
            <FiDownload />
            {isDownloading ? 'Downloading...' : 'Download Report'}
          </button>
        </div>
      </div>
      <div className="match-score-container">
        <div className="match-score">
          <h2>Match Score</h2>
          <div className="percentage-circle">
            <svg viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="45" className="bg-circle" />
              <circle
                cx="50"
                cy="50"
                r="45"
                className="progress-circle"
                style={{
                  strokeDasharray: `${match_percentage * 2.827} 282.7`,
                }}
              />
            </svg>
            <div className="percentage-text">{match_percentage}%</div>
          </div>
        </div>
      </div>

      {summary && (
        <div className="summary-section">
          <h3>Summary</h3>
          <p>{summary}</p>
        </div>
      )}

      <div className="skills-grid">
        {matching_skills.length > 0 && (
          <div className="skills-card matching">
            <div className="card-header">
              <FiCheckCircle className="card-icon" />
              <h3>Matching Skills ({matching_skills.length})</h3>
            </div>
            <div className="skills-list">
              {matching_skills.map((skill, index) => (
                <span key={index} className="skill-tag matching-tag">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {missing_skills.length > 0 && (
          <div className="skills-card missing">
            <div className="card-header">
              <FiAlertCircle className="card-icon" />
              <h3>Missing Skills ({missing_skills.length})</h3>
            </div>
            <div className="skills-list">
              {missing_skills.map((skill, index) => (
                <span key={index} className="skill-tag missing-tag">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {skills_to_learn.length > 0 && (
          <div className="skills-card to-learn">
            <div className="card-header">
              <FiTrendingUp className="card-icon" />
              <h3>Skills to Learn (Prioritized)</h3>
            </div>
            <div className="skills-list">
              {skills_to_learn.map((skill, index) => (
                <div key={index} className="priority-skill">
                  <span className="priority-number">{index + 1}</span>
                  <span className="skill-tag to-learn-tag">{skill}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {(quantified_achievements.length > 0 || summary_section || keywords.length > 0 || ats_compatibility) && (
        <div className="improvements-section">
          <div className="improvements-header">
            <FiZap className="improvements-icon" />
            <h2>How To Improve Your Resume</h2>
          </div>

          {quantified_achievements.length > 0 && (
            <div className="improvement-card achievements-card">
              <h3>📊 Add Quantified Achievements</h3>
              <ul className="improvements-list">
                {quantified_achievements.map((achievement, index) => (
                  <li key={index}>{achievement}</li>
                ))}
              </ul>
            </div>
          )}

          {summary_section && (
            <div className="improvement-card summary-card">
              <h3>✍️ Improve Your Summary Section</h3>
              <p className="improvement-text">{summary_section}</p>
            </div>
          )}

          {keywords.length > 0 && (
            <div className="improvement-card keywords-card">
              <h3>🔑 Add Missing Tech Keywords</h3>
              <div className="keywords-container">
                {keywords.map((keyword, index) => (
                  <span key={index} className="keyword-badge">{keyword}</span>
                ))}
              </div>
            </div>
          )}

          {ats_compatibility && (
            <div className="improvement-card ats-card">
              <h3>🤖 Improve ATS Compatibility</h3>
              <p className="improvement-text">{ats_compatibility}</p>
            </div>
          )}
        </div>
      )}

      {showRoadmap && roadmapData && (
        <LearningRoadmap
          roadmap={roadmapData}
          onClose={() => setShowRoadmap(false)}
        />
      )}

      {showInterviewQuestions && interviewQuestionsData && (
        <InterviewQuestions
          questions={interviewQuestionsData}
          onClose={() => setShowInterviewQuestions(false)}
        />
      )}

      {showBulletRewriter && (
        <ResumeBulletRewriter
          onClose={() => setShowBulletRewriter(false)}
          jobDescriptionText={jobDescriptionText}
        />
      )}
    </div>
  );
}

export default AnalysisResults;

