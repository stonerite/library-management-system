import { PrismaClient, Role } from '@prisma/client';

const prisma = new PrismaClient();

const catalog: Record<string, [string, string, string, number][]> = {
  'Science Fiction': [
    ['Dune', 'Frank Herbert', '9780441013593', 1965],
    ['Neuromancer', 'William Gibson', '9780441569595', 1984],
    ['The Left Hand of Darkness', 'Ursula K. Le Guin', '9780441478125', 1969],
    ['Foundation', 'Isaac Asimov', '9780553293357', 1951],
  ],
  Fantasy: [
    ['The Hobbit', 'J.R.R. Tolkien', '9780547928227', 1937],
    ['A Wizard of Earthsea', 'Ursula K. Le Guin', '9780547773742', 1968],
    ['The Name of the Wind', 'Patrick Rothfuss', '9780756404741', 2007],
    ['Mistborn', 'Brandon Sanderson', '9780765311788', 2006],
  ],
  Mystery: [
    ['And Then There Were None', 'Agatha Christie', '9780062073488', 1939],
    ['The Hound of the Baskervilles', 'Arthur Conan Doyle', '9780140437867', 1902],
    ['Gone Girl', 'Gillian Flynn', '9780307588371', 2012],
    ['The Big Sleep', 'Raymond Chandler', '9780394758282', 1939],
  ],
  'Non-Fiction': [
    ['Sapiens', 'Yuval Noah Harari', '9780062316097', 2011],
    ['The Immortal Life of Henrietta Lacks', 'Rebecca Skloot', '9781400052189', 2010],
    ['A Brief History of Time', 'Stephen Hawking', '9780553380163', 1988],
    ['Educated', 'Tara Westover', '9780399590504', 2018],
  ],
};

async function main() {
  for (const [genreName, books] of Object.entries(catalog)) {
    const genre = await prisma.genre.upsert({
      where: { name: genreName },
      update: {},
      create: { name: genreName },
    });
    for (const [title, author, isbn, publishedAt] of books) {
      await prisma.book.upsert({
        where: { isbn },
        update: {},
        create: { title, author, isbn, publishedAt, copies: 3, genreId: genre.id },
      });
    }
  }

  await prisma.user.upsert({
    where: { email: 'librarian@example.com' },
    update: {},
    create: { email: 'librarian@example.com', name: 'Lena Librarian', role: Role.LIBRARIAN },
  });
  await prisma.user.upsert({
    where: { email: 'patron@example.com' },
    update: {},
    create: { email: 'patron@example.com', name: 'Pat Patron', role: Role.PATRON },
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
