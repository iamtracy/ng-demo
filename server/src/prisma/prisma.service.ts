import { Injectable, OnModuleInit, Logger } from '@nestjs/common'
import { PrismaClient } from '@prisma/client'

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger(PrismaService.name)

  async onModuleInit(): Promise<void> {
    this.logger.log('Connecting to database...')
    try {
      await this.$connect()
      this.logger.log('Successfully connected to database')
    } catch (error) {
      this.logger.error('Failed to connect to database:', error)
      throw error
    }
  }

  async onModuleDestroy(): Promise<void> {
    this.logger.log('Disconnecting from database...')
    try {
      await this.$disconnect()
      this.logger.log('Successfully disconnected from database')
    } catch (error) {
      this.logger.error('Failed to disconnect from database:', error)
      throw error
    }
  }
}
