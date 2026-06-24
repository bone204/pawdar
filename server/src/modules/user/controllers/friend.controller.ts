import { Controller, Get, Post, Delete, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { FriendService } from '../services/friend.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import type { CurrentUserPayload } from '../../auth/decorators/current-user.decorator';
import { ResponseCode } from '../../../common/constants/response-codes';

@ApiTags('friends')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('user/friends')
export class FriendController {
  constructor(private readonly friendService: FriendService) {}

  @Post('request/:receiverId')
  @ApiOperation({ summary: 'Send a friend request to a user' })
  @ApiResponse({ status: 201, description: 'Friend request sent successfully' })
  async sendFriendRequest(
    @CurrentUser() user: CurrentUserPayload,
    @Param('receiverId') receiverId: string,
  ) {
    const data = await this.friendService.sendFriendRequest(user.id, receiverId);
    return { success: true, code: ResponseCode.FRIEND_REQUEST_SENT, data };
  }

  @Post('accept/:senderId')
  @ApiOperation({ summary: 'Accept a pending friend request' })
  @ApiResponse({ status: 200, description: 'Friend request accepted successfully' })
  async acceptFriendRequest(
    @CurrentUser() user: CurrentUserPayload,
    @Param('senderId') senderId: string,
  ) {
    const data = await this.friendService.acceptFriendRequest(user.id, senderId);
    return { success: true, code: ResponseCode.FRIEND_REQUEST_ACCEPTED, data };
  }

  @Post('decline/:senderId')
  @ApiOperation({ summary: 'Decline or cancel a pending friend request' })
  @ApiResponse({ status: 200, description: 'Friend request declined/cancelled successfully' })
  async declineFriendRequest(
    @CurrentUser() user: CurrentUserPayload,
    @Param('senderId') senderId: string,
  ) {
    const data = await this.friendService.declineFriendRequest(user.id, senderId);
    return { success: true, code: ResponseCode.FRIEND_REQUEST_DECLINED, data };
  }

  @Delete(':friendId')
  @ApiOperation({ summary: 'Remove a friend' })
  @ApiResponse({ status: 200, description: 'Unfriended successfully' })
  async unfriend(
    @CurrentUser() user: CurrentUserPayload,
    @Param('friendId') friendId: string,
  ) {
    const data = await this.friendService.unfriend(user.id, friendId);
    return { success: true, code: ResponseCode.UNFRIENDED_SUCCESSFUL, data };
  }

  @Get()
  @ApiOperation({ summary: 'Get friends list with pagination and search' })
  @ApiResponse({ status: 200, description: 'Friends list retrieved successfully' })
  async getFriends(
    @CurrentUser() user: CurrentUserPayload,
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;
    const data = await this.friendService.getFriends(user.id, search, pageNum, limitNum);
    return { success: true, code: ResponseCode.GET_FRIENDS_SUCCESSFUL, data };
  }

  @Get('requests/received')
  @ApiOperation({ summary: 'Get list of received pending friend requests' })
  @ApiResponse({ status: 200, description: 'Received requests retrieved successfully' })
  async getReceivedRequests(@CurrentUser() user: CurrentUserPayload) {
    const data = await this.friendService.getReceivedFriendRequests(user.id);
    return { success: true, code: ResponseCode.GET_FRIEND_REQUESTS_SUCCESSFUL, data };
  }

  @Get('requests/sent')
  @ApiOperation({ summary: 'Get list of sent pending friend requests' })
  @ApiResponse({ status: 200, description: 'Sent requests retrieved successfully' })
  async getSentRequests(@CurrentUser() user: CurrentUserPayload) {
    const data = await this.friendService.getSentFriendRequests(user.id);
    return { success: true, code: ResponseCode.GET_FRIEND_REQUESTS_SUCCESSFUL, data };
  }
}
