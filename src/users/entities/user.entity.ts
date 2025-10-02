import { PrimaryGeneratedColumn, Column, Entity, OneToMany, ManyToMany } from "typeorm";
import { Event } from "../../events/entities/event.entity";

@Entity()
export class User {
    @PrimaryGeneratedColumn("uuid")
    userId: string;

    @Column()
    username: string;

    @Column()
    userFullName: string;

    @Column()
    userEmail: string;

    @Column()
    userPassword: string;

    @OneToMany(() => Event, event => event.createdBy)
    createdEvents: Event[];

    @ManyToMany(() => Event, event => event.participants)
    joinedEvents: Event[];
}
