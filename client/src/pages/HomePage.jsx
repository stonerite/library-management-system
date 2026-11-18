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
