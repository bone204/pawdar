import { IsOptional, IsIn } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class BreedQueryDto {
  @ApiPropertyOptional({ enum: ['cat', 'dog'], description: 'Filter by pet type' })
  @IsOptional()
  @IsIn(['cat', 'dog'])
  petType?: 'cat' | 'dog';

  @ApiPropertyOptional({ enum: ['en', 'vi'], description: 'Response language', default: 'vi' })
  @IsOptional()
  @IsIn(['en', 'vi'])
  lang?: 'en' | 'vi';
}
