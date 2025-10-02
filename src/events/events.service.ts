import { Injectable } from '@nestjs/common';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Event } from './entities/event.entity';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event)
    private eventRepository: Repository<Event>,
  ) {}
  create(createEventDto: CreateEventDto) {
    return this.eventRepository.save(createEventDto);
  }

  findAll() {
    return this.eventRepository.find();
  }

  findOne(id: string) {
    const event = this.eventRepository.findOneBy({ eventId: id });

    if (!event) throw new NotFoundException(`No se encuentra el evento: ${id}`);
    return event;
  }

  async update(id: string, updateEventDto: UpdateEventDto) {
    const eventToUpdate = await this.eventRepository.preload({
      eventId: id,
      ...updateEventDto,
    })

    if (!eventToUpdate) throw new NotFoundException(`No se encuentra el evento: ${id}`); 
    this.eventRepository.save(eventToUpdate);
    return eventToUpdate;
  }

  remove(id: string) {
    this.eventRepository.delete({ eventId: id });

    return {
      message: `El evento con id ${id} fue eliminado`
    }
  }
}
