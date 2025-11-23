import { Module } from '@nestjs/common';
import { ExpensesService } from './expenses.service';
import { ExpensesController } from './expenses.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Expense } from './entities/expense.entity';
import { User } from '../users/entities/user.entity';
import { Event } from '../events/entities/event.entity';
import { Expensesplit } from '../expensesplits/entities/expensesplit.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Expense, User, Event, Expensesplit]),
  ],
  controllers: [ExpensesController],
  providers: [ExpensesService],
})
export class ExpensesModule {}
