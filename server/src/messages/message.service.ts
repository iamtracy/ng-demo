import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Logger,
} from '@nestjs/common'
import { Message, Prisma } from '@prisma/client'
import { OIDCTokenPayload } from '@types'

import { PrismaService } from '../prisma/prisma.service'

import { CreateMessageDto } from './dto/create-message.dto'

@Injectable()
export class MessageService {
  private readonly logger = new Logger(MessageService.name)

  constructor(private readonly prisma: PrismaService) {}

  async messages(user: OIDCTokenPayload, isAdmin = false): Promise<Message[]> {
    this.logger.log(
      `Fetching messages for user ${user.preferred_username ?? 'unknown'} (admin: ${String(isAdmin)})`,
    )

    try {
      if (isAdmin) {
        const messages = await this.prisma.message.findMany({
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
        this.logger.log(
          `Retrieved ${String(messages.length)} messages for admin user ${user.preferred_username ?? 'unknown'}`,
        )
        return messages
      } else {
        const messages = await this.prisma.message.findMany({
          where: {
            userId: user.sub,
          },
          orderBy: { createdAt: 'desc' },
        })
        this.logger.log(
          `Retrieved ${String(messages.length)} messages for user ${user.preferred_username ?? 'unknown'}`,
        )
        return messages
      }
    } catch (error) {
      this.logger.error(
        `Failed to fetch messages for user ${user.preferred_username ?? 'unknown'}:`,
        error,
      )
      throw error
    }
  }

  async createMessage(
    createMessageDto: CreateMessageDto,
    user: OIDCTokenPayload,
  ): Promise<Message> {
    this.logger.log(
      `Creating message for user ${user.preferred_username ?? 'unknown'}`,
    )

    try {
      const data: Prisma.MessageCreateInput = {
        message: createMessageDto.message,
        user: {
          connect: {
            id: user.sub,
          },
        },
      }

      const message = await this.prisma.message.create({
        data,
      })

      this.logger.log(
        `Successfully created message ${String(message.id)} for user ${user.preferred_username ?? 'unknown'}`,
      )
      return message
    } catch (error) {
      this.logger.error(
        `Failed to create message for user ${user.preferred_username ?? 'unknown'}:`,
        error,
      )
      throw error
    }
  }

  private async findMessageById(id: number): Promise<Message | null> {
    return this.prisma.message.findUnique({
      where: { id },
    })
  }

  private validateMessageOwnership(
    message: Message | null,
    user: OIDCTokenPayload,
    id: number,
  ): void {
    if (!message) {
      this.logger.warn(
        `Message ${String(id)} not found for update by user ${user.preferred_username ?? 'unknown'}`,
      )
      throw new NotFoundException(`Message with ID ${id.toString()} not found`)
    }

    if (message.userId !== user.sub) {
      this.logger.warn(
        `User ${user.preferred_username ?? 'unknown'} attempted to update message ${String(id)} owned by ${message.userId}`,
      )
      throw new ForbiddenException('You can only update your own messages')
    }
  }

  private async performMessageUpdate(
    id: number,
    updateMessageDto: CreateMessageDto,
  ): Promise<Message> {
    return this.prisma.message.update({
      where: { id },
      data: {
        message: updateMessageDto.message,
        updatedAt: new Date(),
      },
    })
  }

  async updateMessage(
    id: number,
    updateMessageDto: CreateMessageDto,
    user: OIDCTokenPayload,
  ): Promise<Message> {
    this.logger.log(
      `Updating message ${String(id)} for user ${user.preferred_username ?? 'unknown'}`,
    )

    try {
      const message = await this.findMessageById(id)
      this.validateMessageOwnership(message, user, id)

      const updatedMessage = await this.performMessageUpdate(
        id,
        updateMessageDto,
      )

      this.logger.log(
        `Successfully updated message ${String(id)} for user ${user.preferred_username ?? 'unknown'}`,
      )
      return updatedMessage
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException
      ) {
        throw error
      }
      this.logger.error(
        `Failed to update message ${String(id)} for user ${user.preferred_username ?? 'unknown'}:`,
        error,
      )
      throw error
    }
  }

  private validateMessageOwnershipForDeletion(
    message: Message | null,
    user: OIDCTokenPayload,
    id: number,
  ): void {
    if (!message) {
      this.logger.warn(
        `Message ${String(id)} not found for deletion by user ${user.preferred_username ?? 'unknown'}`,
      )
      throw new NotFoundException(`Message with ID ${id.toString()} not found`)
    }

    if (message.userId !== user.sub) {
      this.logger.warn(
        `User ${user.preferred_username ?? 'unknown'} attempted to delete message ${String(id)} owned by ${message.userId}`,
      )
      throw new ForbiddenException('You can only delete your own messages')
    }
  }

  private async performMessageDeletion(id: number): Promise<void> {
    await this.prisma.message.delete({
      where: { id },
    })
  }

  async deleteMessage(id: number, user: OIDCTokenPayload): Promise<void> {
    this.logger.log(
      `Deleting message ${String(id)} for user ${user.preferred_username ?? 'unknown'}`,
    )

    try {
      const message = await this.findMessageById(id)
      this.validateMessageOwnershipForDeletion(message, user, id)

      await this.performMessageDeletion(id)

      this.logger.log(
        `Successfully deleted message ${String(id)} for user ${user.preferred_username ?? 'unknown'}`,
      )
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException
      ) {
        throw error
      }
      this.logger.error(
        `Failed to delete message ${String(id)} for user ${user.preferred_username ?? 'unknown'}:`,
        error,
      )
      throw error
    }
  }
}
