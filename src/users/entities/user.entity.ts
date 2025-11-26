import { PrimaryGeneratedColumn, Column, Entity, OneToMany, ManyToMany } from "typeorm";
import { Event } from "../../events/entities/event.entity";

@Entity()
export class User {
    @PrimaryGeneratedColumn("uuid")
    userId: string;

    @Column()
    username: string; //nombre de usuario, identificador en el sistema

    @Column()
    userFullName: string; //nombre "real" completo

    @Column()
    userEmail: string;

    @Column()
    userPassword: string;

    @OneToMany(() => Event, event => event.createdBy)
    createdEvents: Event[]; //eventos que ha creado

    @ManyToMany(() => Event, event => event.participants)
    joinedEvents: Event[]; //eventos a los que se ha unido
}