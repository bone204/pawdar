import { Injectable } from '@nestjs/common';
import { EncyclopediaRepository } from '../repositories/encyclopedia.repository';

@Injectable()
export class EncyclopediaService {
  constructor(
    private readonly encyclopediaRepository: EncyclopediaRepository,
  ) {}
  // TODO: Implement pet encyclopedia business logic
}
