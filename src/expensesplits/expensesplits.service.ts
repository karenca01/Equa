import { Injectable } from '@nestjs/common';
import { CreateExpensesplitDto } from './dto/create-expensesplit.dto';
import { UpdateExpensesplitDto } from './dto/update-expensesplit.dto';
import { In } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Expensesplit } from './entities/expensesplit.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ExpensesplitsService {
  constructor(
    @InjectRepository(Expensesplit)
    private expensesplitRepository: Repository<Expensesplit>,
  ) {}

  create(createExpensesplitDto: CreateExpensesplitDto) {
    return this.expensesplitRepository.save(createExpensesplitDto);
  }

  findAll() {
    return this.expensesplitRepository.find();
  }

  findOne(id: string) {
    const expenseSplit = this.expensesplitRepository.findOneBy({ expenseSplitId: id });

    if (!expenseSplit) throw new Error(`No se encuentra el evento: ${id}`);
    return expenseSplit;
  }

  async update(id: string, updateExpensesplitDto: UpdateExpensesplitDto) {
    const expenseSplitToUpdate = await this.expensesplitRepository.preload({
      expenseSplitId: id,
      ...updateExpensesplitDto,
    })

    if (!expenseSplitToUpdate) throw new Error(`No se encuentra la relación: ${id}`); 
    this.expensesplitRepository.save(expenseSplitToUpdate);
    return expenseSplitToUpdate;
  }

  remove(id: string) {
    this.expensesplitRepository.delete({ expenseSplitId: id });

    return {
      message: `La relación con id ${id} fue eliminado`
    }
  }
}
