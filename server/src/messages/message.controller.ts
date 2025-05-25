import { Controller, Get, Post, Body } from '@nestjs/common'
import { MessageService } from './message.service'
import { CreateMessageDto } from './dto/create-message.dto'
import { MessageDto } from './dto/message.dto'
import { User } from 'src/types/user'
import { CurrentUser } from 'src/auth/user.decorator'
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger'

@ApiTags('messages')
@Controller('messages')
@ApiBearerAuth('access-token')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @Get()
  @ApiOperation({ summary: 'Get all messages for the current user' })
  @ApiResponse({ 
    status: 200, 
    description: 'List of messages',
    type: [MessageDto]
  })
  findAll(@CurrentUser() user: User): Promise<MessageDto[]> {
    return this.messageService.messages(user)
  }

  @Post()
  @ApiOperation({ summary: 'Create a new message' })
  @ApiResponse({ 
    status: 201, 
    description: 'The message has been successfully created.',
    type: MessageDto
  })
  create(
    @Body() createMessageDto: CreateMessageDto,
    @CurrentUser() user: User
  ): Promise<MessageDto> {
    return this.messageService.createMessage(createMessageDto, user)
  }
}