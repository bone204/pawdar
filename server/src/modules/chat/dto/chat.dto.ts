import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SendMessageDto {
  @ApiProperty({ description: 'ID of the conversation' })
  @IsString()
  @IsNotEmpty()
  conversationId: string;

  @ApiProperty({ description: 'Content of the message' })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiPropertyOptional({
    description: 'Type of the message',
    enum: ['TEXT', 'IMAGE', 'SYSTEM'],
    default: 'TEXT',
  })
  @IsOptional()
  @IsEnum(['TEXT', 'IMAGE', 'SYSTEM'])
  type?: string = 'TEXT';
}

export class CreateConversationDto {
  @ApiProperty({ description: 'ID of the user to start conversation with' })
  @IsString()
  @IsNotEmpty()
  receiverId: string;
}

export class EditMessageDto {
  @ApiProperty({ description: 'New content of the message' })
  @IsString()
  @IsNotEmpty()
  content: string;
}

export class GetMessagesDto {
  @ApiPropertyOptional({ description: 'ID of the last message received (for pagination)' })
  @IsOptional()
  @IsString()
  cursor?: string;

  @ApiPropertyOptional({ description: 'Number of messages to fetch', default: 20 })
  @IsOptional()
  limit?: string; // Query params are usually strings, we'll parse it in service/controller
}
