import { Controller, Get, Post, Body, Param, UseGuards, Put, Delete, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ChatService } from './chat.service';
import { SendMessageDto, CreateConversationDto, EditMessageDto, GetMessagesDto } from './dto/chat.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { CurrentUserPayload } from '../auth/decorators/current-user.decorator';

@ApiTags('chat')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('conversations')
  @ApiOperation({ summary: 'Get all conversations for current user' })
  async getConversations(@CurrentUser() user: CurrentUserPayload) {
    return this.chatService.getConversations(user.id);
  }

  @Post('conversations')
  @ApiOperation({ summary: 'Create or get a 1-1 conversation with another user' })
  async createOrGetDirectConversation(
    @CurrentUser() user: CurrentUserPayload,
    @Body() createDto: CreateConversationDto,
  ) {
    return this.chatService.createOrGetDirectConversation(user.id, createDto);
  }

  @Get('conversations/:id/messages')
  @ApiOperation({ summary: 'Get messages for a specific conversation with pagination' })
  async getMessages(
    @CurrentUser() user: CurrentUserPayload,
    @Param('id') conversationId: string,
    @Query() query: GetMessagesDto,
  ) {
    return this.chatService.getMessages(conversationId, user.id, query);
  }

  @Post('messages')
  @ApiOperation({ summary: 'Send a new message to a conversation' })
  async sendMessage(
    @CurrentUser() user: CurrentUserPayload,
    @Body() sendDto: SendMessageDto,
  ) {
    return this.chatService.sendMessage(user.id, sendDto);
  }

  @Put('conversations/:id/read')
  @ApiOperation({ summary: 'Mark all messages in conversation as read' })
  async markAsRead(
    @CurrentUser() user: CurrentUserPayload,
    @Param('id') conversationId: string,
  ) {
    return this.chatService.markAsRead(conversationId, user.id);
  }

  @Put('messages/:id')
  @ApiOperation({ summary: 'Edit a message' })
  async editMessage(
    @CurrentUser() user: CurrentUserPayload,
    @Param('id') messageId: string,
    @Body() editDto: EditMessageDto,
  ) {
    return this.chatService.editMessage(user.id, messageId, editDto.content);
  }

  @Delete('messages/:id')
  @ApiOperation({ summary: 'Revoke a message' })
  async revokeMessage(
    @CurrentUser() user: CurrentUserPayload,
    @Param('id') messageId: string,
  ) {
    return this.chatService.revokeMessage(user.id, messageId);
  }
}
