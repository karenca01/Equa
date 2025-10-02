import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinTable, ManyToMany, JoinColumn } from "typeorm";
import { User } from "../../users/entities/user.entity";
import { Expense } from "../../expenses/entities/expense.entity";

@Entity()
export class Event {
    @PrimaryGeneratedColumn("uuid")
    eventId: string;

    @Column()
    eventName: string;

    @Column()
    eventDescription: string;

    @Column({ default: 'Private' }) // private o public
    eventType: string;

    @ManyToOne(() => User, user => user.createdEvents)
    @JoinColumn({
        name: 'createdBy',
    })
    createdBy: User;

    @ManyToMany(() => User, user => user.joinedEvents)
    @JoinTable()
    participants: User[];

    @OneToMany(() => Expense, expense => expense.event)
    expenses: Expense[];
}