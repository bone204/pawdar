import { Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { BreedService } from '../services/breed.service';
import { BreedQueryDto } from '../dto/breed-query.dto';
import { ResponseCode } from '../../../common/constants/response-codes';

@ApiTags('breeds')
@Controller('breeds')
export class BreedController {
  constructor(private readonly breedService: BreedService) {}

  @Get()
  @ApiOperation({ summary: 'Get all breeds with optional filter by petType and lang' })
  @ApiResponse({ status: 200, description: 'List of breeds in the requested language' })
  async findAll(@Query() query: BreedQueryDto) {
    const data = await this.breedService.findAll({
      petType: query.petType,
      search: query.search,
      page: query.page ?? 1,
      limit: query.limit ?? 20,
      lang: query.lang ?? 'vi',
    });
    return {
      success: true,
      code: ResponseCode.GET_BREEDS_SUCCESSFUL,
      data,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single breed by ID' })
  @ApiResponse({ status: 200, description: 'Breed detail' })
  @ApiResponse({ status: 404, description: 'Breed not found' })
  async findOne(@Param('id') id: string, @Query() query: BreedQueryDto) {
    const data = await this.breedService.findById(id, query.lang ?? 'vi');
    return {
      success: true,
      code: ResponseCode.GET_BREED_DETAIL_SUCCESSFUL,
      data,
    };
  }

  @Post('sync')
  @ApiOperation({
    summary: 'Sync all breeds from Cat API and Dog API into the database',
    description: 'Run this once after deployment or whenever you want to update breed data.',
  })
  @ApiResponse({ status: 201, description: 'Sync completed' })
  async syncBreeds() {
    const result = await this.breedService.syncAll();
    return {
      message: 'Breed sync completed successfully',
      synced: result,
    };
  }
}
