import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Greeting } from './greeting.entity'
import { User } from 'src/types/user'

@Injectable()
export class GreetingsService {
  constructor(
    @InjectRepository(Greeting)
    private readonly greetingRepository: Repository<Greeting>
  ) {}

  async findAll(user: any): Promise<Greeting[]> {
    return this.greetingRepository.find({
      where: { userId: user.sub },
      order: { createdAt: 'ASC' }
    })
  }

  async findOne(id: number, user: User): Promise<Greeting> {
    const greeting = await this.greetingRepository.findOne({
      where: { id, userId: user.sub }
    })

    if (!greeting) {
      throw new NotFoundException(`Greeting with ID ${id} not found`)
    }

    return greeting
  }

  async create(message: string, user: User): Promise<Greeting> {
    console.log('user', user)
    const greeting = this.greetingRepository.create({ message, userId: user.sub })
    
    return this.greetingRepository.save(greeting)
  }

  async update(id: number, message: string, user: User): Promise<Greeting> {
    const greeting = await this.findOne(id, user)
    greeting.message = message
    return this.greetingRepository.save(greeting)
  }

  async remove(id: number, user: User): Promise<void> {
    const greeting = await this.findOne(id, user)
    await this.greetingRepository.remove(greeting)
  }
}
