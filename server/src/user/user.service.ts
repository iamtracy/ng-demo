import { Injectable, Logger } from '@nestjs/common'
import { User } from '@prisma/client'
import { OIDCTokenPayload } from '@types'

import { PrismaService } from '../prisma/prisma.service'

import { SyncUserDto } from './dto/sync-user.dto'

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name)

  constructor(private prisma: PrismaService) {}

  /**
   * Sync user data from Keycloak token to local database
   * This should be called on every login/token refresh
   */
  async syncUserFromKeycloak(keycloakUser: OIDCTokenPayload): Promise<User> {
    const syncData: SyncUserDto = {
      id: keycloakUser.sub ?? '',
      email: keycloakUser.email ?? '',
      username: keycloakUser.preferred_username ?? '',
      firstName: keycloakUser.given_name ?? '',
      lastName: keycloakUser.family_name ?? '',
      emailVerified: keycloakUser.email_verified ?? false,
      roles: keycloakUser.realm_access?.roles ?? [],
    }

    return this.syncUser(syncData)
  }

  /**
   * Sync user data to local database (upsert operation)
   */
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
          roles: syncUserDto.roles,
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
          roles: syncUserDto.roles,
          lastLoginAt: new Date(),
        },
      })

      this.logger.log(
        `User synced: ${user.username} (${user.id}) with roles: ${user.roles.join(', ')}`,
      )
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
