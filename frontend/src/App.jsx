import React, { useState, useEffect } from 'react';
import './styles/App.css';
import FileUpload from './components/FileUpload';
import AnalysisResults from './components/AnalysisResults';
import Chatbot from './components/Chatbot';
import Auth from './components/Auth';
import UserProfile from './components/UserProfile';
import GamificationStats from './components/GamificationStats';
import Leaderboard from './components/Leaderboard';
import SavedAnalyses from './components/SavedAnalyses';
import JobApplicationTracker from './components/JobApplicationTracker';
import {
  API_BASE_URL,
  analyzeResume,
  saveAnalysisSession,
  getAnalysisHistory,
  deleteAnalysisSession,
  getJobApplications,
  createJobApplication,
  updateJobApplication,
  deleteJobApplication,
} from './api';
import { FiUser, FiLogOut } from 'react-icons/fi';

function App() {
  const [analysis, setAnalysis] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [resumeFile, setResumeFile] = useState(null);
  const [jobDescriptionFile, setJobDescriptionFile] = useState(null);
  const [resumeText, setResumeText] = useState('');
  const [jobDescriptionText, setJobDescriptionText] = useState('');
  
  // Auth states
  const [user, setUser] = useState(null);
  const [authToken, setAuthToken] = useState(null);
  const [showAuth, setShowAuth] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [userRank, setUserRank] = useState(null);
  const [analysisHistory, setAnalysisHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');
  const [jobApplications, setJobApplications] = useState([]);
  const [applicationsLoading, setApplicationsLoading] = useState(false);

  // Load user on mount
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    const userInfo = localStorage.getItem('user_info');
    
    if (token && userInfo) {
      setAuthToken(token);
      const user = JSON.parse(userInfo);
      setUser(user);
      
      // Fetch user rank
      const fetchRank = async () => {
        try {
          const response = await fetch(`${API_BASE_URL}/gamification/user-rank`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          const data = await response.json();
          if (data.success && data.rank_info) {
            setUserRank(data.rank_info);
          }
        } catch (err) {
          console.error('Error fetching user rank:', err);
        }
      };
      fetchRank();
      fetchAnalysisHistory(token);
      fetchJobApplications(token);
    }
  }, []);

  const handleAnalyze = async () => {
    if (!resumeFile || !jobDescriptionFile) {
      setError('Please upload both files');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await analyzeResume(resumeFile, jobDescriptionFile);
      setAnalysis(result.analysis);
      setResumeText(result.resume_text || '');
      setJobDescriptionText(result.job_description || '');

      const token = authToken || localStorage.getItem('auth_token');
      if (token && result.analysis) {
        try {
          await saveAnalysisSession(
            {
              title: `${resumeFile?.name || 'Resume'} vs ${jobDescriptionFile?.name || 'Job Description'}`,
              resume_filename: resumeFile?.name || null,
              job_description_filename: jobDescriptionFile?.name || null,
              analysis: result.analysis,
              resume_text: result.resume_text || '',
              job_description_text: result.job_description || '',
            },
            token
          );
          setSaveStatus('Analysis saved to your history.');
          fetchAnalysisHistory(token);
        } catch (saveErr) {
          console.error('Save analysis error:', saveErr);
          setSaveStatus('Analysis complete, but failed to save history.');
        }
      } else {
        setSaveStatus('');
      }
    } catch (err) {
      setError(err.error || 'Failed to analyze resume');
      console.error('Analysis error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAuthSuccess = (userInfo, token) => {
    setUser(userInfo);
    setAuthToken(token);
    fetchUserRank();
    fetchAnalysisHistory(token);
    fetchJobApplications(token);
  };

  const handleProfileUpdate = (updatedUser) => {
    setUser(updatedUser);
  };

  const fetchUserRank = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) return;

      const response = await fetch(`${API_BASE_URL}/gamification/user-rank`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success && data.rank_info) {
        setUserRank(data.rank_info);
      }
    } catch (err) {
      console.error('Error fetching user rank:', err);
    }
  };

  const fetchAnalysisHistory = async (tokenOverride = null) => {
    const token = tokenOverride || authToken || localStorage.getItem('auth_token');
    if (!token) {
      setAnalysisHistory([]);
      return;
    }

    setHistoryLoading(true);
    try {
      const data = await getAnalysisHistory(20, token);
      if (data.success) {
        setAnalysisHistory(data.history || []);
      }
    } catch (err) {
      console.error('Error fetching analysis history:', err);
      setAnalysisHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  const fetchJobApplications = async (tokenOverride = null) => {
    const token = tokenOverride || authToken || localStorage.getItem('auth_token');
    if (!token) {
      setJobApplications([]);
      return;
    }

    setApplicationsLoading(true);
    try {
      const data = await getJobApplications(token);
      if (data.success) {
        setJobApplications(data.applications || []);
      }
    } catch (err) {
      console.error('Error fetching job applications:', err);
      setJobApplications([]);
    } finally {
      setApplicationsLoading(false);
    }
  };

  const handleLoadSavedAnalysis = (session) => {
    setAnalysis(session.analysis_data || null);
    setResumeText(session.resume_text || '');
    setJobDescriptionText(session.job_description_text || '');
    setSaveStatus('Loaded analysis from history.');
  };

  const handleDeleteSavedAnalysis = async (sessionId) => {
    try {
      const token = authToken || localStorage.getItem('auth_token');
      if (!token) return;
      await deleteAnalysisSession(sessionId, token);
      fetchAnalysisHistory(token);
    } catch (err) {
      console.error('Error deleting saved analysis:', err);
      alert(err.error || 'Failed to delete saved analysis.');
    }
  };

  const handleCreateApplication = async (payload) => {
    try {
      const token = authToken || localStorage.getItem('auth_token');
      if (!token) return;
      await createJobApplication(payload, token);
      fetchJobApplications(token);
    } catch (err) {
      console.error('Error creating application:', err);
      alert(err.error || 'Failed to create application.');
    }
  };

  const handleApplicationStatusChange = async (applicationId, status) => {
    try {
      const token = authToken || localStorage.getItem('auth_token');
      if (!token) return;
      await updateJobApplication(applicationId, { status }, token);
      setJobApplications((prev) =>
        prev.map((item) =>
          item.id === applicationId ? { ...item, status } : item
        )
      );
    } catch (err) {
      console.error('Error updating application status:', err);
      alert(err.error || 'Failed to update application status.');
    }
  };

  const handleDeleteApplication = async (applicationId) => {
    try {
      const token = authToken || localStorage.getItem('auth_token');
      if (!token) return;
      await deleteJobApplication(applicationId, token);
      setJobApplications((prev) => prev.filter((item) => item.id !== applicationId));
    } catch (err) {
      console.error('Error deleting application:', err);
      alert(err.error || 'Failed to delete application.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_info');
    setUser(null);
    setAuthToken(null);
    setShowUserMenu(false);
    setUserRank(null);
    setAnalysisHistory([]);
    setJobApplications([]);
    setSaveStatus('');
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>🤖 Resume AI Analyzer</h1>
        <p>Analyze your resume against job descriptions and get AI-powered insights</p>
        
        <div className="auth-section">
          {user ? (
            <div className="user-menu">
              <button className="user-button" onClick={() => setShowUserMenu(!showUserMenu)}>
                <FiUser /> {user.username || user.email}
              </button>
              {showUserMenu && (
                <div className="user-dropdown">
                  <div className="user-info">
                    <p><strong>{user.username || user.email}</strong></p>
                    <p className="email">{user.email}</p>
                  </div>
                  <button className="profile-option-btn" onClick={() => {
                    setShowProfile(true);
                    setShowUserMenu(false);
                  }}>
                    <FiUser /> View Profile
                  </button>
                  <button className="logout-btn" onClick={handleLogout}>
                    <FiLogOut /> Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button className="login-btn" onClick={() => setShowAuth(true)}>
              Sign In / Sign Up
            </button>
          )}
        </div>
      </header>

      {showAuth && (
        <Auth 
          onClose={() => setShowAuth(false)} 
          onSuccess={handleAuthSuccess}
        />
      )}

      {showProfile && user && (
        <UserProfile
          user={user}
          onClose={() => setShowProfile(false)}
          onUpdate={handleProfileUpdate}
        />
      )}

      {showLeaderboard && (
        <Leaderboard
          onClose={() => setShowLeaderboard(false)}
          userRank={userRank}
        />
      )}

      <main className="app-main">
        {/* Gamification Stats Section */}
        {user && (
          <section className="section">
            <GamificationStats 
              user={user}
              onLeaderboardClick={() => {
                fetchUserRank();
                setShowLeaderboard(true);
              }}
            />
          </section>
        )}

        {user && (
          <section className="section">
            <SavedAnalyses
              analyses={analysisHistory}
              isLoading={historyLoading}
              onLoad={handleLoadSavedAnalysis}
              onDelete={handleDeleteSavedAnalysis}
            />
          </section>
        )}

        {user && (
          <section className="section">
            <JobApplicationTracker
              applications={jobApplications}
              isLoading={applicationsLoading}
              analyses={analysisHistory}
              onCreate={handleCreateApplication}
              onStatusChange={handleApplicationStatusChange}
              onDelete={handleDeleteApplication}
            />
          </section>
        )}

        {/* File Upload Section */}
        <section className="section">
          <FileUpload
            onResumeSelect={setResumeFile}
            onJobDescriptionSelect={setJobDescriptionFile}
            onAnalyze={handleAnalyze}
            isLoading={isLoading}
          />
        </section>

        {/* Error Message */}
        {error && (
          <section className="error-section">
            <div className="error-message">
              <strong>Error:</strong> {error}
            </div>
          </section>
        )}

        {/* Analysis Results */}
        {analysis && (
          <section className="section">
            {saveStatus && <div className="save-status-message">{saveStatus}</div>}
            <AnalysisResults 
              analysis={analysis}
              resumeText={resumeText}
              jobDescriptionText={jobDescriptionText}
            />
          </section>
        )}

        {/* Chatbot Section */}
        <section className="section chatbot-section">
          <Chatbot analysisContext={analysis} />
        </section>
      </main>

      <footer className="app-footer">
        <p>© 2026 Resume AI Analyzer.</p>
      </footer>
    </div>
  );
}

export default App;
