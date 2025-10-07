import { Module } from '@nestjs/common';
import { EventsService } from './events.service';
import { EventsController } from './events.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Event } from './entities/event.entity';
import { Expense } from 'src/expenses/entities/expense.entity';
import { Expensesplit } from 'src/expensesplits/entities/expensesplit.entity';
import { User } from 'src/users/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Event, Expense, Expensesplit, User])
  ],
  controllers: [EventsController],
  providers: [EventsService],
})
export class EventsModule {}
