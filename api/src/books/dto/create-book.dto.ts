import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateBookDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  author: string;

  @IsString()
  @IsNotEmpty()
  isbn: string;

  @IsInt()
  @Min(1)
  @Type(() => Number)
  totalCopies: number;

  @IsInt()
  @Type(() => Number)
  genreId: number;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  publishedAt?: number;
}
