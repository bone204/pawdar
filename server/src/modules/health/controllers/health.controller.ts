import { Controller, Get } from '@nestjs/common';
import { HealthService } from '../services/health.service';

@Controller()
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  getHealth(): string {
    return this.healthService.getHealthStatus();
  }
}
