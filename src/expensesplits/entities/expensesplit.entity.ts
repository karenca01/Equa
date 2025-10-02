import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { Expense } from "../../expenses/entities/expense.entity";
import { User } from "../../users/entities/user.entity";

@Entity()
export class Expensesplit {
  @PrimaryGeneratedColumn("uuid")
  expenseSplitId: string;

//   @ManyToOne(() => Expense, expense => expense.splits)
//   expense: Expense;

//   @ManyToOne(() => User)
//   user: User; // quién debe pagar

  @Column('decimal', { nullable: true })
  expenseSplitAmount: number; // si se divide por monto fijo

  @Column('decimal', { nullable: true })
  expenseSplitPercentage: number; // si se divide por porcentaje
}
