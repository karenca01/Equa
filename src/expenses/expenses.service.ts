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

    return await this.expenseRepository.manager.transaction(async (manager) => {
      const event = await manager.findOne(Event, {
        where: { eventId },
        relations: ['participants'],
      });
      if (!event) throw new NotFoundException('Evento no encontrado');

      const payer = await manager.findOne(User, { where: { userId } });
      if (!payer) throw new NotFoundException('Usuario no encontrado');

      const expense = manager.create(Expense, {
        expenseDescription,
        expenseAmount,
        event,
        paidBy: payer,
      });

      let totalSplit = 0;
      const splitEntities: Expensesplit[] = [];

      if (splits && splits.length > 0) {
        for (const splitDto of splits) {
          const user = await manager.findOne(User, {
            where: { userId: splitDto.userId },
          });

          if (!user)
            throw new NotFoundException(`Usuario ${splitDto.userId} no encontrado`);

          if (
            splitDto.expenseSplitAmount != null &&
            splitDto.expenseSplitPercentage != null
          ) {
            throw new BadRequestException(
              'Solo se puede usar monto fijo o porcentaje, no ambos'
            );
          }

          let finalAmount =
            splitDto.expenseSplitAmount != null
              ? splitDto.expenseSplitAmount
              : splitDto.expenseSplitPercentage != null
              ? (splitDto.expenseSplitPercentage / 100) *
                Number(expenseAmount)
              : null;

          if (finalAmount == null) {
            throw new BadRequestException(
              'Debe proporcionar monto fijo o porcentaje para cada split'
            );
          }

          totalSplit += Number(finalAmount);

          const split = manager.create(Expensesplit, {
            expense: expense, 
            user: user,
            expenseSplitAmount: finalAmount,
            expenseSplitPercentage:
              splitDto.expenseSplitPercentage ?? undefined,
          });

          splitEntities.push(split);
        }

        if (Number(totalSplit.toFixed(2)) !== Number(expenseAmount)) {
          throw new BadRequestException(
            'La suma de los splits no coincide con el total del gasto'
          );
        }
      }

      const savedExpense = await manager.save(expense);

      for (const split of splitEntities) {
        split.expense = savedExpense; 
        await manager.save(split);
      }

      return savedExpense;
    });
  }

  findAll() {
    return this.expenseRepository.find({
      relations: ['paidBy', 'event', 'splits']
    });
  }

  async findByEvent(eventId: string) {
    const expenses = await this.expenseRepository.find({
      where: { event: { eventId } },
      relations: ['paidBy', 'event', 'splits'],
    });

    return expenses; 
  }

  async findOne(id: string) {
    const expense = await this.expenseRepository.findOne({ 
      where: { expenseId: id },
      relations: ['paidBy', 'event', 'splits', 'splits.user'],
    });
    if (!expense) throw new NotFoundException(`Gasto con id ${id} no encontrado`);
    return expense;
  }

  async update(id: string, updateExpenseDto: UpdateExpenseDto) {
    const { expenseDescription, expenseAmount, splits } = updateExpenseDto;

    const expense = await this.expenseRepository.findOne({
      where: { expenseId: id },
      relations: ['splits', 'event', 'paidBy'],
    });

    if (!expense) throw new NotFoundException(`Gasto con id ${id} no encontrado`);

    if (expenseDescription !== undefined) expense.expenseDescription = expenseDescription;
    if (expenseAmount !== undefined) expense.expenseAmount = expenseAmount;

    const updatedExpense = await this.expenseRepository.save(expense);

    if (!splits) return updatedExpense;

    await this.expensesplitRepository.delete({ expense: { expenseId: id } });

    let totalSplit = 0;

    for (const splitDto of splits) {
      const user = await this.userRepository.findOne({
        where: { userId: splitDto.userId },
      });

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
        expense: updatedExpense,
        user,
        expenseSplitAmount: finalAmount,
        expenseSplitPercentage: splitDto.expenseSplitPercentage ?? undefined,
      });

      await this.expensesplitRepository.save(split);
    }

    if (Number(totalSplit.toFixed(2)) !== Number(expenseAmount)) {
      throw new BadRequestException('La suma de los splits no coincide con el total del gasto');
    }

    return updatedExpense;
  }

  async remove(id: string) {
    const result = await this.expenseRepository.delete({ expenseId: id });
    if (result.affected === 0) throw new NotFoundException(`Gasto con id ${id} no encontrado`);
    return { message: `El gasto con id ${id} fue eliminado` };
  }
}
