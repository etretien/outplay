import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import EventEntity from './event.entity';

@Injectable()
export class EventService {
  constructor(
    @InjectRepository(EventEntity)
    private readonly userRepository: Repository<EventEntity>,
  ) {}
}
