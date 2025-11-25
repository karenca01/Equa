import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Expensesplit } from './entities/expensesplit.entity';
import { UpdateExpensesplitDto } from './dto/update-expensesplit.dto';

@Injectable()
export class ExpensesplitsService {
  constructor(
    @InjectRepository(Expensesplit)
    private readonly expensesplitRepository: Repository<Expensesplit>,
  ) {}

  findAll() {
    return this.expensesplitRepository.find({ relations: ['expense', 'user'] });
  }

  findByExpense(expenseId: string) {
    return this.expensesplitRepository.find({
      where: { expense: { expenseId } },
      relations: ['expense','expense.paidBy', 'user'],
    });
  }

  async findOne(id: string) {
    const split = await this.expensesplitRepository.findOne({
      where: { expenseSplitId: id },
      relations: ['expense', 'user'],
    });
    if (!split) throw new NotFoundException(`Split con id ${id} no encontrado`);
    return split;
  }

  async update(id: string, updateDto: UpdateExpensesplitDto) {
    const splitToUpdate = await this.expensesplitRepository.preload({
      expenseSplitId: id,
      ...updateDto,
    });
    if (!splitToUpdate) throw new NotFoundException(`Split con id ${id} no encontrado`);
    return this.expensesplitRepository.save(splitToUpdate);
  }

  async remove(id: string) {
    const result = await this.expensesplitRepository.delete({ expenseSplitId: id });
    if (result.affected === 0) throw new NotFoundException(`Split con id ${id} no encontrado`);
    return { message: `Split con id ${id} eliminado correctamente` };
  }
}
