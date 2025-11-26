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

    // @ManyToOne(() => User, user => user.createdEvents)
    // @JoinColumn({
    //     name: 'createdBy',
    // })
    // createdBy: string;

    @ManyToOne(() => User, user => user.createdEvents)
    @JoinColumn({ name: 'createdBy' })
    createdBy: User; // el usuario que creó el evento

    @Column()
    createdById: string;


    @ManyToMany(() => User, user => user.joinedEvents)
    @JoinTable()
    participants: User[]; //los usuarios que se agregaron al evento

    @OneToMany(() => Expense, expense => expense.event)
    expenses: Expense[]; //relación con los gastos
}