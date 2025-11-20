import { Injectable } from '@nestjs/common';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Event } from './entities/event.entity';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { Expense } from 'src/expenses/entities/expense.entity';
import { Expensesplit } from 'src/expensesplits/entities/expensesplit.entity';
import { User } from 'src/users/entities/user.entity';
import { In } from 'typeorm';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event)
    private eventRepository: Repository<Event>,
    @InjectRepository(Expense)
    private expenseRepository: Repository<Expense>,
    @InjectRepository(Expensesplit)
    private expensesplitRepository: Repository<Expensesplit>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  //TODO: crear dto con usuario

  async create(createEventDto: CreateEventDto) {
    const user = await this.userRepository.findOne({
      where: { userId: createEventDto.createdBy }
    });

    if (!user) {
      throw new NotFoundException("Usuario no encontrado");
    }

    const event = this.eventRepository.create({
      ...createEventDto,
      createdBy: user.userId,
    });

    return await this.eventRepository.save(event);
  }

  findAll() {
    return this.eventRepository.find({
      relations:["createdBy", "participants", "expenses"]
    });
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

  async addParticipants(eventId: string, participantIds: string[]) {
    const event = await this.eventRepository.findOne({
      where: { eventId: eventId },
      relations: ['participants'],
    });
    if(!event) throw new NotFoundException(`No se encuentra el evento: ${eventId}`);

    const users = await this.userRepository.find({ 
      // where: participantIds.map(id=>({userId: id})),
      where: { userId: In(participantIds) }
    });

    if(users.length === 0) throw new NotFoundException(`No se encuentran usuarios`);

    event.participants = [...event.participants, ...users];

    event.participants = event.participants.filter(
      // u: usuario actual que se esta revisando
      // i: posición del usuario en el arreglo
      // arr: arreglo -> event.participants
      // p: variable de elementos del arreglo
      (u, i, arr) => arr.findIndex(p => p.userId === u.userId) === i
    )

    await this.eventRepository.save(event);

    return{
      message: 'Participantes exitosamente agregados',
      participants: event.participants
    }
  }

  async deleteParticipants(eventId: string, participantIds: string[]) {
    const event = await this.eventRepository.findOne({
      where: { eventId: eventId },
      relations: ['participants'],
    });
    if (!event) throw new NotFoundException(`No se encuentra el evento: ${eventId}`);

    event.participants = event.participants.filter(
      (participant) => !participantIds.includes(participant.userId),
    );

    await this.eventRepository.save(event);

    return {
      message: 'Participantes eliminados exitosamente',
      participants: event.participants,
    };
  }

  async getEventSummary(eventId: string) {
    const expenseses = await this.expenseRepository.find({
      where: { event: {eventId: eventId} },
      relations: ['paidBy', 'splits', 'splits.user'],
    });

    const balances: Record<number, { user:User; paid: number; owes: number }> = {};
    for(const expense of expenseses) {
      const playerId = expense.paidBy.userId;
      if(!balances[playerId]) {
        balances[playerId] = {
          user: expense.paidBy,
          paid: 0,
          owes: 0,
        }
      }
      balances[playerId].paid += expense.expenseAmount;

      for(const split of expense.splits) {
        const userId = split.user.userId;
        if(!balances[userId]) {
          balances[userId] = {
            user: split.user,
            paid: 0,
            owes: 0,
          }
        }
        balances[userId].owes += split.expenseSplitAmount;
      }
    }

    const result = Object.values(balances).map(b => ({
      userId: b.user.userId,
      userName: b.user.userFullName,
      paid: b.paid,
      owes: b.owes,
      balance: b.paid - b.owes,
    }));

    return result;
  }
}
