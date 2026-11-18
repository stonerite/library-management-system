# Client-Side Catalog & Search Implementation

This document provides a complete reference for all required frontend codes, architecture decisions, and component implementations for the patron-facing book catalog and search interface.

---

## 1. Environment Configuration

### `client/.env`
Defines the backend API URL for the Vite frontend client:
```env
VITE_API_URL=http://localhost:3000
```

### `client/.env.example`
Committed template for developers:
```env
VITE_API_URL=http://localhost:3000
```

---

## 2. Application Entry & Routing

### `client/src/main.jsx`
Wraps the root `<App />` component inside React Router's `<BrowserRouter>`:
```jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
```

### `client/src/App.jsx`
Configures application routes for `/` (catalog home) and `/books/:id` (book details):
```jsx
import { Routes, Route, Link } from 'react-router-dom';
import HomePage from './pages/HomePage';
import BookDetail from './pages/BookDetail';

export default function App() {
  return (
    <div className="app-container">
      <header className="navbar">
        <div className="nav-container">
          <Link to="/" className="nav-brand">
            <span className="brand-icon">📚</span>
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
          <p>© 2026 Library Management System. Built for book lovers.</p>
        </div>
      </footer>
    </div>
  );
}
```

---

## 3. Pages

### `client/src/pages/HomePage.jsx`
Holds the shared filter state (`search`, `selectedGenreId`, and `sortBy`) and coordinates `SearchBar`, the genre filter dropdown, sort controls, and `BookGrid`:
```jsx
import { useState, useEffect } from 'react';
import SearchBar from '../components/SearchBar';
import BookGrid from '../components/BookGrid';

export default function HomePage() {
  const [selectedGenreId, setSelectedGenreId] = useState('');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('none');
  const [genres, setGenres] = useState([]);
  const [loadingGenres, setLoadingGenres] = useState(true);

  // Fetch available genres from backend for the genre filter
  useEffect(() => {
    let isCancelled = false;

    const fetchGenres = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
        const response = await fetch(`${apiUrl}/genres`);
        if (response.ok) {
          const data = await response.json();
          if (!isCancelled) {
            setGenres(Array.isArray(data) ? data : []);
          }
        }
      } catch (err) {
        console.error('Failed to fetch genres:', err);
      } finally {
        if (!isCancelled) {
          setLoadingGenres(false);
        }
      }
    };

    fetchGenres();

    return () => {
      isCancelled = true;
    };
  }, []);

  return (
    <div className="home-page">
      <section className="catalog-hero">
        <h1 className="hero-title">Browse Our Catalog</h1>
        <p className="hero-subtitle">Find and explore books across multiple genres.</p>
      </section>

      {/* Shared Filter Controls Container */}
      <section className="controls-panel">
        <div className="search-wrapper">
          <SearchBar onSearch={setSearch} />
        </div>

        <div className="filter-sort-wrapper">
          {/* Genre Filter */}
          <div className="control-group">
            <label htmlFor="genre-filter" className="control-label">Genre:</label>
            <select
              id="genre-filter"
              className="control-select"
              value={selectedGenreId}
              onChange={(e) => setSelectedGenreId(e.target.value)}
              disabled={loadingGenres}
            >
              <option value="">All Genres</option>
              {genres.map((genre) => (
                <option key={genre.id} value={genre.id}>
                  {genre.name}
                </option>
              ))}
            </select>
          </div>

          {/* Stretch: Sort Control */}
          <div className="control-group">
            <label htmlFor="sort-control" className="control-label">Sort by:</label>
            <select
              id="sort-control"
              className="control-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="none">Default</option>
              <option value="title">Title (A-Z)</option>
              <option value="author">Author (A-Z)</option>
            </select>
          </div>
        </div>
      </section>

      {/* Book Grid displaying the books based on shared filter state */}
      <section className="grid-section">
        <BookGrid
          genreId={selectedGenreId}
          search={search}
          sortBy={sortBy}
        />
      </section>
    </div>
  );
}
```

### `client/src/pages/BookDetail.jsx`
Extracts the book ID from `useParams()`, fetches `GET /books/:id`, and renders complete details (ISBN, publication year, copies, genre, reviews, not-found, and loading states):
```jsx
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

export default function BookDetail() {
  const { id } = useParams();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isCancelled = false;

    const fetchBookDetails = async () => {
      setLoading(true);
      setError(null);

      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
        const response = await fetch(`${apiUrl}/books/${id}`);

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error(`Book with ID ${id} was not found in our catalog.`);
          }
          throw new Error(`Failed to load book (Status: ${response.status})`);
        }

        const data = await response.json();
        if (!isCancelled) {
          setBook(data);
        }
      } catch (err) {
        if (!isCancelled) {
          setError(err.message || 'An error occurred while loading book details.');
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    fetchBookDetails();

    return () => {
      isCancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="book-detail-container" aria-busy="true">
        <div className="skeleton-detail">
          <div className="skeleton-line title" style={{ width: '60%', height: '32px' }}></div>
          <div className="skeleton-line author" style={{ width: '35%', height: '20px' }}></div>
          <div className="skeleton-line" style={{ width: '80%', height: '16px', marginTop: '20px' }}></div>
          <div className="skeleton-line" style={{ width: '50%', height: '16px' }}></div>
        </div>
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="book-detail-container">
        <div className="state-message error-state" role="alert">
          <div className="state-icon">⚠️</div>
          <h2>Book Not Found</h2>
          <p>{error || 'The requested book does not exist.'}</p>
          <Link to="/" className="back-link">&larr; Back to Catalog</Link>
        </div>
      </div>
    );
  }

  const copies = book.totalCopies ?? book.copies ?? 1;

  return (
    <div className="book-detail-container">
      <nav className="detail-navigation">
        <Link to="/" className="back-link">&larr; Back to Catalog</Link>
      </nav>

      <article className="book-detail-card">
        <header className="book-detail-header">
          {book.genre?.name && (
            <span className="genre-tag large">{book.genre.name}</span>
          )}
          <h1 className="detail-title">{book.title}</h1>
          <p className="detail-author">Written by <strong>{book.author}</strong></p>
        </header>

        <section className="book-detail-info">
          <div className="info-grid">
            <div className="info-card">
              <span className="info-label">ISBN</span>
              <span className="info-value">{book.isbn}</span>
            </div>

            <div className="info-card">
              <span className="info-label">Publication Year</span>
              <span className="info-value">{book.publishedAt || 'N/A'}</span>
            </div>

            <div className="info-card">
              <span className="info-label">Available Copies</span>
              <span className="info-value highlight">{copies}</span>
            </div>

            <div className="info-card">
              <span className="info-label">Catalog ID</span>
              <span className="info-value">#{book.id}</span>
            </div>
          </div>
        </section>

        {book.reviews && book.reviews.length > 0 && (
          <section className="book-reviews-section">
            <h3>Patron Reviews</h3>
            <div className="reviews-container">
              {book.reviews.map((review) => (
                <div key={review.id} className="review-card">
                  <div className="review-stars">
                    {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                  </div>
                  {review.comment && (
                    <p className="review-text">"{review.comment}"</p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}
      </article>
    </div>
  );
}
```

---

## 4. Components

### `client/src/components/SearchBar.jsx`
Debounces input using `setTimeout` and cleanup (`clearTimeout`) before triggering `onSearch`:
```jsx
import { useState, useEffect } from 'react';

export default function SearchBar({ onSearch, delay = 400 }) {
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const handler = setTimeout(() => {
      onSearch(searchTerm);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm, onSearch, delay]);

  return (
    <div className="search-bar">
      <span className="search-icon">🔍</span>
      <input
        type="text"
        className="search-input"
        placeholder="Search books by title or author..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        aria-label="Search books by title or author"
      />
      {searchTerm && (
        <button
          type="button"
          className="search-clear-btn"
          onClick={() => setSearchTerm('')}
          aria-label="Clear search query"
        >
          ✕
        </button>
      )}
    </div>
  );
}
```

### `client/src/components/BookCard.jsx`
Renders an individual book card:
```jsx
import { Link } from 'react-router-dom';

export default function BookCard({ book }) {
  const copies = book.totalCopies ?? book.copies ?? 1;

  return (
    <div className="book-card" data-testid={`book-card-${book.id}`}>
      <div className="book-card-header">
        {book.genre?.name && (
          <span className="genre-tag">{book.genre.name}</span>
        )}
      </div>
      <div className="book-card-body">
        <h3 className="book-title">
          <Link to={`/books/${book.id}`}>{book.title}</Link>
        </h3>
        <p className="book-author">by <span>{book.author}</span></p>
        <div className="book-details-row">
          <span className="book-isbn">ISBN: {book.isbn}</span>
          {book.publishedAt && (
            <span className="book-year">({book.publishedAt})</span>
          )}
        </div>
      </div>
      <div className="book-card-footer">
        <span className="copies-badge">
          {copies} {copies === 1 ? 'copy' : 'copies'} available
        </span>
        <Link to={`/books/${book.id}`} className="details-button">
          View Details &rarr;
        </Link>
      </div>
    </div>
  );
}
```

### `client/src/components/BookGrid.jsx`
Fetches from `GET /books?genreId=...&search=...`, maps books with `key={book.id}`, handles loading with skeleton UI, error handling with retry, and empty state:
```jsx
import { useState, useEffect } from 'react';
import BookCard from './BookCard';

export default function BookGrid({ genreId, search, sortBy = 'none' }) {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isCancelled = false;

    const fetchBooks = async () => {
      setLoading(true);
      setError(null);

      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
        const queryParams = new URLSearchParams();

        if (genreId) {
          queryParams.append('genreId', genreId);
        }
        if (search && search.trim()) {
          queryParams.append('search', search.trim());
        }
        queryParams.append('limit', '50');

        const queryString = queryParams.toString();
        const requestUrl = `${apiUrl}/books${queryString ? `?${queryString}` : ''}`;

        const response = await fetch(requestUrl);
        if (!response.ok) {
          throw new Error(`Failed to load books (Status: ${response.status})`);
        }

        const data = await response.json();
        if (!isCancelled) {
          setBooks(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        if (!isCancelled) {
          setError(err.message || 'An error occurred while fetching books.');
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    fetchBooks();

    return () => {
      isCancelled = true;
    };
  }, [genreId, search]);

  // Stretch: Sort by title or author
  const sortedBooks = [...books].sort((a, b) => {
    if (sortBy === 'title') {
      return a.title.localeCompare(b.title);
    }
    if (sortBy === 'author') {
      return a.author.localeCompare(b.author);
    }
    return 0;
  });

  // Stretch: Skeleton-loading UI
  if (loading) {
    return (
      <div className="book-grid skeleton-grid" aria-label="Loading books" aria-busy="true">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="skeleton-card">
            <div className="skeleton-pill"></div>
            <div className="skeleton-line title"></div>
            <div className="skeleton-line author"></div>
            <div className="skeleton-line isbn"></div>
            <div className="skeleton-button"></div>
          </div>
        ))}
      </div>
    );
  }

  // Graceful Error State
  if (error) {
    return (
      <div className="state-message error-state" role="alert">
        <div className="state-icon">⚠️</div>
        <h3>Unable to load books</h3>
        <p>{error}</p>
        <button
          type="button"
          className="retry-button"
          onClick={() => {
            setLoading(true);
            setError(null);
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
            const queryParams = new URLSearchParams();
            if (genreId) queryParams.append('genreId', genreId);
            if (search) queryParams.append('search', search);
            fetch(`${apiUrl}/books?${queryParams.toString()}`)
              .then((res) => res.json())
              .then((data) => setBooks(Array.isArray(data) ? data : []))
              .catch((err) => setError(err.message))
              .finally(() => setLoading(false));
          }}
        >
          Try Again
        </button>
      </div>
    );
  }

  // Graceful Empty State
  if (sortedBooks.length === 0) {
    return (
      <div className="state-message empty-state">
        <div className="state-icon">📚</div>
        <h3>No books found</h3>
        <p>No books match your current search or genre filter. Try adjusting your criteria.</p>
      </div>
    );
  }

  // Success State: Render responsive grid of BookCards using key equal to book.id
  return (
    <div className="book-grid">
      {sortedBooks.map((book) => (
        <BookCard key={book.id} book={book} />
      ))}
    </div>
  );
}
```
