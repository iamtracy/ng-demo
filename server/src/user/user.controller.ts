import { CurrentUser } from '@auth'
import {
  Controller,
  Get,
  Post,
  Param,
  NotFoundException,
  Logger,
} from '@nestjs/common'
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger'
import { User as PrismaUser } from '@prisma/client'
import { OIDCTokenPayload } from '@types'
import { Roles } from 'nest-keycloak-connect'

import { UserDto } from './dto/user.dto'
import { UserService } from './user.service'

@ApiTags('users')
@Controller('users')
@ApiBearerAuth('access-token')
export class UserController {
  private readonly logger = new Logger(UserController.name)

  constructor(private readonly userService: UserService) {}

  private toUserDto(user: PrismaUser | OIDCTokenPayload): UserDto {
    if (this.isPrismaUser(user)) {
      return this.mapPrismaUserToDto(user)
    }
    return this.mapOIDCTokenToDto(user)
  }

  private isPrismaUser(
    user: PrismaUser | OIDCTokenPayload,
  ): user is PrismaUser {
    return 'createdAt' in user && 'updatedAt' in user
  }

  private mapPrismaUserToDto(user: PrismaUser): UserDto {
    return {
      id: user.id,
      email: user.email,
      username: user.username,
      firstName: user.firstName ?? '',
      lastName: user.lastName ?? '',
      emailVerified: user.emailVerified,
      roles: user.roles,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      lastLoginAt: user.lastLoginAt ?? undefined,
    }
  }

  private mapOIDCTokenToDto(user: OIDCTokenPayload): UserDto {
    return {
      email: user.email ?? '',
      emailVerified: user.email_verified ?? false,
      roles: user.realm_access?.roles ?? [],
      id: user.sub ?? '',
      username: user.preferred_username ?? '',
      firstName: user.given_name ?? '',
      lastName: user.family_name ?? '',
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  }

  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({
    status: 200,
    description: 'Current user profile',
    type: UserDto,
  })
  async getCurrentUser(
    @CurrentUser() keycloakUser: OIDCTokenPayload,
  ): Promise<Omit<UserDto, 'createdAt' | 'updatedAt'>> {
    this.logger.log(
      `GET /users/me - User ${keycloakUser.preferred_username ?? 'unknown'} requesting profile`,
    )

    try {
      const user = await this.userService.syncUserFromKeycloak(keycloakUser)
      const result = this.toUserDto(user)

      this.logger.log(
        `GET /users/me - Successfully returned profile for user ${keycloakUser.preferred_username ?? 'unknown'}`,
      )
      return result
    } catch (error) {
      this.logger.error(
        `GET /users/me - Failed to get profile for user ${keycloakUser.preferred_username ?? 'unknown'}:`,
        error,
      )
      throw error
    }
  }

  @Post('sync')
  @ApiOperation({ summary: 'Manually sync current user data from Keycloak' })
  @ApiResponse({
    status: 200,
    description: 'User data synced successfully',
    type: UserDto,
  })
  async syncCurrentUser(
    @CurrentUser() keycloakUser: OIDCTokenPayload,
  ): Promise<Omit<UserDto, 'createdAt' | 'updatedAt'>> {
    this.logger.log(
      `POST /users/sync - User ${keycloakUser.preferred_username ?? 'unknown'} requesting sync`,
    )

    try {
      const user = await this.userService.syncUserFromKeycloak(keycloakUser)
      const result = this.toUserDto(user)

      this.logger.log(
        `POST /users/sync - Successfully synced user ${keycloakUser.preferred_username ?? 'unknown'}`,
      )
      return result
    } catch (error) {
      this.logger.error(
        `POST /users/sync - Failed to sync user ${keycloakUser.preferred_username ?? 'unknown'}:`,
        error,
      )
      throw error
    }
  }

  @Get(':id')
  @Roles({ roles: ['realm:admin'] })
  @ApiOperation({ summary: 'Get user by ID (admin only)' })
  @ApiResponse({
    status: 200,
    description: 'User found',
    type: UserDto,
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin role required',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  async getUserById(@Param('id') id: string): Promise<UserDto> {
    this.logger.log(`GET /users/${id} - Admin requesting user by ID`)

    try {
      const user = await this.userService.findById(id)
      if (!user) {
        this.logger.warn(`GET /users/${id} - User not found`)
        throw new NotFoundException(`User with ID ${id} not found`)
      }

      const result = this.toUserDto(user)
      this.logger.log(
        `GET /users/${id} - Successfully returned user ${user.username}`,
      )
      return result
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error
      }
      this.logger.error(`GET /users/${id} - Failed to get user:`, error)
      throw error
    }
  }

  @Get()
  @Roles({ roles: ['realm:admin'] })
  @ApiOperation({ summary: 'Get all users (admin only)' })
  @ApiResponse({
    status: 200,
    description: 'List of users',
    type: [UserDto],
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin role required',
  })
  async getAllUsers(): Promise<UserDto[]> {
    this.logger.log('GET /users - Admin requesting all users')

    try {
      const users = await this.userService.findAll()
      const result = users.map((user) => this.toUserDto(user))

      this.logger.log(
        `GET /users - Successfully returned ${String(result.length)} users`,
      )
      return result
    } catch (error) {
      this.logger.error('GET /users - Failed to get all users:', error)
      throw error
    }
  }
}
