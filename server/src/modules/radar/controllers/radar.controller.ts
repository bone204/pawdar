import { Controller } from '@nestjs/common';
import { RadarService } from '../services/radar.service';

@Controller('radar')
export class RadarController {
  constructor(private readonly radarService: RadarService) {}
  // TODO: Define lost & found radar endpoints
}
