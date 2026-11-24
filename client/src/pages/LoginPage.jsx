import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useReadingList } from '../context/ReadingListContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();
  const { mergeUserReadingList } = useReadingList();

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const response = await fetch(`${apiUrl}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed. Please check your credentials.');
      }

      const jwtToken = data.accessToken || data.access_token || data.token;
      if (!jwtToken) {
        throw new Error('Authentication token was not returned by the server.');
      }

      // Store JWT and user in localStorage
      localStorage.setItem('token', jwtToken);
      localStorage.setItem('accessToken', jwtToken);
      if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));

        // Stretch Goal: Merge guest localStorage reading list into account
        try {
          const userKey = `readingList_user_${data.user.id}`;
          const existingUserSaved = localStorage.getItem(userKey);
          if (existingUserSaved) {
            mergeUserReadingList(JSON.parse(existingUserSaved));
          }
        } catch (mergeErr) {
          console.warn('Reading list merge warning:', mergeErr);
        }
      }

      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'An error occurred during login.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <header className="auth-header">
          <span className="auth-icon" aria-hidden="true">&#128274;</span>
          <h1 className="auth-title">Welcome Back</h1>
          <p className="auth-subtitle">Log in to your library account</p>
        </header>

        {error && (
          <div className="auth-error-alert" role="alert">
            <span aria-hidden="true">&#9888;&#65039;</span> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="login-email">Email Address</label>
            <input
              id="login-email"
              type="email"
              required
              className="form-input"
              placeholder="patron@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="login-password">Password</label>
            <input
              id="login-password"
              type="password"
              required
              className="form-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            className="auth-submit-btn"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Log In'}
          </button>
        </form>

        <footer className="auth-footer">
          <p>
            Don't have an account?{' '}
            <Link to="/register" className="auth-link">
              Create an account
            </Link>
          </p>
        </footer>
      </div>
    </div>
  );
}
