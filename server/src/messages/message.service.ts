import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma.service'
import { Message } from 'generated/prisma'
import { User } from 'src/types/user'

@Injectable()
export class MessageService {
  constructor(private prisma: PrismaService) {}

  async messages(): Promise<Message[]> {
    return this.prisma.message.findMany()
  }

  async createMessage(message: string, user: User): Promise<Message> {
    return this.prisma.message.create({
      data: {
        message,
        userId: user.sub,
      },
    })
  }
}
