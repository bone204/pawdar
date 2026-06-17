import { Controller } from '@nestjs/common';
import { EncyclopediaService } from '../services/encyclopedia.service';

@Controller('encyclopedia')
export class EncyclopediaController {
  constructor(private readonly encyclopediaService: EncyclopediaService) {}
  // TODO: Define pet encyclopedia endpoints
}
