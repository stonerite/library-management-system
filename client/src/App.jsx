import { Routes, Route, Link } from 'react-router-dom';
import HomePage from './pages/HomePage';
import BookDetail from './pages/BookDetail';

export default function App() {
  return (
    <div className="app-container">
      <header className="navbar">
        <div className="nav-container">
          <Link to="/" className="nav-brand">
            <span className="brand-icon" aria-hidden="true">&#128218;</span>
            <span className="brand-title">Library Management System</span>
          </Link>
          <nav className="nav-links">
            <Link to="/" className="nav-link">Catalog</Link>
          </nav>
        </div>
      </header>

      <main className="main-content">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/books/:id" element={<BookDetail />} />
        </Routes>
      </main>

      <footer className="footer">
        <div className="footer-content">
          <p>&copy; 2026 Library Management System. Built for book lovers.</p>
        </div>
      </footer>
    </div>
  );
}
