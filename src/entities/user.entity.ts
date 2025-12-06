import {Entity, Column,PrimaryGeneratedColumn} from 'typeorm'

@Entity({name:'users'})
export class Users{
    @PrimaryGeneratedColumn()
    id:number;

    @Column()
    email:string;

    @Column()
    displayname:string;
}