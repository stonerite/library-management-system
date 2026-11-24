import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useReadingList } from '../context/ReadingListContext';

export default function ReadingListPage() {
  const { readingList, removeBook, clearList } = useReadingList();
  const [borrowSuccess, setBorrowSuccess] = useState(false);
  const navigate = useNavigate();

  const handleBorrow = () => {
    const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
    if (!token) {
      navigate('/login', { state: { from: { pathname: '/reading-list' } } });
      return;
    }

    setBorrowSuccess(true);
  };

  if (readingList.length === 0) {
    return (
      <div className="reading-list-page">
        <div className="state-message empty-state">
          <div className="state-icon" aria-hidden="true">&#128218;</div>
          <h2>Your Reading List is Empty</h2>
          <p>You haven't added any books to your reading list yet.</p>
          <Link to="/" className="retry-button" style={{ display: 'inline-block', marginTop: '1rem' }}>
            Browse Catalog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="reading-list-page">
      <header className="reading-list-header">
        <div>
          <h1 className="reading-list-title">My Reading List</h1>
          <p className="reading-list-subtitle">
            {readingList.length} {readingList.length === 1 ? 'book' : 'books'} ready for borrowing
          </p>
        </div>
        <div className="reading-list-actions">
          <button
            type="button"
            className="clear-list-btn"
            onClick={clearList}
          >
            Clear List
          </button>
        </div>
      </header>

      {borrowSuccess && (
        <div className="borrow-success-banner" role="status">
          <span aria-hidden="true">&#9989;</span> Borrow request submitted for {readingList.length} books! Pickup ready at circulation desk.
        </div>
      )}

      <div className="reading-list-grid">
        {readingList.map((book) => (
          <div key={book.id} className="reading-list-card">
            <div className="reading-list-card-main">
              {book.genre?.name && (
                <span className="genre-tag">{book.genre.name}</span>
              )}
              <h3 className="card-title">
                <Link to={`/books/${book.id}`}>{book.title}</Link>
              </h3>
              <p className="card-author">by {book.author}</p>
              <span className="card-isbn">ISBN: {book.isbn}</span>
            </div>

            <div className="reading-list-card-side">
              <button
                type="button"
                className="remove-book-btn"
                onClick={() => removeBook(book.id)}
                aria-label={`Remove ${book.title} from reading list`}
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="reading-list-bottom-bar">
        <button
          type="button"
          className="borrow-all-btn"
          onClick={handleBorrow}
        >
          Submit Borrow Request ({readingList.length} {readingList.length === 1 ? 'Book' : 'Books'}) &rarr;
        </button>
      </div>
    </div>
  );
}
