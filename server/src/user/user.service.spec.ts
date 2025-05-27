import { Logger } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { User } from '@prisma/client'

import { PrismaService } from '../prisma/prisma.service'

import { SyncUserDto } from './dto/sync-user.dto'
import { UserService } from './user.service'

interface MockPrismaService {
  user: {
    upsert: jest.Mock<Promise<User>, [unknown]>
    findUnique: jest.Mock<Promise<User | null>, [unknown]>
    findMany: jest.Mock<Promise<User[]>, [unknown]>
    update: jest.Mock<Promise<User>, [unknown]>
    delete: jest.Mock<Promise<User>, [unknown]>
  }
}

interface KeycloakUser {
  sub: string
  email: string
  preferred_username: string
  given_name?: string
  family_name?: string
  email_verified: boolean
  realm_access?: {
    roles: string[]
  }
}

interface UserCreateInput {
  id: string
  email: string
  username: string
  firstName?: string | null
  lastName?: string | null
  emailVerified: boolean
  roles: string[]
  lastLoginAt: Date
}

interface UserUpdateInput {
  email: string
  username: string
  firstName?: string | null
  lastName?: string | null
  emailVerified: boolean
  roles: string[]
  lastLoginAt: Date
  updatedAt: Date
}

interface UserWhereUniqueInput {
  id: string
}

interface UserUpsertArgs {
  where: UserWhereUniqueInput
  create: UserCreateInput
  update: UserUpdateInput
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

  const mockKeycloakUser: KeycloakUser = {
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
      prismaServiceMock.user.upsert.mockResolvedValue(mockUser)

      const result = await service.syncUserFromKeycloak(mockKeycloakUser)

      expect(result).toEqual(mockUser)
      const expectedUpdate: UserUpdateInput = {
        email: mockKeycloakUser.email,
        username: mockKeycloakUser.preferred_username,
        firstName: mockKeycloakUser.given_name ?? null,
        lastName: mockKeycloakUser.family_name ?? null,
        emailVerified: mockKeycloakUser.email_verified,
        roles: mockKeycloakUser.realm_access?.roles ?? [],
        lastLoginAt: expect.any(Date) as unknown as Date,
        updatedAt: expect.any(Date) as unknown as Date,
      }
      const expectedCreate: UserCreateInput = {
        id: mockKeycloakUser.sub,
        email: mockKeycloakUser.email,
        username: mockKeycloakUser.preferred_username,
        firstName: mockKeycloakUser.given_name ?? null,
        lastName: mockKeycloakUser.family_name ?? null,
        emailVerified: mockKeycloakUser.email_verified,
        roles: mockKeycloakUser.realm_access?.roles ?? [],
        lastLoginAt: expect.any(Date) as unknown as Date,
      }

      const expectedArgs: UserUpsertArgs = {
        where: { id: mockKeycloakUser.sub },
        update: expectedUpdate,
        create: expectedCreate,
      }

      expect(prismaServiceMock.user.upsert).toHaveBeenCalledWith(expectedArgs)
    })

    it('should handle Keycloak user with missing optional fields', async () => {
      const partialKeycloakUser: KeycloakUser = {
        sub: 'test-id',
        email: 'test@example.com',
        preferred_username: 'testuser',
        email_verified: true,
        realm_access: { roles: ['user'] },
      }

      prismaServiceMock.user.upsert.mockResolvedValue({
        ...mockUser,
        firstName: null,
        lastName: null,
      })

      await service.syncUserFromKeycloak(partialKeycloakUser)

      const expectedUpdate: Partial<UserUpdateInput> = {
        email: partialKeycloakUser.email,
        username: partialKeycloakUser.preferred_username,
        firstName: '',
        lastName: '',
        emailVerified: partialKeycloakUser.email_verified,
        roles: partialKeycloakUser.realm_access?.roles ?? [],
        lastLoginAt: expect.any(Date) as unknown as Date,
        updatedAt: expect.any(Date) as unknown as Date,
      }

      const expectedCreate: Partial<UserCreateInput> = {
        id: partialKeycloakUser.sub,
        email: partialKeycloakUser.email,
        username: partialKeycloakUser.preferred_username,
        firstName: '',
        lastName: '',
        emailVerified: partialKeycloakUser.email_verified,
        roles: partialKeycloakUser.realm_access?.roles ?? [],
        lastLoginAt: expect.any(Date) as unknown as Date,
      }

      interface ExpectedArgs {
        where: UserWhereUniqueInput
        update: Partial<UserUpdateInput>
        create: Partial<UserCreateInput>
      }

      const expectedArgs: Partial<ExpectedArgs> = {
        where: { id: partialKeycloakUser.sub },
        update: expectedUpdate,
        create: expectedCreate,
      }

      expect(prismaServiceMock.user.upsert).toHaveBeenCalledWith(
        expect.objectContaining<Partial<ExpectedArgs>>(expectedArgs),
      )
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

      prismaServiceMock.user.upsert.mockResolvedValue(mockUser)

      const result = await service.syncUser(syncUserDto)

      expect(result).toEqual(mockUser)

      const expectedUpdate: UserUpdateInput = {
        email: syncUserDto.email,
        username: syncUserDto.username,
        firstName: syncUserDto.firstName,
        lastName: syncUserDto.lastName,
        emailVerified: syncUserDto.emailVerified,
        roles: syncUserDto.roles,
        lastLoginAt: expect.any(Date) as unknown as Date,
        updatedAt: expect.any(Date) as unknown as Date,
      }

      const expectedCreate: UserCreateInput = {
        id: syncUserDto.id,
        email: syncUserDto.email,
        username: syncUserDto.username,
        firstName: syncUserDto.firstName,
        lastName: syncUserDto.lastName,
        emailVerified: syncUserDto.emailVerified,
        roles: syncUserDto.roles,
        lastLoginAt: expect.any(Date) as unknown as Date,
      }

      const expectedArgs: UserUpsertArgs = {
        where: { id: syncUserDto.id },
        update: expectedUpdate,
        create: expectedCreate,
      }

      expect(prismaServiceMock.user.upsert).toHaveBeenCalledWith(expectedArgs)
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
      prismaServiceMock.user.upsert.mockRejectedValue(error)

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
