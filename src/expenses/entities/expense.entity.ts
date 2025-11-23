import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Event } from '../../events/entities/event.entity';
import { Expensesplit } from '../../expensesplits/entities/expensesplit.entity';

@Entity()
export class Expense {
  @PrimaryGeneratedColumn('uuid')
  expenseId: string;

  @Column()
  expenseDescription: string;

  @Column('decimal', { precision: 10, scale: 2 })
  expenseAmount: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'paidBy' })
  paidBy: User; // quién pagó

  @ManyToOne(() => Event, (event) => event.expenses, { onDelete: 'CASCADE'})
  @JoinColumn({ name: 'eventId' })
  event: Event;

  @OneToMany(() => Expensesplit, (split) => split.expense)
  splits: Expensesplit[];
}
