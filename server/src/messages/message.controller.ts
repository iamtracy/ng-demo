import { Controller, Get, Post, Put, Delete, Param, Body, ParseIntPipe, Req } from '@nestjs/common'
import { User } from '@types'
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger'
import { CurrentUser } from '@auth'
import { Message } from '@prisma/generated'
import { Request } from 'express'

import { MessageService } from './message.service'
import { CreateMessageDto } from './dto/create-message.dto'
import { MessageDto } from './dto/message.dto'

@ApiTags('messages')
@Controller('messages')
@ApiBearerAuth('access-token')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  private toMessageDto(message: Message): MessageDto {
    return {
      id: message.id,
      message: message.message,
      userId: message.userId,
      createdAt: message.createdAt,
      updatedAt: message.updatedAt,
    }
  }

  @Get()
  @ApiOperation({ summary: 'Get messages - all messages for admins, own messages for users' })
  @ApiResponse({ 
    status: 200, 
    description: 'List of messages',
    type: [MessageDto]
  })
  async findAll(@CurrentUser() user: User, @Req() request: Request): Promise<MessageDto[]> {
    const requestUser = (request as any).user
    const isAdmin = requestUser?.realm_access?.roles?.includes('admin') || false
    
    const messages = await this.messageService.messages(user, isAdmin)
    return messages.map(this.toMessageDto)
  }

  @Post()
  @ApiOperation({ summary: 'Create a new message' })
  @ApiResponse({ 
    status: 201, 
    description: 'The message has been successfully created.',
    type: MessageDto
  })
  async create(
    @Body() createMessageDto: CreateMessageDto,
    @CurrentUser() user: User
  ): Promise<MessageDto> {
    const message = await this.messageService.createMessage(createMessageDto, user)
    return this.toMessageDto(message)
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a message' })
  @ApiResponse({ 
    status: 200, 
    description: 'The message has been successfully updated.',
    type: MessageDto
  })
  @ApiResponse({ 
    status: 403, 
    description: 'Forbidden. You can only update your own messages.'
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Message not found.'
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateMessageDto: CreateMessageDto,
    @CurrentUser() user: User
  ): Promise<MessageDto> {
    const message = await this.messageService.updateMessage(id, updateMessageDto, user)
    return this.toMessageDto(message)
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a message' })
  @ApiResponse({ 
    status: 200, 
    description: 'The message has been successfully deleted.',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number', description: 'ID of the deleted message' }
      }
    }
  })
  @ApiResponse({ 
    status: 403, 
    description: 'Forbidden. You can only delete your own messages.'
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Message not found.'
  })
  async delete(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: User
  ): Promise<{ id: number }> {
    await this.messageService.deleteMessage(id, user)
    return { id }
  }
}