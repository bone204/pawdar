import { IsOptional, IsIn, IsInt, Min, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class BreedQueryDto {
  @ApiPropertyOptional({ enum: ['cat', 'dog'], description: 'Filter by pet type' })
  @IsOptional()
  @IsIn(['cat', 'dog'])
  petType?: 'cat' | 'dog';

  @ApiPropertyOptional({ enum: ['en', 'vi'], description: 'Response language', default: 'vi' })
  @IsOptional()
  @IsIn(['en', 'vi'])
  lang?: 'en' | 'vi';

  @ApiPropertyOptional({ description: 'Search query for breed name' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Page number', default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Items per page limit', default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 20;
}
