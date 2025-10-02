import { Module } from '@nestjs/common';
import { ExpensesplitsService } from './expensesplits.service';
import { ExpensesplitsController } from './expensesplits.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Expensesplit } from './entities/expensesplit.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Expensesplit])
  ],
  controllers: [ExpensesplitsController],
  providers: [ExpensesplitsService],
})
export class ExpensesplitsModule {}
