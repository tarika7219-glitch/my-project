import React, { useState, useEffect, useRef } from 'react';
import '../styles/InteractiveInterviewPractice.css';
import { FiX, FiMic, FiStopCircle, FiChevronRight } from 'react-icons/fi';
import { API_BASE_URL } from '../api';

function InteractiveInterviewPractice({ questions, onClose }) {
  const [selectedCount, setSelectedCount] = useState(null);
  const [practiceStarted, setPracticeStarted] = useState(false);

  const [practiceQuestions, setPracticeQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [transcript, setTranscript] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [allAnswers, setAllAnswers] = useState([]);
  const [isComplete, setIsComplete] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const recognitionRef = useRef(null);
  const synthesisRef = useRef(null);
  const timerRef = useRef(null);

  // Initialize speech APIs
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Speech Recognition not supported. Please use Chrome, Edge, or Safari.');
      onClose();
      return;
    }

    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = true;
    recognitionRef.current.lang = 'en-US';

    recognitionRef.current.onstart = () => {
      console.log('Recording started - listening for speech');
      setIsRecording(true);
    };

    recognitionRef.current.onresult = (event) => {
      let finalText = '';
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalText += transcript + ' ';
        }
      }
      
      if (finalText) {
        setTranscript((prev) => prev + finalText);
      }
    };

    recognitionRef.current.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsRecording(false);
      
      let errorMessage = 'Error: ';
      switch(event.error) {
        case 'no-speech':
          errorMessage += 'No speech detected. Please try again.';
          break;
        case 'audio-capture':
          errorMessage += 'No microphone found. Please check your audio input.';
          break;
        case 'not-allowed':
          errorMessage += 'Microphone permission denied. Please allow microphone access.';
          break;
        case 'network':
          errorMessage += 'Network error. Please check your connection.';
          break;
        default:
          errorMessage += event.error;
      }
      alert(errorMessage);
    };

    recognitionRef.current.onend = () => {
      setIsRecording(false);
    };

    synthesisRef.current = window.speechSynthesis;

    return () => {
      if (recognitionRef.current) recognitionRef.current.abort();
      if (synthesisRef.current) synthesisRef.current.cancel();
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [onClose]);

  // Helper function to save interview history
  const saveInterviewHistory = async (avgRating, categoryAverages, questionCount) => {
    const authToken = localStorage.getItem('auth_token');
    
    // If user is logged in, save to backend
    if (authToken) {
      try {
        const response = await fetch(`${API_BASE_URL}/interview/save-session`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
          },
          body: JSON.stringify({
            question_count: questionCount,
            average_rating: parseFloat(avgRating),
            category_stats: categoryAverages,
            session_data: allAnswers
          })
        });

        if (response.ok) {
          const data = await response.json();
          console.log('Session saved to backend:', data);
        }
      } catch (error) {
        console.error('Error saving session to backend:', error);
        // Fall back to localStorage if backend fails
        saveToLocalStorage(avgRating, categoryAverages, questionCount);
      }
    } else {
      // Save to localStorage if not logged in
      saveToLocalStorage(avgRating, categoryAverages, questionCount);
    }
  };

  // Helper function for localStorage backup
  const saveToLocalStorage = (avgRating, categoryAverages, questionCount) => {
    const history = localStorage.getItem('interviewHistory');
    const parsed = history ? JSON.parse(history) : [];
    
    parsed.push({
      date: new Date().toLocaleString(),
      rating: parseFloat(avgRating),
      questionCount: questionCount,
      categories: categoryAverages,
    });
    
    // Keep only last 10 sessions
    if (parsed.length > 10) {
      parsed.shift();
    }
    
    localStorage.setItem('interviewHistory', JSON.stringify(parsed));
    return parsed;
  };

  // Timer effect
  useEffect(() => {
    if (isRecording && timeLeft > 0) {
      timerRef.current = setTimeout(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (isRecording && timeLeft === 0) {
      stopRecordingAndSubmit();
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isRecording, timeLeft]);

  const getAllQuestions = () => {
    const all = [
      ...(questions?.technical_questions || []).map(q => ({ ...q, category: 'Technical' })),
      ...(questions?.behavioral_questions || []).map(q => ({ ...q, category: 'Behavioral' })),
      ...(questions?.role_based_questions || []).map(q => ({ ...q, category: 'Role-Based' })),
    ];
    return all;
  };

  const handleStartPractice = (count) => {
    const allQs = getAllQuestions();
    const shuffled = allQs.sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, Math.min(count, allQs.length));

    setSelectedCount(count);
    setPracticeQuestions(selected);
    setPracticeStarted(true);
    setCurrentIndex(0);

    setTimeout(() => {
      speakQuestion(selected[0]);
    }, 500);
  };

  const speakQuestion = (question) => {
    if (!synthesisRef.current) return;

    const text = question?.question || question;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    synthesisRef.current.speak(utterance);
  };

  const startRecording = () => {
    if (!recognitionRef.current) {
      alert('Speech Recognition not initialized. Please refresh the page.');
      return;
    }

    try {
      setTranscript('');
      setTimeLeft(60);
      setFeedback(null);
      setIsRecording(true);
      console.log('Starting speech recognition...');
      recognitionRef.current.start();
    } catch (error) {
      console.error('Error starting recording:', error);
      alert('Failed to start recording. Please check your microphone permissions.');
      setIsRecording(false);
    }
  };

  const stopRecordingAndSubmit = async () => {
    if (!recognitionRef.current) return;

    recognitionRef.current.stop();
    setIsRecording(false);

    await submitAnswer();
  };

  const submitAnswer = async () => {
    if (!transcript.trim()) {
      moveToNextQuestion();
      return;
    }

    setIsProcessing(true);

    try {
      const currentQuestion = practiceQuestions[currentIndex];
      const questionText = currentQuestion?.question || currentQuestion;

      const response = await fetch(`${API_BASE_URL}/evaluate-interview-answer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: questionText,
          user_answer: transcript,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `API Error: ${response.status}`);
      }

      const data = await response.json();

      setFeedback(data.feedback);
      setAllAnswers((prev) => [
        ...prev,
        {
          question: questionText,
          answer: transcript,
          feedback: data.feedback,
          index: currentIndex,
        },
      ]);

      setTimeout(() => {
        moveToNextQuestion();
      }, 3000);
    } catch (error) {
      console.error('Error evaluating answer:', error);
      alert('Error: Could not evaluate your answer. Make sure the backend server is running and VITE_API_URL is configured\n\nError: ' + error.message);
      moveToNextQuestion();
    } finally {
      setIsProcessing(false);
    }
  };

  const moveToNextQuestion = () => {
    if (currentIndex < practiceQuestions.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      setTranscript('');
      setFeedback(null);

      setTimeout(() => {
        speakQuestion(practiceQuestions[nextIndex]);
      }, 500);
    } else {
      setIsComplete(true);
    }
  };

  // Selection Screen
  if (!practiceStarted) {
    return (
      <div className="practice-overlay">
        <div className="practice-modal">
          <div className="practice-header">
            <h2>🎤 Interview Practice</h2>
            <button className="close-btn" onClick={onClose}>
              <FiX />
            </button>
          </div>

          <div className="practice-body">
            <h3>Select Number of Questions</h3>
            <p>Choose how many questions you'd like to practice</p>

            <div className="button-group">
              <button className="select-btn" onClick={() => handleStartPractice(5)}>
                <span className="count">5</span>
                <span className="label">Quick Practice</span>
              </button>
              <button className="select-btn" onClick={() => handleStartPractice(10)}>
                <span className="count">10</span>
                <span className="label">Standard Practice</span>
              </button>
              <button className="select-btn" onClick={() => handleStartPractice(15)}>
                <span className="count">15</span>
                <span className="label">Full Practice</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Completion Screen
  if (isComplete) {
    const avgRating =
      allAnswers.length > 0
        ? (allAnswers.reduce((sum, a) => sum + (a.feedback?.rating || 0), 0) / allAnswers.length).toFixed(1)
        : 0;

    // Calculate stats by category
    const categoryStats = {};
    allAnswers.forEach((answer) => {
      const category = practiceQuestions[answer.index]?.category || 'Unknown';
      if (!categoryStats[category]) {
        categoryStats[category] = { ratings: [], count: 0 };
      }
      categoryStats[category].ratings.push(answer.feedback?.rating || 0);
      categoryStats[category].count += 1;
    });

    // Calculate average per category
    const categoryAverages = {};
    Object.keys(categoryStats).forEach((cat) => {
      const ratings = categoryStats[cat].ratings;
      categoryAverages[cat] = (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1);
    });

    // Find strongest and weakest
    const sortedCategories = Object.entries(categoryAverages).sort((a, b) => b[1] - a[1]);

    // Save to history
    saveInterviewHistory(avgRating, categoryAverages, allAnswers.length);

    // Load history from localStorage (fallback)
    const loadHistoryData = () => {
      const authToken = localStorage.getItem('auth_token');
      
      if (authToken) {
        // In production, fetch from backend
        // For now, use localStorage as fallback
        const saved = localStorage.getItem('interviewHistory');
        return saved ? JSON.parse(saved) : [];
      } else {
        const saved = localStorage.getItem('interviewHistory');
        return saved ? JSON.parse(saved) : [];
      }
    };

    const history = loadHistoryData();

    return (
      <div className="practice-overlay">
        <div className="practice-modal">
          <div className="practice-header">
            <h2>🎉 Practice Complete!</h2>
            <button className="close-btn" onClick={onClose}>
              <FiX />
            </button>
          </div>

          <div className="practice-body">
            {/* Main Stats */}
            <div className="completion-stats">
              <div className="stat">
                <div className="stat-value">{allAnswers.length}</div>
                <div className="stat-label">Questions Answered</div>
              </div>
              <div className="stat stat-highlighted">
                <div className="stat-value">{avgRating}</div>
                <div className="stat-label">Average Rating</div>
              </div>
            </div>

            {/* Topic Performance */}
            {sortedCategories.length > 0 && (
              <div className="topic-performance">
                <h3>📊 Topic Performance</h3>
                <div className="topic-cards">
                  {sortedCategories.map(([category, avg], idx) => (
                    <div key={category} className={`topic-card ${idx === 0 ? 'strongest' : idx === sortedCategories.length - 1 ? 'weakest' : ''}`}>
                      <div className="topic-name">{category}</div>
                      <div className="topic-rating">{avg}/10</div>
                      <div className="topic-bar">
                        <div className="topic-fill" style={{ width: `${(avg / 10) * 100}%` }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Interview History Graph */}
            {history.length > 0 && (
              <div className="progress-section">
                <h3>📈 Your Progress Over Time</h3>
                <div className="progress-list">
                  {history.map((session, idx) => (
                    <div key={idx} className="progress-item">
                      <span className="interview-number">Interview {idx + 1}</span>
                      <span className="interview-rating">{session.rating}/10</span>
                      <div className="progress-bar-container">
                        <div className="progress-bar" style={{ width: `${(session.rating / 10) * 100}%` }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Your Answers */}
            <h3>📝 Your Answers</h3>
            <div className="answers-list">
              {allAnswers.map((item, idx) => (
                <div key={idx} className="answer-item">
                  <div className="answer-header">
                    <strong>
                      Q{idx + 1}: {item.question.substring(0, 100)}...
                    </strong>
                    <span className="rating">{item.feedback?.rating}/10</span>
                  </div>
                  <p>
                    <strong>Your Answer:</strong> {item.answer.substring(0, 150)}...
                  </p>
                  {item.feedback?.feedback && (
                    <p>
                      <strong>Feedback:</strong> {item.feedback.feedback}
                    </p>
                  )}
                </div>
              ))}
            </div>

            <button className="close-btn-bottom" onClick={onClose}>
              Close & Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Practice Screen
  const currentQuestion = practiceQuestions[currentIndex];
  const totalQuestions = practiceQuestions.length;

  return (
    <div className="practice-overlay">
      <div className="practice-modal">
        <div className="practice-header">
          <div>
            <h2>🎤 Interview Practice</h2>
            <p className="progress-text">
              Question {currentIndex + 1} of {totalQuestions}
            </p>
          </div>
          <button className="close-btn" onClick={onClose}>
            <FiX />
          </button>
        </div>

        <div className="practice-body">
          {!feedback ? (
            <>
              <div className="question-card">
                <h3>{currentQuestion?.question || currentQuestion}</h3>
                {currentQuestion?.focus_area && (
                  <p className="context">{currentQuestion.focus_area}</p>
                )}
                {currentQuestion?.situation && (
                  <p className="context">{currentQuestion.situation}</p>
                )}
                {currentQuestion?.role_context && (
                  <p className="context">{currentQuestion.role_context}</p>
                )}
              </div>

              {!isRecording ? (
                <div className="recording-section">
                  <button className="start-btn" onClick={startRecording}>
                    <FiMic /> Start Speaking
                  </button>
                  <p className="help-text">Click to start recording your answer (60 seconds)</p>
                </div>
              ) : (
                <div className="recording-active">
                  <div className="timer">
                    <div className="timer-display">
                      {String(Math.floor(timeLeft / 60)).padStart(2, '0')}:
                      {String(timeLeft % 60).padStart(2, '0')}
                    </div>
                  </div>
                  <button className="stop-btn" onClick={stopRecordingAndSubmit}>
                    <FiStopCircle /> Stop & Next
                  </button>
                  <p className="recording-text">Recording...</p>
                </div>
              )}

              {transcript && (
                <div className="transcript-box">
                  <p className="transcript-label">Your Answer:</p>
                  <p className="transcript-text">{transcript}</p>
                </div>
              )}
            </>
          ) : (
            <>
              <div className="feedback-card">
                <h3>Feedback</h3>
                <div className="rating-display">
                  <span className="rating-value">{feedback?.rating}</span>
                  <span className="rating-max">/10</span>
                </div>
                <p>{feedback?.feedback}</p>

                {feedback?.strengths && feedback.strengths.length > 0 && (
                  <div className="feedback-section">
                    <h4>✓ Strengths</h4>
                    <ul>
                      {feedback.strengths.map((s, i) => (
                        <li key={i}>{s}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {feedback?.weaknesses && feedback.weaknesses.length > 0 && (
                  <div className="feedback-section">
                    <h4>△ Areas to Improve</h4>
                    <ul>
                      {feedback.weaknesses.map((w, i) => (
                        <li key={i}>{w}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {feedback?.improvements && feedback.improvements.length > 0 && (
                  <div className="feedback-section">
                    <h4>💡 Suggestions</h4>
                    <ul>
                      {feedback.improvements.map((imp, i) => (
                        <li key={i}>{imp}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {isProcessing ? (
                <p className="loading">Moving to next question...</p>
              ) : (
                <button className="next-btn" onClick={moveToNextQuestion}>
                  {currentIndex < totalQuestions - 1 ? 'Next Question' : 'See Results'} <FiChevronRight />
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default InteractiveInterviewPractice;

