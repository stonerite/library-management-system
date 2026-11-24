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
          <div className="state-icon">&#9888;&#65039;</div>
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
