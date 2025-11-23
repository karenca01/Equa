import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { Expense } from "../../expenses/entities/expense.entity";
import { User } from "../../users/entities/user.entity";

@Entity()
export class Expensesplit {
  @PrimaryGeneratedColumn("uuid")
  expenseSplitId: string;

  @ManyToOne(() => Expense, expense => expense.splits,{
    onDelete: 'CASCADE'
  })
  @JoinColumn({
    name: 'expense',
  })
  expense: Expense;

  @ManyToOne(() => User)
  @JoinColumn({
    name: 'user',
  })
  user: User; // quién debe pagar

  @Column('decimal', { nullable: true, precision: 10, scale: 2 })
  expenseSplitAmount?: number;

  @Column('decimal', { nullable: true, precision: 5, scale: 2 })
  expenseSplitPercentage?: number;
}
