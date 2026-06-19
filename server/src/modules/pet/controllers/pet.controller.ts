import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { PetService } from '../services/pet.service';
import { CreatePetDto } from '../dto/create-pet.dto';
import { UpdatePetDto } from '../dto/update-pet.dto';
import { PetQueryDto } from '../dto/pet-query.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import type { CurrentUserPayload } from '../../auth/decorators/current-user.decorator';
import { ResponseCode } from '../../../common/constants/response-codes';

@ApiTags('pets')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('pets')
export class PetController {
  constructor(private readonly petService: PetService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new pet for the logged-in user' })
  @ApiResponse({ status: 201, description: 'Pet created successfully' })
  async create(@CurrentUser() user: CurrentUserPayload, @Body() createPetDto: CreatePetDto) {
    const data = await this.petService.create(user, createPetDto);
    return { success: true, code: ResponseCode.CREATE_PET_SUCCESSFUL, data };
  }

  @Get('me')
  @ApiOperation({ summary: 'Get pets of the logged-in user with optional search + pagination' })
  @ApiResponse({ status: 200, description: 'Paginated list of user pets' })
  async findMe(@CurrentUser() user: CurrentUserPayload, @Query() query: PetQueryDto) {
    const data = await this.petService.findMe(user, {
      petType: query.petType,
      search: query.search,
      page: query.page ? parseInt(query.page, 10) : 1,
      limit: query.limit ? parseInt(query.limit, 10) : 8,
    });
    return { success: true, code: ResponseCode.GET_MY_PETS_SUCCESSFUL, data };
  }

  @Get()
  @ApiOperation({ summary: 'Get all pets in the system with optional search + pagination' })
  @ApiResponse({ status: 200, description: 'Paginated list of all pets' })
  async findAll(@Query() query: PetQueryDto) {
    const data = await this.petService.findAll({
      petType: query.petType,
      search: query.search,
      page: query.page ? parseInt(query.page, 10) : 1,
      limit: query.limit ? parseInt(query.limit, 10) : 8,
    });
    return { success: true, code: ResponseCode.GET_ALL_PETS_SUCCESSFUL, data };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific pet by ID' })
  @ApiResponse({ status: 200, description: 'Pet details' })
  @ApiResponse({ status: 404, description: 'Pet not found' })
  async findOne(@Param('id') id: string, @CurrentUser() user: CurrentUserPayload) {
    const data = await this.petService.findById(id, user);
    return { success: true, code: ResponseCode.GET_PET_DETAIL_SUCCESSFUL, data };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a specific pet by ID' })
  @ApiResponse({ status: 200, description: 'Pet updated successfully' })
  async update(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserPayload,
    @Body() updatePetDto: UpdatePetDto,
  ) {
    const data = await this.petService.update(id, user, updatePetDto);
    return { success: true, code: ResponseCode.UPDATE_PET_SUCCESSFUL, data };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete a specific pet by ID' })
  @ApiResponse({ status: 200, description: 'Pet deleted successfully' })
  async remove(@Param('id') id: string, @CurrentUser() user: CurrentUserPayload) {
    const data = await this.petService.softDelete(id, user);
    return { success: true, code: ResponseCode.DELETE_PET_SUCCESSFUL, data };
  }
}
