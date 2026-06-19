import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsNumber, IsIn } from 'class-validator';

export class CreatePetDto {
  @ApiProperty({
    description: 'The name of the pet',
    example: 'Max',
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    description: 'The type of the pet (cat or dog)',
    example: 'dog',
    enum: ['cat', 'dog'],
  })
  @IsNotEmpty()
  @IsString()
  @IsIn(['cat', 'dog'])
  petType: string;

  @ApiPropertyOptional({
    description: 'The breed ID of the pet',
    example: 'poodle',
  })
  @IsOptional()
  @IsString()
  breedId?: string;

  @ApiProperty({
    description: 'The gender of the pet',
    example: 'male',
    enum: ['male', 'female', 'unknown'],
  })
  @IsNotEmpty()
  @IsString()
  @IsIn(['male', 'female', 'unknown'])
  gender: string;

  @ApiPropertyOptional({
    description: 'The age of the pet in months',
    example: 36,
  })
  @IsOptional()
  @IsNumber()
  ageMonths?: number;

  @ApiPropertyOptional({
    description: 'The weight of the pet in kilograms',
    example: 5.5,
  })
  @IsOptional()
  @IsNumber()
  weightKg?: number;

  @ApiPropertyOptional({
    description: 'A description or note about the pet',
    example: 'Energetic, friendly, loves playing fetch.',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'The URL to the pet avatar image',
    example: 'https://example.com/pet.png',
  })
  @IsOptional()
  @IsString()
  avatarUrl?: string;
}
