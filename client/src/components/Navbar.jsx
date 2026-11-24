import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useReadingList } from '../context/ReadingListContext';

export default function Navbar() {
  const { count } = useReadingList();
  const navigate = useNavigate();
  const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
  
  let user = null;
  try {
    const storedUser = localStorage.getItem('user');
    user = storedUser ? JSON.parse(storedUser) : null;
  } catch {
    user = null;
  }

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <header className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-brand">
          <span className="brand-icon" aria-hidden="true">&#128218;</span>
          <span className="brand-title">Library Management System</span>
        </Link>

        <nav className="nav-links">
          <Link to="/" className="nav-link">Catalog</Link>

          <Link to="/space-booking" className="nav-link">
            Space Booking
          </Link>

          <Link to="/reading-list" className="nav-link reading-list-link">
            Reading List
            <span className="reading-list-badge" data-testid="reading-list-count">
              {count}
            </span>
          </Link>

          {token ? (
            <div className="nav-auth-group">
              <span className="nav-user-greeting">
                Hi, {user?.name || user?.email || 'Patron'}
              </span>
              <button
                type="button"
                className="nav-btn logout-btn"
                onClick={handleLogout}
              >
                Log Out
              </button>
            </div>
          ) : (
            <div className="nav-auth-group">
              <Link to="/login" className="nav-link login-link">Log In</Link>
              <Link to="/register" className="nav-btn register-btn">Register</Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
