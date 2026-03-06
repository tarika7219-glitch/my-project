import React, { useState } from 'react';
import '../styles/InterviewQuestions.css';
import { FiX, FiDownload, FiChevronDown, FiMic } from 'react-icons/fi';
import InteractiveInterviewPractice from './InteractiveInterviewPractice';

function InterviewQuestions({ questions, onClose }) {
  const [expandedQuestions, setExpandedQuestions] = useState({});
  const [showPracticeMode, setShowPracticeMode] = useState(false);

  if (!questions) return null;

  if (showPracticeMode) {
    return (
      <InteractiveInterviewPractice
        questions={questions}
        onClose={() => setShowPracticeMode(false)}
      />
    );
  }

  const technicalQuestions = questions.technical_questions || [];
  const behavioralQuestions = questions.behavioral_questions || [];
  const roleBasedQuestions = questions.role_based_questions || [];

  const toggleQuestion = (category, index) => {
    const key = `${category}-${index}`;
    setExpandedQuestions(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const downloadQuestions = () => {
    let text = `INTERVIEW PREPARATION QUESTIONS\n`;
    text += `${'='.repeat(60)}\n\n`;

    if (technicalQuestions.length > 0) {
      text += `TECHNICAL QUESTIONS\n`;
      text += `${'-'.repeat(60)}\n\n`;
      technicalQuestions.forEach((q, index) => {
        text += `${index + 1}. ${q.question}\n`;
        text += `Focus Area: ${q.focus_area}\n`;
        text += `Tips: ${q.tips}\n\n`;
      });
      text += `\n`;
    }

    if (behavioralQuestions.length > 0) {
      text += `BEHAVIORAL QUESTIONS\n`;
      text += `${'-'.repeat(60)}\n\n`;
      behavioralQuestions.forEach((q, index) => {
        text += `${index + 1}. ${q.question}\n`;
        text += `Situation: ${q.situation}\n`;
        text += `Tips: ${q.tips}\n\n`;
      });
      text += `\n`;
    }

    if (roleBasedQuestions.length > 0) {
      text += `ROLE-BASED QUESTIONS\n`;
      text += `${'-'.repeat(60)}\n\n`;
      roleBasedQuestions.forEach((q, index) => {
        text += `${index + 1}. ${q.question}\n`;
        text += `Role Context: ${q.role_context}\n`;
        text += `Tips: ${q.tips}\n\n`;
      });
    }

    text += `\n${'-'.repeat(60)}\n`;
    text += `Interview Preparation Tips:\n`;
    text += `- Practice your answers out loud\n`;
    text += `- Research the company thoroughly\n`;
    text += `- Use the STAR method for behavioral questions\n`;
    text += `- Have concrete examples ready\n`;
    text += `- Ask thoughtful questions at the end\n`;

    const element = document.createElement('a');
    element.setAttribute(
      'href',
      'data:text/plain;charset=utf-8,' + encodeURIComponent(text)
    );
    element.setAttribute('download', 'Interview_Questions_Preparation.txt');
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const QuestionCard = ({ question, category, index }) => {
    const key = `${category}-${index}`;
    const isExpanded = expandedQuestions[key];
    let metadata, tipLabel;

    if (category === 'technical') {
      metadata = question.focus_area;
      tipLabel = 'Tips:';
    } else if (category === 'behavioral') {
      metadata = question.situation;
      tipLabel = 'Tips:';
    } else {
      metadata = question.role_context;
      tipLabel = 'Tips:';
    }

    return (
      <div className="question-card">
        <div
          className="question-header"
          onClick={() => toggleQuestion(category, index)}
        >
          <div className="question-number">Q{index + 1}</div>
          <div className="question-main">
            <p className="question-text">{question.question}</p>
            <p className="question-meta">{metadata}</p>
          </div>
          <FiChevronDown
            className={`chevron-icon ${isExpanded ? 'expanded' : ''}`}
          />
        </div>

        {isExpanded && (
          <div className="question-answer">
            <div className="answer-section">
              <h4>{tipLabel}</h4>
              <p>{question.tips}</p>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="interview-modal-overlay" onClick={onClose}>
      <div className="interview-modal" onClick={(e) => e.stopPropagation()}>
        <div className="interview-header">
          <div className="interview-title-section">
            <h2>🎤 Interview Preparation</h2>
            <p className="interview-subtitle">
              {technicalQuestions.length + behavioralQuestions.length + roleBasedQuestions.length} questions to prepare you for success
            </p>
          </div>
          <button className="close-btn" onClick={onClose}>
            <FiX />
          </button>
        </div>

        <div className="interview-content">
          {/* Overview */}
          <div className="interview-section">
            <h3>💡 How to Use This Guide</h3>
            <p>
              These interview questions are specifically tailored to your resume and the job description. 
              Practice answering each question out loud, and be ready to provide concrete examples from your experience.
            </p>
          </div>

          {/* Technical Questions */}
          {technicalQuestions.length > 0 && (
            <div className="interview-section">
              <div className="section-header">
                <h3>⚙️ Technical Questions</h3>
                <span className="question-count">{technicalQuestions.length} questions</span>
              </div>
              <p className="section-description">
                Questions focusing on technical skills, knowledge, and problem-solving abilities
              </p>
              <div className="questions-container">
                {technicalQuestions.map((q, index) => (
                  <QuestionCard
                    key={index}
                    question={q}
                    category="technical"
                    index={index}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Behavioral Questions */}
          {behavioralQuestions.length > 0 && (
            <div className="interview-section">
              <div className="section-header">
                <h3>👥 Behavioral Questions</h3>
                <span className="question-count">{behavioralQuestions.length} questions</span>
              </div>
              <p className="section-description">
                Questions about your work experience, teamwork, and how you handle challenges
              </p>
              <div className="questions-container">
                {behavioralQuestions.map((q, index) => (
                  <QuestionCard
                    key={index}
                    question={q}
                    category="behavioral"
                    index={index}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Role-Based Questions */}
          {roleBasedQuestions.length > 0 && (
            <div className="interview-section">
              <div className="section-header">
                <h3>🎯 Role-Based Questions</h3>
                <span className="question-count">{roleBasedQuestions.length} questions</span>
              </div>
              <p className="section-description">
                Questions specific to this role and company
              </p>
              <div className="questions-container">
                {roleBasedQuestions.map((q, index) => (
                  <QuestionCard
                    key={index}
                    question={q}
                    category="role-based"
                    index={index}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Interview Tips */}
          <div className="interview-section tips-section">
            <h3>✨ Interview Tips</h3>
            <div className="tips-grid">
              <div className="tip-card">
                <div className="tip-icon">🎯</div>
                <h4>Use the STAR Method</h4>
                <p>
                  Situation, Task, Action, Result - for behavioral questions
                </p>
              </div>
              <div className="tip-card">
                <div className="tip-icon">🔍</div>
                <h4>Research the Company</h4>
                <p>
                  Know their mission, values, and recent news
                </p>
              </div>
              <div className="tip-card">
                <div className="tip-icon">💬</div>
                <h4>Practice Out Loud</h4>
                <p>
                  Rehearse your answers to build confidence
                </p>
              </div>
              <div className="tip-card">
                <div className="tip-icon">❓</div>
                <h4>Ask Smart Questions</h4>
                <p>
                  Show genuine interest in the role and company
                </p>
              </div>
              <div className="tip-card">
                <div className="tip-icon">⏰</div>
                <h4>Manage Your Time</h4>
                <p>
                  Answer concisely and listen actively
                </p>
              </div>
              <div className="tip-card">
                <div className="tip-icon">😊</div>
                <h4>Show Your Personality</h4>
                <p>
                  Be authentic and enthusiastic about the opportunity
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="interview-footer">
          <button
            className="practice-mode-btn"
            onClick={() => setShowPracticeMode(true)}
          >
            <FiMic /> Start Practice Mode
          </button>
          <button
            className="download-questions-btn"
            onClick={downloadQuestions}
          >
            <FiDownload /> Download Questions
          </button>
          <button className="close-interview-btn" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default InterviewQuestions;
