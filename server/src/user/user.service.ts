import { Injectable, Logger } from '@nestjs/common'
import { User } from '@prisma/generated'
import { PrismaService } from '../prisma.service'
import { SyncUserDto } from './dto/sync-user.dto'
import { User as KeycloakUser } from '@types'

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name)

  constructor(private prisma: PrismaService) {}

  async syncUserFromKeycloak(keycloakUser: KeycloakUser): Promise<User> {
    const syncData: SyncUserDto = {
      id: keycloakUser.sub,
      email: keycloakUser.email,
      username: keycloakUser.preferred_username,
      firstName: keycloakUser.given_name,
      lastName: keycloakUser.family_name,
      emailVerified: keycloakUser.email_verified,
    }

    return this.syncUser(syncData)
  }

  async syncUser(syncUserDto: SyncUserDto): Promise<User> {
    try {
      const user = await this.prisma.user.upsert({
        where: { id: syncUserDto.id },
        update: {
          email: syncUserDto.email,
          username: syncUserDto.username,
          firstName: syncUserDto.firstName,
          lastName: syncUserDto.lastName,
          emailVerified: syncUserDto.emailVerified,
          lastLoginAt: new Date(),
          updatedAt: new Date(),
        },
        create: {
          id: syncUserDto.id,
          email: syncUserDto.email,
          username: syncUserDto.username,
          firstName: syncUserDto.firstName,
          lastName: syncUserDto.lastName,
          emailVerified: syncUserDto.emailVerified,
          lastLoginAt: new Date(),
        },
      })

      this.logger.log(`User synced: ${user.username} (${user.id})`)
      return user
    } catch (error) {
      this.logger.error(`Failed to sync user ${syncUserDto.username}:`, error)
      throw error
    }
  }

  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id },
      include: {
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    })
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email },
    })
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { username },
    })
  }

  /**
   * Get all users (admin only)
   */
  async findAll(): Promise<User[]> {
    return this.prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { messages: true },
        },
      },
    })
  }

  async updateLastLogin(id: string): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data: { lastLoginAt: new Date() },
    })
  }

  async deleteUser(id: string): Promise<void> {
    await this.prisma.user.delete({
      where: { id },
    })
    this.logger.log(`User deleted: ${id}`)
  }
} 