import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { BooksController } from './books/books.controller';

@Module({
  imports: [PrismaModule],
  controllers: [BooksController],
})
export class AppModule {}
