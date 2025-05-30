import { CurrentUser } from '@auth'
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  ParseIntPipe,
  Logger,
} from '@nestjs/common'
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger'
import { Message, User } from '@prisma/client'
import { OIDCTokenPayload } from '@types'

import { CreateMessageDto } from './dto/create-message.dto'
import { MessageDto } from './dto/message.dto'
import { MessageService } from './message.service'

@ApiTags('messages')
@ApiBearerAuth('access-token')
@Controller('messages')
export class MessageController {
  private readonly logger = new Logger(MessageController.name)

  constructor(private readonly messageService: MessageService) {}

  private toMessageDto(
    message: Message & {
      user?: {
        username: string
        firstName: string | null
        lastName: string | null
      }
    },
    isAdmin = false,
  ): MessageDto {
    const dto: MessageDto = {
      id: message.id,
      message: message.message,
      userId: message.userId,
      createdAt: message.createdAt,
      updatedAt: message.updatedAt,
    }

    if (isAdmin && message.user) {
      dto.username = message.user.username
      dto.firstName = message.user.firstName ?? undefined
      dto.lastName = message.user.lastName ?? undefined
    }

    return dto
  }

  @Get()
  @ApiOperation({
    summary: 'Get messages - all messages for admins, own messages for users',
  })
  @ApiResponse({
    status: 200,
    description: 'List of messages',
    type: [MessageDto],
  })
  async findAll(@CurrentUser() user: OIDCTokenPayload): Promise<MessageDto[]> {
    const isAdmin: boolean = user.realm_access?.roles.includes('admin') ?? false
    this.logger.log(
      `GET /messages - User ${user.preferred_username ?? 'unknown'} (admin: ${String(isAdmin)})`,
    )

    try {
      const messages = await this.messageService.messages(user, isAdmin)
      const result = messages.map((message) =>
        this.toMessageDto(message, isAdmin),
      )

      this.logger.log(
        `GET /messages - Successfully returned ${String(result.length)} messages for user ${user.preferred_username ?? 'unknown'}`,
      )
      return result
    } catch (error) {
      this.logger.error(
        `GET /messages - Failed for user ${user.preferred_username ?? 'unknown'}:`,
        error,
      )
      throw error
    }
  }

  @Post()
  @ApiOperation({ summary: 'Create a new message' })
  @ApiResponse({
    status: 201,
    description: 'The message has been successfully created.',
    type: MessageDto,
  })
  async create(
    @Body() createMessageDto: CreateMessageDto,
    @CurrentUser() user: OIDCTokenPayload,
  ): Promise<MessageDto> {
    this.logger.log(
      `POST /messages - User ${user.preferred_username ?? 'unknown'} creating message`,
    )
    const isAdmin: boolean = user.realm_access?.roles.includes('admin') ?? false

    try {
      const message = await this.messageService.createMessage(
        createMessageDto,
        user,
      )
      const result = this.toMessageDto(message, isAdmin)

      this.logger.log(
        `POST /messages - Successfully created message ${String(message.id)} for user ${user.preferred_username ?? 'unknown'}`,
      )
      return result
    } catch (error) {
      this.logger.error(
        `POST /messages - Failed to create message for user ${user.preferred_username ?? 'unknown'}:`,
        error,
      )
      throw error
    }
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a message' })
  @ApiResponse({
    status: 200,
    description: 'The message has been successfully updated.',
    type: MessageDto,
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden. You can only update your own messages.',
  })
  @ApiResponse({
    status: 404,
    description: 'Message not found.',
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateMessageDto: CreateMessageDto,
    @CurrentUser() user: User,
  ): Promise<MessageDto> {
    this.logger.log(
      `PUT /messages/${String(id)} - User ${user.username} updating message`,
    )

    try {
      const message = await this.messageService.updateMessage(
        id,
        updateMessageDto,
        user,
      )
      const result = this.toMessageDto(message)

      this.logger.log(
        `PUT /messages/${String(id)} - Successfully updated message for user ${user.username}`,
      )
      return result
    } catch (error) {
      this.logger.error(
        `PUT /messages/${String(id)} - Failed to update message for user ${user.username}:`,
        error,
      )
      throw error
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a message' })
  @ApiResponse({
    status: 200,
    description: 'The message has been successfully deleted.',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number', description: 'ID of the deleted message' },
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden. You can only delete your own messages.',
  })
  @ApiResponse({
    status: 404,
    description: 'Message not found.',
  })
  async delete(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: User,
  ): Promise<{ id: number }> {
    this.logger.log(
      `DELETE /messages/${String(id)} - User ${user.username} deleting message`,
    )

    try {
      await this.messageService.deleteMessage(id, user)

      this.logger.log(
        `DELETE /messages/${String(id)} - Successfully deleted message for user ${user.username}`,
      )
      return { id }
    } catch (error) {
      this.logger.error(
        `DELETE /messages/${String(id)} - Failed to delete message for user ${user.username}:`,
        error,
      )
      throw error
    }
  }
}
