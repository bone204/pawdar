import { Injectable } from '@nestjs/common';

@Injectable()
export class HealthService {
  getHealthStatus(): string {
    return 'Hello World!';
  }
}
