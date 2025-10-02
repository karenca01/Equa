import { PrimaryGeneratedColumn, Column, Entity } from "typeorm";

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
}
