import { Module } from '@nestjs/common';
import { ExpensesplitsService } from './expensesplits.service';
import { ExpensesplitsController } from './expensesplits.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Expensesplit } from './entities/expensesplit.entity';
import { Expense } from '../expenses/entities/expense.entity';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Expensesplit, Expense, User])
  ],
  controllers: [ExpensesplitsController],
  providers: [ExpensesplitsService],
})
export class ExpensesplitsModule {}
