import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Expense } from './entities/expense.entity';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { Event } from '../events/entities/event.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class ExpensesService {
  constructor(
    @InjectRepository(Expense)
    private readonly expenseRepository: Repository<Expense>,

    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createExpenseDto: CreateExpenseDto, userId: string) {
    const { expenseDescription, expenseAmount, eventId } = createExpenseDto;

    const event = await this.eventRepository.findOne({
      where: { eventId },
      relations: ['paidBy', 'event', 'splits'],
    });
    if (!event) throw new NotFoundException('Evento no encontrado');

    const user = await this.userRepository.findOne({ where: { userId } });
    if (!user) throw new NotFoundException('Usuario no encontrado');

    const expense = this.expenseRepository.create({
      expenseDescription,
      expenseAmount,
      event,
      paidBy: user,
    });

    return this.expenseRepository.save(expense);
  }

  findAll() {
    return this.expenseRepository.find();
  }

  async findByEvent(eventId: string) {
    const expenses = await this.expenseRepository.find({
      where: { event: { eventId } },
      relations: ['paidBy', 'event', 'splits'],
    });

    return expenses; // TypeORM ya devuelve []
  }

  async findOne(id: string) {
    const expense = await this.expenseRepository.findOne({ where: { expenseId: id } });
    if (!expense) throw new NotFoundException(`Gasto con id ${id} no encontrado`);
    return expense;
  }

  async update(id: string, updateExpenseDto: UpdateExpenseDto) {
    const expenseToUpdate = await this.expenseRepository.preload({
      expenseId: id,
      ...updateExpenseDto,
    });
    if (!expenseToUpdate) throw new NotFoundException(`Gasto con id ${id} no encontrado`);

    return this.expenseRepository.save(expenseToUpdate);
  }

  async remove(id: string) {
    const result = await this.expenseRepository.delete({ expenseId: id });
    if (result.affected === 0) throw new NotFoundException(`Gasto con id ${id} no encontrado`);
    return { message: `El gasto con id ${id} fue eliminado` };
  }
}
