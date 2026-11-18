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
