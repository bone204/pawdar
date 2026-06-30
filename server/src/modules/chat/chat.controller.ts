import { Controller, Get, Post, Body, Param, UseGuards, Put, Delete, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ChatService } from './chat.service';
import { SendMessageDto, CreateConversationDto, EditMessageDto, GetMessagesDto } from './dto/chat.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('chat')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('conversations')
  @ApiOperation({ summary: 'Get all conversations for current user' })
  async getConversations(@CurrentUser('sub') userId: string) {
    return this.chatService.getConversations(userId);
  }

  @Post('conversations')
  @ApiOperation({ summary: 'Create or get a 1-1 conversation with another user' })
  async createOrGetDirectConversation(
    @CurrentUser('sub') userId: string,
    @Body() createDto: CreateConversationDto,
  ) {
    return this.chatService.createOrGetDirectConversation(userId, createDto);
  }

  @Get('conversations/:id/messages')
  @ApiOperation({ summary: 'Get messages for a specific conversation with pagination' })
  async getMessages(
    @CurrentUser('sub') userId: string,
    @Param('id') conversationId: string,
    @Query() query: GetMessagesDto,
  ) {
    return this.chatService.getMessages(conversationId, userId, query);
  }

  @Post('messages')
  @ApiOperation({ summary: 'Send a new message to a conversation' })
  async sendMessage(
    @CurrentUser('sub') userId: string,
    @Body() sendDto: SendMessageDto,
  ) {
    return this.chatService.sendMessage(userId, sendDto);
  }

  @Put('conversations/:id/read')
  @ApiOperation({ summary: 'Mark all messages in conversation as read' })
  async markAsRead(
    @CurrentUser('sub') userId: string,
    @Param('id') conversationId: string,
  ) {
    return this.chatService.markAsRead(conversationId, userId);
  }

  @Put('messages/:id')
  @ApiOperation({ summary: 'Edit a message' })
  async editMessage(
    @CurrentUser('sub') userId: string,
    @Param('id') messageId: string,
    @Body() editDto: EditMessageDto,
  ) {
    return this.chatService.editMessage(userId, messageId, editDto.content);
  }

  @Delete('messages/:id')
  @ApiOperation({ summary: 'Revoke (soft delete) a message' })
  async revokeMessage(
    @CurrentUser('sub') userId: string,
    @Param('id') messageId: string,
  ) {
    return this.chatService.revokeMessage(userId, messageId);
  }
}
