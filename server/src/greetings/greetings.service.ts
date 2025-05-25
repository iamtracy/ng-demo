import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Greeting } from './greeting.entity'

@Injectable()
export class GreetingsService {
  constructor(
    @InjectRepository(Greeting)
    private readonly greetingRepository: Repository<Greeting>
  ) {}

  async findAll(): Promise<Greeting[]> {
    return this.greetingRepository.find({
      order: { createdAt: 'ASC' }
    })
  }

  async findOne(id: number): Promise<Greeting> {
    const greeting = await this.greetingRepository.findOne({
      where: { id }
    })

    if (!greeting) {
      throw new NotFoundException(`Greeting with ID ${id} not found`)
    }

    return greeting
  }

  async create(message: string): Promise<Greeting> {
    const greeting = this.greetingRepository.create({ message })
    return this.greetingRepository.save(greeting)
  }

  async update(id: number, message: string): Promise<Greeting> {
    const greeting = await this.findOne(id)
    greeting.message = message
    return this.greetingRepository.save(greeting)
  }

  async remove(id: number): Promise<void> {
    const greeting = await this.findOne(id)
    await this.greetingRepository.remove(greeting)
  }
}
