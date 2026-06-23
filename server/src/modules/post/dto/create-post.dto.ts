import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreatePostDto {
  @ApiProperty({
    description: 'The title of the post',
    example: 'Cách chăm sóc mèo con mới sinh',
  })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({
    description: 'The content of the post',
    example: 'Khi chăm sóc mèo con mới sinh, cần chú ý giữ ấm cho chúng và cho bú sữa mẹ đầy đủ...',
  })
  @IsNotEmpty()
  @IsString()
  content: string;

  @ApiPropertyOptional({
    description: 'The image URL for the post',
    example: 'https://cloudinary.com/example.png',
  })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiPropertyOptional({
    description: 'Language of the UI (vi or en) for AI feedback',
    example: 'vi',
  })
  @IsOptional()
  @IsString()
  lang?: string;
}
