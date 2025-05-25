import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma.service'
import { User } from 'src/types/user'
import { CreateMessageDto } from './dto/create-message.dto'
import { MessageDto } from './dto/message.dto'

@Injectable()
export class MessageService {
  constructor(private prisma: PrismaService) {}

  async messages(user: User): Promise<MessageDto[]> {
    return this.prisma.message.findMany({
      where: {
        userId: user.sub,
      },
    })
  }

  async createMessage(createMessageDto: CreateMessageDto, user: User): Promise<MessageDto> {
    return this.prisma.message.create({
      data: {
        message: createMessageDto.message,
        userId: user.sub,
      },
    })
  }
}
