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
      <span className="search-icon" aria-hidden="true">&#128269;</span>
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
          &#10005;
        </button>
      )}
    </div>
  );
}
