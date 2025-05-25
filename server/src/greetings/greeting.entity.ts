import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn
} from 'typeorm'

@Entity('greetings')
export class Greeting {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ type: 'text', nullable: false })
  message: string

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
