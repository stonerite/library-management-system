import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class BooksService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createBookDto: CreateBookDto) {
    const existingGenre = await this.prisma.genre.findUnique({
      where: { id: createBookDto.genreId },
    });
    if (!existingGenre) {
      throw new NotFoundException(`Genre with ID ${createBookDto.genreId} not found`);
    }

    const existingIsbn = await this.prisma.book.findUnique({
      where: { isbn: createBookDto.isbn },
    });
    if (existingIsbn) {
      throw new ConflictException(`Book with ISBN ${createBookDto.isbn} already exists`);
    }

    return this.prisma.book.create({
      data: createBookDto,
      include: { genre: true },
    });
  }

  async findAll(params: {
    genreId?: number;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const { genreId, search, page = 1, limit = 10 } = params;
    const parsedPage = Math.max(1, Number(page) || 1);
    const parsedLimit = Math.max(1, Number(limit) || 10);
    const skip = (parsedPage - 1) * parsedLimit;
    const take = parsedLimit;

    const where: Prisma.BookWhereInput = {};

    if (genreId !== undefined && !isNaN(genreId)) {
      where.genreId = Number(genreId);
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { author: { contains: search, mode: 'insensitive' } },
      ];
    }

    return this.prisma.book.findMany({
      where,
      skip,
      take,
      include: { genre: true },
    });
  }

  async findOne(id: number) {
    const book = await this.prisma.book.findUnique({
      where: { id },
      include: { genre: true, reviews: true },
    });
    if (!book) {
      throw new NotFoundException(`Book with ID ${id} not found`);
    }
    return book;
  }

  async update(id: number, updateBookDto: UpdateBookDto) {
    await this.findOne(id);
    if (updateBookDto.genreId) {
      const existingGenre = await this.prisma.genre.findUnique({
        where: { id: updateBookDto.genreId },
      });
      if (!existingGenre) {
        throw new NotFoundException(`Genre with ID ${updateBookDto.genreId} not found`);
      }
    }

    return this.prisma.book.update({
      where: { id },
      data: updateBookDto,
      include: { genre: true },
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.book.delete({
      where: { id },
    });
  }
}
