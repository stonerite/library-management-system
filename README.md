# Library Management System

NestJS API with Prisma and PostgreSQL for a library's book catalog.

## Setup

```bash
cd api
cp .env.example .env        # fill in your hosted PostgreSQL URL
npx prisma migrate dev --name init
npx prisma db seed          # 16 books across 4 genres
```

`package.json` needs: `"prisma": { "seed": "tsx prisma/seed.ts" }`.

## Schema Decisions

- **Book references Genre instead of embedding it.** A `Book` stores a `genreId` foreign key (`@relation`) to a `Genre` row. Genres are shared by many books, so embedding would copy the genre name into every book. Renaming a genre would then mean updating every book, and typos would create near-duplicate genres ("Sci-Fi" vs "Science Fiction"). With a reference, the genre is stored once, renames are a single update, the foreign key prevents invalid genres, and queries like "all books in a genre" or "book counts per genre" are simple indexed joins.
- **`Role` enum (`PATRON`, `LIBRARIAN`)** on `User` restricts roles to valid values at the database level; the default is `PATRON`.
- **`Review` (stretch)** links `Book` and `User` with `rating` and `comment`. `@@unique([bookId, userId])` allows one review per user per book.
- **Unique `isbn` and `Genre.name`** keep the catalog free of duplicates and make the seed idempotent through `upsert`.

## Prisma vs. a document database

In a document database like MongoDB I would have been tempted to nest the genre (or reviews) inside the book document. In Prisma, relational modeling pushes you to normalize and declare the relationship explicitly, and the database enforces it with foreign keys.
