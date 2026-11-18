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
