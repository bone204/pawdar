import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsDateString } from 'class-validator';

export class UpdateGalleryDto {
  @ApiPropertyOptional({
    description: 'The URL to the gallery image',
    example: 'https://example.com/pet-image-updated.png',
  })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiPropertyOptional({
    description: 'A description or note about the image',
    example: 'Max sleeping.',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'The timestamp/time of the image',
    example: '2026-06-19T09:00:00.000Z',
  })
  @IsOptional()
  @IsDateString()
  capturedAt?: string;
}
