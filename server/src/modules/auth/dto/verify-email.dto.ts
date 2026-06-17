import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class VerifyEmailDto {
  @ApiProperty({
    description: 'The verification token sent to the user email',
    example: 'd3b07384-d113-4ec2-a5d6-c0c2a5d6c0c2',
  })
  @IsNotEmpty()
  @IsString()
  token: string;
}
