import { Logger } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { User } from '@prisma/client'
import { OIDCTokenPayload } from '@types'

import { PrismaService } from '../prisma/prisma.service'

import { SyncUserDto } from './dto/sync-user.dto'
import { UserService } from './user.service'

interface MockPrismaService {
  user: {
    findUnique: jest.Mock<Promise<User | null>, [unknown]>
    findMany: jest.Mock<Promise<User[]>, [unknown]>
    update: jest.Mock<Promise<User>, [unknown]>
    delete: jest.Mock<Promise<User>, [unknown]>
    create: jest.Mock<Promise<User>, [unknown]>
  }
}

describe('UserService', () => {
  let service: UserService
  let prismaServiceMock: MockPrismaService

  const mockUser: User = {
    id: 'test-id',
    email: 'test@example.com',
    username: 'testuser',
    firstName: 'Test',
    lastName: 'User',
    emailVerified: true,
    roles: ['user'],
    createdAt: new Date(),
    updatedAt: new Date(),
    lastLoginAt: new Date(),
  }

  const mockKeycloakUser: OIDCTokenPayload = {
    sub: 'test-id',
    email: 'test@example.com',
    preferred_username: 'testuser',
    given_name: 'Test',
    family_name: 'User',
    email_verified: true,
    realm_access: {
      roles: ['user'],
    },
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              upsert: jest.fn(),
              findUnique: jest.fn(),
              findMany: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
              create: jest.fn(),
            },
          },
        },
      ],
    }).compile()

    service = module.get<UserService>(UserService)
    prismaServiceMock = module.get(PrismaService)

    jest.clearAllMocks()
    jest.spyOn(Logger.prototype, 'log').mockImplementation(() => undefined)
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined)
  })

  describe('syncUserFromKeycloak', () => {
    it('should sync user data from Keycloak', async () => {
      // Mock user doesn't exist, so create new user
      prismaServiceMock.user.findUnique.mockResolvedValue(null)
      prismaServiceMock.user.create.mockResolvedValue(mockUser)

      const result = await service.syncUserFromKeycloak(mockKeycloakUser)

      expect(result).toEqual(mockUser)
      expect(prismaServiceMock.user.findUnique).toHaveBeenCalledWith({
        where: { username: mockKeycloakUser.preferred_username },
      })
      expect(prismaServiceMock.user.create).toHaveBeenCalledWith({
        data: {
          id: mockKeycloakUser.sub,
          email: mockKeycloakUser.email,
          username: mockKeycloakUser.preferred_username,
          firstName: mockKeycloakUser.given_name ?? '',
          lastName: mockKeycloakUser.family_name ?? '',
          emailVerified: mockKeycloakUser.email_verified,
          roles: mockKeycloakUser.realm_access?.roles ?? [],
          lastLoginAt: expect.any(Date),
        },
      })
    })

    it('should handle Keycloak user with missing optional fields', async () => {
      const partialKeycloakUser: OIDCTokenPayload = {
        sub: 'test-id',
        email: 'test@example.com',
        preferred_username: 'testuser',
        email_verified: true,
        realm_access: { roles: ['user'] },
      }

      prismaServiceMock.user.findUnique.mockResolvedValue(null)
      prismaServiceMock.user.create.mockResolvedValue({
        ...mockUser,
        firstName: '',
        lastName: '',
      })

      await service.syncUserFromKeycloak(partialKeycloakUser)

      expect(prismaServiceMock.user.findUnique).toHaveBeenCalledWith({
        where: { username: partialKeycloakUser.preferred_username },
      })
      expect(prismaServiceMock.user.create).toHaveBeenCalledWith({
        data: {
          id: partialKeycloakUser.sub,
          email: partialKeycloakUser.email,
          username: partialKeycloakUser.preferred_username,
          firstName: '',
          lastName: '',
          emailVerified: partialKeycloakUser.email_verified,
          roles: partialKeycloakUser.realm_access?.roles ?? [],
          lastLoginAt: expect.any(Date),
        },
      })
    })

    it('should update existing user from Keycloak', async () => {
      // Mock user exists, so update existing user
      prismaServiceMock.user.findUnique.mockResolvedValue(mockUser)
      prismaServiceMock.user.update.mockResolvedValue(mockUser)

      const result = await service.syncUserFromKeycloak(mockKeycloakUser)

      expect(result).toEqual(mockUser)
      expect(prismaServiceMock.user.findUnique).toHaveBeenCalledWith({
        where: { username: mockKeycloakUser.preferred_username },
      })
      expect(prismaServiceMock.user.update).toHaveBeenCalledWith({
        where: { username: mockKeycloakUser.preferred_username },
        data: {
          id: mockKeycloakUser.sub,
          email: mockKeycloakUser.email,
          firstName: mockKeycloakUser.given_name ?? '',
          lastName: mockKeycloakUser.family_name ?? '',
          emailVerified: mockKeycloakUser.email_verified,
          roles: mockKeycloakUser.realm_access?.roles ?? [],
          lastLoginAt: expect.any(Date),
          updatedAt: expect.any(Date),
        },
      })
    })
  })

  describe('syncUser', () => {
    it('should sync user data with provided DTO', async () => {
      const syncUserDto: SyncUserDto = {
        id: 'test-id',
        email: 'test@example.com',
        username: 'testuser',
        firstName: 'Test',
        lastName: 'User',
        emailVerified: true,
        roles: ['user'],
      }

      prismaServiceMock.user.findUnique.mockResolvedValue(null)
      prismaServiceMock.user.create.mockResolvedValue(mockUser)

      const result = await service.syncUser(syncUserDto)

      expect(result).toEqual(mockUser)
      expect(prismaServiceMock.user.findUnique).toHaveBeenCalledWith({
        where: { username: syncUserDto.username },
      })
      expect(prismaServiceMock.user.create).toHaveBeenCalledWith({
        data: {
          id: syncUserDto.id,
          email: syncUserDto.email,
          username: syncUserDto.username,
          firstName: syncUserDto.firstName,
          lastName: syncUserDto.lastName,
          emailVerified: syncUserDto.emailVerified,
          roles: syncUserDto.roles,
          lastLoginAt: expect.any(Date),
        },
      })
    })

    it('should update existing user with provided DTO', async () => {
      const syncUserDto: SyncUserDto = {
        id: 'test-id',
        email: 'test@example.com',
        username: 'testuser',
        firstName: 'Test',
        lastName: 'User',
        emailVerified: true,
        roles: ['user'],
      }

      // Mock user exists, so update existing user
      prismaServiceMock.user.findUnique.mockResolvedValue(mockUser)
      prismaServiceMock.user.update.mockResolvedValue(mockUser)

      const result = await service.syncUser(syncUserDto)

      expect(result).toEqual(mockUser)
      expect(prismaServiceMock.user.findUnique).toHaveBeenCalledWith({
        where: { username: syncUserDto.username },
      })
      expect(prismaServiceMock.user.update).toHaveBeenCalledWith({
        where: { username: syncUserDto.username },
        data: {
          id: syncUserDto.id,
          email: syncUserDto.email,
          firstName: syncUserDto.firstName,
          lastName: syncUserDto.lastName,
          emailVerified: syncUserDto.emailVerified,
          roles: syncUserDto.roles,
          lastLoginAt: expect.any(Date),
          updatedAt: expect.any(Date),
        },
      })
    })

    it('should handle database errors', async () => {
      const syncUserDto: SyncUserDto = {
        id: 'test-id',
        email: 'test@example.com',
        username: 'testuser',
        firstName: 'Test',
        lastName: 'User',
        emailVerified: true,
        roles: ['user'],
      }

      const error = new Error('Database error')
      prismaServiceMock.user.findUnique.mockRejectedValue(error)

      await expect(service.syncUser(syncUserDto)).rejects.toThrow(error)
    })
  })

  describe('findById', () => {
    it('should return a user by id', async () => {
      prismaServiceMock.user.findUnique.mockResolvedValue(mockUser)

      const result = await service.findById('test-id')

      expect(result).toEqual(mockUser)
      expect(prismaServiceMock.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'test-id' },
        include: {
          messages: {
            orderBy: { createdAt: 'desc' },
            take: 10,
          },
        },
      })
    })

    it('should return null if user not found', async () => {
      prismaServiceMock.user.findUnique.mockResolvedValue(null)

      const result = await service.findById('non-existent')

      expect(result).toBeNull()
    })
  })

  describe('findByEmail', () => {
    it('should return a user by email', async () => {
      prismaServiceMock.user.findUnique.mockResolvedValue(mockUser)

      const result = await service.findByEmail('test@example.com')

      expect(result).toEqual(mockUser)
      expect(prismaServiceMock.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      })
    })
  })

  describe('findByUsername', () => {
    it('should return a user by username', async () => {
      prismaServiceMock.user.findUnique.mockResolvedValue(mockUser)

      const result = await service.findByUsername('testuser')

      expect(result).toEqual(mockUser)
      expect(prismaServiceMock.user.findUnique).toHaveBeenCalledWith({
        where: { username: 'testuser' },
      })
    })
  })

  describe('findAll', () => {
    it('should return all users', async () => {
      const users = [mockUser]
      prismaServiceMock.user.findMany.mockResolvedValue(users)

      const result = await service.findAll()

      expect(result).toEqual(users)
      expect(prismaServiceMock.user.findMany).toHaveBeenCalledWith({
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: { messages: true },
          },
        },
      })
    })
  })

  describe('updateLastLogin', () => {
    it('should update user last login time', async () => {
      prismaServiceMock.user.update.mockResolvedValue(mockUser)

      const result = await service.updateLastLogin('test-id')

      expect(result).toEqual(mockUser)
      expect(prismaServiceMock.user.update).toHaveBeenCalledWith({
        where: { id: 'test-id' },
        data: { lastLoginAt: expect.any(Date) as unknown as Date },
      })
    })
  })

  describe('deleteUser', () => {
    it('should delete a user', async () => {
      prismaServiceMock.user.delete.mockResolvedValue(mockUser)

      await service.deleteUser('test-id')

      expect(prismaServiceMock.user.delete).toHaveBeenCalledWith({
        where: { id: 'test-id' },
      })
    })

    it('should handle deletion errors', async () => {
      const error = new Error('Deletion failed')
      prismaServiceMock.user.delete.mockRejectedValue(error)

      await expect(service.deleteUser('test-id')).rejects.toThrow(error)
    })
  })
})
