import { Injectable } from '@nestjs/common';
import { RadarRepository } from '../repositories/radar.repository';

@Injectable()
export class RadarService {
  constructor(private readonly radarRepository: RadarRepository) {}
  // TODO: Implement lost & found radar business logic
}
