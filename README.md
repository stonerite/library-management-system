# Library Management System

Fullstack application for a library's book catalog and authentication system, featuring a NestJS/Prisma API backend and a React/Vite frontend.

## Setup

### 1. Backend (API)
```bash
cd api
cp .env.example .env        # fill in your hosted PostgreSQL URL and JWT_SECRET
npm install
npx prisma db push          # or npx prisma migrate dev
npx prisma db seed          # seeds genres, books with totalCopies, and demo users with hashed passwords
npm run build
npm start                   # runs on http://localhost:3000
```

`package.json` seed config: `"prisma": { "seed": "tsx prisma/seed.ts" }`.

### 2. Frontend (Client)
```bash
cd client
cp .env.example .env        # points VITE_API_URL to http://localhost:3000
npm install
npm run dev                 # runs development server on http://localhost:5173
npm run build               # builds production assets to client/dist
```

## API Endpoints

### Authentication & Users
- `POST /auth/register` - Register a new user with bcrypt password hashing (defaults to `PATRON` role).
- `POST /auth/login` - Authenticate user, rate-limited with `@nestjs/throttler`, returns JWT `accessToken`.
- `GET /users/profile` - Protected route returning authenticated user info via `@Req()`.

### Genres (Full CRUD)
- `POST /genres` - Create a new genre (validated with `CreateGenreDto`).
- `GET /genres` - List all genres with book count.
- `GET /genres/:id` - Get a genre by ID including its books.
- `PATCH /genres/:id` - Update a genre name (validated with `UpdateGenreDto`).
- `DELETE /genres/:id` - Remove a genre by ID.

### Books (Guarded CRUD & Search)
- `GET /books` - List books with query-based filtering (`genreId`), search (`search` against title/author), and pagination (`page`, `limit`).
- `GET /books/:id` - Get a book by ID.
- `POST /books` - Create a new book (`JwtAuthGuard` + `RolesGuard` restricting to `LIBRARIAN`, validated with `CreateBookDto`).
- `PATCH /books/:id` - Update a book (`JwtAuthGuard` + `RolesGuard` restricting to `LIBRARIAN`, validated with `UpdateBookDto`).
- `DELETE /books/:id` - Delete a book (`JwtAuthGuard` + `RolesGuard` restricting to `LIBRARIAN`).

### Postman Collection
A complete Postman collection is available at [docs/postman_collection.json](docs/postman_collection.json).

## Frontend Components & Features

- **Routing:** Configured with React Router in `client/src/main.jsx` and `client/src/App.jsx` for `/` and `/books/:id`.
- **Search & Filtering:** Debounced input (`SearchBar.jsx`) and genre dropdown (`HomePage.jsx`) driving live catalog queries.
- **Responsive Catalog:** `BookGrid.jsx` rendering `BookCard.jsx` with unique key props (`key={book.id}`).
- **Graceful States:** Skeleton loading UI, user-friendly empty state, and error handling with a retry button.
- **Sort Control:** Sort books by title or author dynamically.
- Complete documentation of frontend code is in [docs/FRONTEND_REQUIREMENTS.md](docs/FRONTEND_REQUIREMENTS.md).

## Schema Decisions

- **Book references Genre instead of embedding it.** A `Book` stores a `genreId` foreign key (`@relation`) to a `Genre` row. Genres are shared by many books, so embedding would copy the genre name into every book. Renaming a genre would then mean updating every book, and typos would create near-duplicate genres ("Sci-Fi" vs "Science Fiction"). With a reference, the genre is stored once, renames are a single update, the foreign key prevents invalid genres, and queries like "all books in a genre" or "book counts per genre" are simple indexed joins.
- **`Role` enum (`PATRON`, `LIBRARIAN`)** on `User` restricts roles to valid values at the database level; the default is `PATRON`.
- **`Review` (stretch)** links `Book` and `User` with `rating` and `comment`. `@@unique([bookId, userId])` allows one review per user per book.
- **Unique `isbn` and `Genre.name`** keep the catalog free of duplicates and make the seed idempotent through `upsert`.

## Prisma vs. a document database

In a document database like MongoDB I would have been tempted to nest the genre (or reviews) inside the book document. In Prisma, relational modeling pushes you to normalize and declare the relationship explicitly, and the database enforces it with foreign keys.
