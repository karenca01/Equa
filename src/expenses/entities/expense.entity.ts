import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from "typeorm";

@Entity()
export class Expense {
  @PrimaryGeneratedColumn("uuid")
  expenseId: string;

  @Column()
  expenseDescription: string;

  @Column('decimal')
  expenseAmount: number;
}
