import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common'
import { Message, Prisma } from '@prisma/generated'
import { User } from '@types'

import { PrismaService } from '../prisma/prisma.service'

import { CreateMessageDto } from './dto/create-message.dto'

@Injectable()
export class MessageService {
  constructor(private prisma: PrismaService) {}

  async messages(user: User, isAdmin = false): Promise<Message[]> {
    if (isAdmin) {
      return this.prisma.message.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              username: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      })
    } else {
      return this.prisma.message.findMany({
        where: {
          userId: user.sub,
        },
        orderBy: { createdAt: 'desc' },
      })
    }
  }

  async createMessage(
    createMessageDto: CreateMessageDto,
    user: User,
  ): Promise<Message> {
    const data: Prisma.MessageCreateInput = {
      message: createMessageDto.message,
      user: {
        connect: {
          id: user.sub,
        },
      },
    }

    return this.prisma.message.create({
      data,
    })
  }

  async updateMessage(
    id: number,
    updateMessageDto: CreateMessageDto,
    user: User,
  ): Promise<Message> {
    const message = await this.prisma.message.findUnique({
      where: { id },
    })

    if (!message) {
      throw new NotFoundException(`Message with ID ${id.toString()} not found`)
    }

    if (message.userId !== user.sub) {
      throw new ForbiddenException('You can only update your own messages')
    }

    return this.prisma.message.update({
      where: { id },
      data: {
        message: updateMessageDto.message,
        updatedAt: new Date(),
      },
    })
  }

  async deleteMessage(id: number, user: User): Promise<void> {
    const message = await this.prisma.message.findUnique({
      where: { id },
    })

    if (!message) {
      throw new NotFoundException(`Message with ID ${id.toString()} not found`)
    }

    if (message.userId !== user.sub) {
      throw new ForbiddenException('You can only delete your own messages')
    }

    await this.prisma.message.delete({
      where: { id },
    })
  }
}
