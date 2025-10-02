import { Injectable } from '@nestjs/common';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Expense } from './entities/expense.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ExpensesService {
  constructor(
    @InjectRepository(Expense)
    private expenseRepository: Repository<Expense>,
  ) {}

  create(createExpenseDto: CreateExpenseDto) {
    return this.expenseRepository.save(createExpenseDto);
  }

  findAll() {
    return this.expenseRepository.find();
  }

  findOne(id: string) {
    const expense = this.expenseRepository.findOneBy({ expenseId: id });

    if (!expense) throw new Error(`No se encuentra el evento: ${id}`);
    return expense;
  }

  async update(id: string, updateExpenseDto: UpdateExpenseDto) {
    const expenseToUpdate = await this.expenseRepository.preload({
      expenseId: id,
      ...updateExpenseDto,
    })

    if (!expenseToUpdate) throw new Error(`No se encuentra el evento: ${id}`); 
    this.expenseRepository.save(expenseToUpdate);
    return expenseToUpdate;
  }

  remove(id: string) {
    this.expenseRepository.delete({ expenseId: id });

    return {
      message: `El evento con id ${id} fue eliminado`
    }
  }
}
