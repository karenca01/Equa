import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class Event {
    @PrimaryGeneratedColumn("uuid")
    eventId: string;

    @Column()
    eventName: string;

    @Column()
    eventDescription: string;

    @Column({ default: 'private' }) // private o public
    eventType: string;

}