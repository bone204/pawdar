import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumberString, IsIn } from 'class-validator';

export class PetQueryDto {
  @ApiPropertyOptional({ description: 'Filter by pet type', enum: ['cat', 'dog'] })
  @IsOptional()
  @IsString()
  @IsIn(['cat', 'dog'])
  petType?: string;

  @ApiPropertyOptional({ description: 'Search by pet name' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Page number (1-indexed)', default: 1 })
  @IsOptional()
  @IsNumberString()
  page?: string;

  @ApiPropertyOptional({ description: 'Items per page', default: 8 })
  @IsOptional()
  @IsNumberString()
  limit?: string;
}
