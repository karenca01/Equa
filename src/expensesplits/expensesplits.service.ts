import { Injectable } from '@nestjs/common';
import { CreateExpensesplitDto } from './dto/create-expensesplit.dto';
import { UpdateExpensesplitDto } from './dto/update-expensesplit.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Expensesplit } from './entities/expensesplit.entity';
import { Repository } from 'typeorm';
import { Expense } from '../expenses/entities/expense.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class ExpensesplitsService {
  constructor(
    @InjectRepository(Expensesplit)
    private expensesplitRepository: Repository<Expensesplit>,
  ) {}

  async create(dto: CreateExpensesplitDto) {
    const expense = await this.expensesplitRepository.manager.findOne(Expense, {
      where: { expenseId: dto.expenseId },
    });

    const user = await this.expensesplitRepository.manager.findOne(User, {
      where: { userId: dto.userId },
    });

    if (!expense) throw new Error('Expense no encontrado');
    if (!user) throw new Error('User no encontrado');

    const split = this.expensesplitRepository.create({
      expense,
      user,
      expenseSplitAmount: dto.expenseSplitAmount,
      expenseSplitPercentage: dto.expenseSplitPercentage,
    });

    return this.expensesplitRepository.save(split);
  }

  findAll() {
    return this.expensesplitRepository.find({
      relations: ['expense', 'user'],
    });
  }

  async findOne(id: string) {
    const expenseSplit = await this.expensesplitRepository.findOne({
      where: { expenseSplitId: id },
      relations: ['expense', 'user'],
    });

    if (!expenseSplit) throw new Error(`No existe el split con ID ${id}`);

    return expenseSplit;
  }

  async update(id: string, dto: UpdateExpensesplitDto) {
    const expenseSplitToUpdate = await this.expensesplitRepository.preload({
      expenseSplitId: id,
      ...dto,
    });

    if (!expenseSplitToUpdate)
      throw new Error(`No existe split con ID ${id}`);

    return this.expensesplitRepository.save(expenseSplitToUpdate);
  }

  async remove(id: string) {
    const result = await this.expensesplitRepository.delete(id);

    if (result.affected === 0)
      throw new Error(`No existe el split con ID ${id}`);

    return {
      message: `Split ${id} eliminado correctamente.`,
    };
  }
}
