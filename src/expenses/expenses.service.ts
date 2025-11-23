import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Expense } from './entities/expense.entity';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { Event } from '../events/entities/event.entity';
import { User } from '../users/entities/user.entity';
import { Expensesplit } from '../expensesplits/entities/expensesplit.entity';
import { BadRequestException } from '@nestjs/common';

@Injectable()
export class ExpensesService {
  constructor(
    @InjectRepository(Expense)
    private readonly expenseRepository: Repository<Expense>,

    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Expensesplit)
    private readonly expensesplitRepository: Repository<Expensesplit>,
  ) {}

  async create(createExpenseDto: CreateExpenseDto, userId: string) {
    const { expenseDescription, expenseAmount, eventId, splits } = createExpenseDto;

    const event = await this.eventRepository.findOne({ 
      where: { eventId }, 
      relations: ['participants'] 
    });
    if (!event) throw new NotFoundException('Evento no encontrado');

    const payer = await this.userRepository.findOne({ where: { userId } });
    if (!payer) throw new NotFoundException('Usuario no encontrado');

    const expense = this.expenseRepository.create({
      expenseDescription,
      expenseAmount,
      event,
      paidBy: payer,
    });
    const savedExpense = await this.expenseRepository.save(expense);

    if (splits && splits.length > 0) {
      let totalSplit = 0;

      for (const splitDto of splits) {
        const user = await this.userRepository.findOne({ where: { userId: splitDto.userId } });
        if (!user) throw new NotFoundException(`Usuario ${splitDto.userId} no encontrado`);

        if (splitDto.expenseSplitAmount != null && splitDto.expenseSplitPercentage != null) {
          throw new BadRequestException('Solo se puede usar monto fijo o porcentaje, no ambos');
        }

        let finalAmount = splitDto.expenseSplitAmount;
        if (splitDto.expenseSplitPercentage != null) {
          finalAmount = (splitDto.expenseSplitPercentage / 100) * Number(expenseAmount);
        }

        if (finalAmount == null) {
          throw new BadRequestException('Debe proporcionar monto fijo o porcentaje para cada split');
        }

        totalSplit += Number(finalAmount);

        const split = this.expensesplitRepository.create({
          expense: savedExpense,
          user,
          expenseSplitAmount: finalAmount,
          expenseSplitPercentage: splitDto.expenseSplitPercentage ?? undefined,
        });

        await this.expensesplitRepository.save(split);
      }

      if (Number(totalSplit.toFixed(2)) !== Number(expenseAmount)) {
        throw new BadRequestException('La suma de los splits no coincide con el total del gasto');
      }
    }

    return savedExpense;
  }

  findAll() {
    return this.expenseRepository.find();
  }

  async findByEvent(eventId: string) {
    const expenses = await this.expenseRepository.find({
      where: { event: { eventId } },
      relations: ['paidBy', 'event', 'splits'],
    });

    return expenses; 
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
