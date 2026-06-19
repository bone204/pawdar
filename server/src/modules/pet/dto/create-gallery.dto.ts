import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsDateString } from 'class-validator';

export class CreateGalleryDto {
  @ApiProperty({
    description: 'The URL to the gallery image',
    example: 'https://example.com/pet-image.png',
  })
  @IsNotEmpty()
  @IsString()
  imageUrl: string;

  @ApiPropertyOptional({
    description: 'A description or note about the image',
    example: 'Max playing at the park.',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'The timestamp/time of the image',
    example: '2026-06-19T08:30:00.000Z',
  })
  @IsNotEmpty()
  @IsDateString()
  capturedAt: string;
}
