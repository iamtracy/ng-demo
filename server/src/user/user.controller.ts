import { CurrentUser } from '@auth'
import { Controller, Get, Post, Param, NotFoundException } from '@nestjs/common'
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
  constructor(private readonly userService: UserService) {}

  private toUserDto(user: PrismaUser | OIDCTokenPayload): UserDto {
    if ('createdAt' in user && 'updatedAt' in user) {
      const prismaUser = user as PrismaUser
      return {
        id: prismaUser.id,
        email: prismaUser.email,
        username: prismaUser.username,
        firstName: prismaUser.firstName ?? '',
        lastName: prismaUser.lastName ?? '',
        emailVerified: prismaUser.emailVerified,
        roles: prismaUser.roles,
        createdAt: prismaUser.createdAt,
        updatedAt: prismaUser.updatedAt,
        lastLoginAt: prismaUser.lastLoginAt ?? undefined,
      }
    }

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
    const user = await this.userService.syncUserFromKeycloak(keycloakUser)
    return this.toUserDto(user)
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
    const user = await this.userService.syncUserFromKeycloak(keycloakUser)
    return this.toUserDto(user)
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
    const user = await this.userService.findById(id)
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`)
    }
    return this.toUserDto(user)
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
    const users = await this.userService.findAll()
    return users.map((user) => this.toUserDto(user))
  }
}
