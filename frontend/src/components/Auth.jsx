import React, { useState } from 'react';
import '../styles/Auth.css';
import { FiMail, FiLock, FiUser, FiX } from 'react-icons/fi';
import { GoogleLogin } from '@react-oauth/google';
import { API_BASE_URL } from '../api';

function Auth({ onClose, onSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const endpoint = isLogin ? 'login' : 'signup';
      const payload = isLogin
        ? { email, password }
        : { email, password, username };

      const response = await fetch(`${API_BASE_URL}/auth/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const raw = await response.text();
      let data = {};
      try {
        data = raw ? JSON.parse(raw) : {};
      } catch {
        data = {};
      }

      if (!response.ok) {
        throw new Error(data.error || `Authentication failed (${response.status})`);
      }

      // Save token to localStorage
      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('user_info', JSON.stringify(data.user));

      if (onSuccess) {
        onSuccess(data.user, data.token);
      }

      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: credentialResponse.credential,
        }),
      });

      const raw = await response.text();
      let data = {};
      try {
        data = raw ? JSON.parse(raw) : {};
      } catch {
        data = {};
      }

      if (!response.ok) {
        throw new Error(data.error || `Google authentication failed (${response.status})`);
      }

      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('user_info', JSON.stringify(data.user));

      if (onSuccess) {
        onSuccess(data.user, data.token);
      }

      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    setError('Failed to authenticate with Google. Please check your configuration.');
  };

  return (
    <div className="auth-overlay">
      <div className="auth-modal">
        <button className="auth-close" onClick={onClose}>
          <FiX />
        </button>

        <div className="auth-header">
          <h2>{isLogin ? '🔓 Login' : '✨ Sign Up'}</h2>
          <p>{isLogin ? 'Welcome back!' : 'Create your account'}</p>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          {!isLogin && (
            <div className="form-group">
              <label htmlFor="username">
                <FiUser /> Username
              </label>
              <input
                id="username"
                type="text"
                placeholder="Your name"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required={!isLogin}
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">
              <FiMail /> Email
            </label>
            <input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">
              <FiLock /> Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" disabled={loading} className="auth-submit-btn">
            {loading ? 'Processing...' : isLogin ? 'Login' : 'Sign Up'}
          </button>
        </form>

        <div className="auth-divider">or</div>

        <div className="google-signin-container">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            theme="outline"
            size="large"
            width="100%"
          />
          <p className="auth-setup-hint">
            Google Sign-in not working? See <a href="/GOOGLE_OAUTH_SETUP.md" target="_blank" rel="noopener noreferrer">setup guide</a>
          </p>
        </div>

        <div className="auth-footer">
          <p>
            {isLogin ? "Don't have an account? " : 'Already have an account? '}
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
              }}
              className="auth-toggle"
            >
              {isLogin ? 'Sign Up' : 'Login'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Auth;

