import { Controller, Get, Post, Param, NotFoundException } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger'
import { Roles } from 'nest-keycloak-connect'
import { CurrentUser } from '@auth'
import { User as KeycloakUser } from '@types'
import { UserService } from './user.service'
import { UserDto } from './dto/user.dto'

@ApiTags('users')
@Controller('users')
@ApiBearerAuth('access-token')
export class UserController {
  constructor(private readonly userService: UserService) {}

  private toUserDto(user: any): UserDto {
    return {
      id: user.id,
      email: user.email,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      emailVerified: user.emailVerified,
      roles: user.roles || [],
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      lastLoginAt: user.lastLoginAt,
    }
  }

  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ 
    status: 200, 
    description: 'Current user profile',
    type: UserDto
  })
  async getCurrentUser(@CurrentUser() keycloakUser: KeycloakUser): Promise<UserDto> {
    const user = await this.userService.syncUserFromKeycloak(keycloakUser)
    return this.toUserDto(user)
  }

  @Post('sync')
  @ApiOperation({ summary: 'Manually sync current user data from Keycloak' })
  @ApiResponse({ 
    status: 200, 
    description: 'User data synced successfully',
    type: UserDto
  })
  async syncCurrentUser(@CurrentUser() keycloakUser: KeycloakUser): Promise<UserDto> {
    const user = await this.userService.syncUserFromKeycloak(keycloakUser)
    return this.toUserDto(user)
  }

  @Get(':id')
  @Roles({ roles: ['realm:admin'] })
  @ApiOperation({ summary: 'Get user by ID (admin only)' })
  @ApiResponse({ 
    status: 200, 
    description: 'User found',
    type: UserDto
  })
  @ApiResponse({ 
    status: 403, 
    description: 'Forbidden - Admin role required'
  })
  @ApiResponse({ 
    status: 404, 
    description: 'User not found'
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
    type: [UserDto]
  })
  @ApiResponse({ 
    status: 403, 
    description: 'Forbidden - Admin role required'
  })
  async getAllUsers(): Promise<UserDto[]> {
    const users = await this.userService.findAll()
    return users.map(this.toUserDto)
  }
} 