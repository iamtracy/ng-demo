import { Body, Controller, Get, Post } from '@nestjs/common'
import { MessageService } from './message.service'
import { Message } from 'generated/prisma'
import { CurrentUser } from 'src/auth/user.decorator'
import { User } from 'src/types/user'

@Controller('messages')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @Get()
  getMessages(): Promise<Message[]> {
    return this.messageService.messages()
  }

  @Post()
  createMessage(@Body('message') message: string, @CurrentUser() user: User): Promise<Message> {
    return this.messageService.createMessage(message, user)
  }
}