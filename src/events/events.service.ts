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
import { ForbiddenException } from '@nestjs/common';

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

  async create(createEventDto: CreateEventDto) {
    const user = await this.userRepository.findOne({
      where: { userId: createEventDto.createdBy },
    });

    if (!user) throw new NotFoundException("Usuario no encontrado");

    const { createdBy, ...rest } = createEventDto;

    //se asiganan campos asignando datos
    //en relación con el usuario que creó el evento
    const event = this.eventRepository.create({
      ...rest,
      createdBy: user,
      createdById: user.userId,
      participants: [user],
    });

    return this.eventRepository.save(event);
  }

  findAll() {
    return this.eventRepository.find({
      relations:["createdBy", "participants", "expenses"]
    });
  }

  findOne(id: string) {
    const event = this.eventRepository.findOne({
      where: { eventId: id },
      relations: ["createdBy", "participants", "expenses"],
    });

    if (!event) throw new NotFoundException(`No se encuentra el evento: ${id}`);
    return event;
  }

  async update(id: string, updateEventDto: UpdateEventDto) {
    const { createdBy, ...rest } = updateEventDto;
    const payload: any = {
      eventId: id,
      ...rest
    };

    if (createdBy) {
      payload.createdBy = { userId: createdBy };
    }

    const eventToUpdate = await this.eventRepository.preload(payload);

    if (!eventToUpdate) { throw new NotFoundException(`Evento con id ${id} no encontrado`); }
    return await this.eventRepository.save(eventToUpdate);
}


  // remove(id: string) {
  //   this.eventRepository.delete({ eventId: id });

  //   return {
  //     message: `El evento con id ${id} fue eliminado`
  //   }
  // }

  async remove(eventId: string, userId: string) {
    const event = await this.eventRepository.findOne({
      where: { eventId },
      relations: ['createdBy'],
    });

    if (!event) throw new NotFoundException('Evento no encontrado');

    //no puede editarlo si no es el creador
    if (event.createdBy.userId !== userId) {
      throw new ForbiddenException('No tienes permiso para eliminar este evento');
    }

    await this.eventRepository.remove(event);
    return { message: 'Evento eliminado correctamente' };
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

  async getEventParticipants(eventId: string) {
    const event = await this.eventRepository.findOne({
      where: { eventId },
      relations: ["participants", "createdBy"],
    });

    if (!event) {
      throw new NotFoundException("Evento no encontrado");
    }

    // return event.participants;
    return event.participants.map((p) => ({
      userId: p.userId,
      userFullName: p.userFullName,
      userEmail: p.userEmail,
      isCreator: p.userId === event.createdById, //para saber si es el creador
    }))
  }

  async getEventBalances(eventId: string) {
    const event = await this.eventRepository.findOne({
      where: { eventId },
      relations: [
        'participants',
        'expenses',
        'expenses.paidBy',
        'expenses.splits',
        'expenses.splits.user'
      ]
    });

    if (!event) throw new NotFoundException('Evento no encontrado');

    const participants = event.participants;

    // Inicializar matriz de deudas
    const balances: Record<string, Record<string, number>> = {};

    for (const p of participants) {
      balances[p.userId] = {};
      for (const q of participants) {
        balances[p.userId][q.userId] = 0;
      }
    }

    // Procesar cada gasto
    for (const expense of event.expenses) {
      const payer = expense.paidBy.userId;

      for (const split of expense.splits) {
        const debtor = split.user.userId;
        const amount = Number(split.expenseSplitAmount);

        // El deudor le debe al pagador
        balances[debtor][payer] += amount;
      }
    }

    // Compensación: netear deudas
    for (const u1 of participants) {
      for (const u2 of participants) {
        const a = balances[u1.userId][u2.userId];
        const b = balances[u2.userId][u1.userId];

        if (a > b) {
          balances[u1.userId][u2.userId] = Number((a - b).toFixed(2));
          balances[u2.userId][u1.userId] = 0;
        } else {
          balances[u2.userId][u1.userId] = Number((b - a).toFixed(2));
          balances[u1.userId][u2.userId] = 0;
        }
      }
    }
    return {
      participants,
      balances,
    };
  }
}