  import { Controller, Get, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UserService } from '../services/user.service';
import { UpdateProfileDto } from '../dto/update-profile.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import type { CurrentUserPayload } from '../../auth/decorators/current-user.decorator';
import { ResponseCode } from '../../../common/constants/response-codes';

@ApiTags('user-profiles')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('search')
  @ApiOperation({ summary: 'Search all users by full name' })
  @ApiResponse({ status: 200, description: 'Users search retrieved successfully' })
  async searchUsers(
    @Query('q') query?: string,
    @CurrentUser() user?: CurrentUserPayload,
  ) {
    const data = await this.userService.searchUsers(query, user?.id);
    return { success: true, code: ResponseCode.GET_PROFILE_SUCCESSFUL, data };
  }

  @Get('profile')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'Profile retrieved successfully' })
  async getMyProfile(@CurrentUser() user: CurrentUserPayload) {
    const data = await this.userService.getProfile(user.id, user.id);
    return { success: true, code: ResponseCode.GET_PROFILE_SUCCESSFUL, data };
  }

  @Get('profile/:id')
  @ApiOperation({ summary: 'Get user profile by ID' })
  @ApiResponse({ status: 200, description: 'Profile retrieved successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getUserProfile(@Param('id') id: string, @CurrentUser() user: CurrentUserPayload) {
    const data = await this.userService.getProfile(id, user.id);
    return { success: true, code: ResponseCode.GET_PROFILE_SUCCESSFUL, data };
  }

  @Get('profile/:id/status')
  @ApiOperation({ summary: 'Get user online status by ID' })
  @ApiResponse({ status: 200, description: 'User status retrieved successfully' })
  async getUserStatus(@Param('id') id: string) {
    const data = await this.userService.getUserStatus(id);
    return { success: true, code: ResponseCode.GET_PROFILE_SUCCESSFUL, data };
  }

  @Patch('profile')
  @ApiOperation({ summary: 'Update current user profile' })
  @ApiResponse({ status: 200, description: 'Profile updated successfully' })
  async updateProfile(
    @CurrentUser() user: CurrentUserPayload,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    const data = await this.userService.updateProfile(user.id, updateProfileDto);
    return { success: true, code: ResponseCode.UPDATE_PROFILE_SUCCESSFUL, data };
  }
}
