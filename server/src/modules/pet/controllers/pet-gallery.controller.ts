import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { PetGalleryService } from '../services/pet-gallery.service';
import { CreateGalleryDto } from '../dto/create-gallery.dto';
import { UpdateGalleryDto } from '../dto/update-gallery.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import type { CurrentUserPayload } from '../../auth/decorators/current-user.decorator';
import { ResponseCode } from '../../../common/constants/response-codes';

@ApiTags('pet-gallery')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('pets/:petId/gallery')
export class PetGalleryController {
  constructor(private readonly petGalleryService: PetGalleryService) {}

  @Post()
  @ApiOperation({ summary: 'Add a new image to the pet gallery' })
  @ApiResponse({ status: 201, description: 'Gallery image added successfully' })
  async create(
    @Param('petId') petId: string,
    @CurrentUser() user: CurrentUserPayload,
    @Body() createGalleryDto: CreateGalleryDto,
  ) {
    const data = await this.petGalleryService.create(petId, user, createGalleryDto);
    return { success: true, code: ResponseCode.CREATE_GALLERY_SUCCESSFUL, data };
  }

  @Get()
  @ApiOperation({ summary: 'Get all gallery images for a pet' })
  @ApiResponse({ status: 200, description: 'List of pet gallery images' })
  async findAll(@Param('petId') petId: string, @CurrentUser() user: CurrentUserPayload) {
    const data = await this.petGalleryService.findAllByPetId(petId, user);
    return { success: true, code: ResponseCode.GET_GALLERY_SUCCESSFUL, data };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific gallery image details' })
  @ApiResponse({ status: 200, description: 'Gallery image details' })
  @ApiResponse({ status: 404, description: 'Gallery image not found' })
  async findOne(
    @Param('petId') petId: string,
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    const data = await this.petGalleryService.findById(petId, id, user);
    return { success: true, code: ResponseCode.GET_GALLERY_DETAIL_SUCCESSFUL, data };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a specific gallery image' })
  @ApiResponse({ status: 200, description: 'Gallery image updated successfully' })
  async update(
    @Param('petId') petId: string,
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserPayload,
    @Body() updateGalleryDto: UpdateGalleryDto,
  ) {
    const data = await this.petGalleryService.update(petId, id, user, updateGalleryDto);
    return { success: true, code: ResponseCode.UPDATE_GALLERY_SUCCESSFUL, data };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a specific gallery image' })
  @ApiResponse({ status: 200, description: 'Gallery image deleted successfully' })
  async remove(
    @Param('petId') petId: string,
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    const data = await this.petGalleryService.delete(petId, id, user);
    return { success: true, code: ResponseCode.DELETE_GALLERY_SUCCESSFUL, data };
  }
}
