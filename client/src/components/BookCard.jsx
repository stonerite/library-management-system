import React from 'react';
import { Link } from 'react-router-dom';
import { useReadingList } from '../context/ReadingListContext';

export default function BookCard({ book }) {
  const { isInReadingList, addBook, removeBook } = useReadingList();
  const inList = isInReadingList(book.id);
  const copies = book.totalCopies ?? book.copies ?? 1;

  const handleToggleReadingList = (e) => {
    e.preventDefault();
    if (inList) {
      removeBook(book.id);
    } else {
      addBook(book);
    }
  };

  return (
    <div className="book-card" data-testid={`book-card-${book.id}`}>
      <div className="book-card-header">
        {book.genre?.name && (
          <span className="genre-tag">{book.genre.name}</span>
        )}
        <button
          type="button"
          className={`reading-list-toggle-btn ${inList ? 'active' : ''}`}
          onClick={handleToggleReadingList}
          aria-label={inList ? 'Remove from reading list' : 'Add to reading list'}
          title={inList ? 'Remove from reading list' : 'Add to reading list'}
        >
          {inList ? '✓ Saved' : '+ Save'}
        </button>
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
