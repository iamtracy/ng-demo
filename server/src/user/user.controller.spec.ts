import { NotFoundException } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { User as PrismaUser } from '@prisma/client'
import { User as KeycloakUser } from '@types'

import { UserController } from './user.controller'
import { UserService } from './user.service'

jest.mock('@auth', () => ({
  CurrentUser: () => {
    return (target: any, key: string, descriptor: PropertyDescriptor) => {
      return descriptor
    }
  },
}))

describe('UserController', () => {
  let userController: UserController

  const mockPrismaUser: PrismaUser = {
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

  const mockUserService = {
    findAll: jest.fn(),
    findById: jest.fn(),
    syncUserFromKeycloak: jest.fn(),
  }

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
    }).compile()

    userController = moduleRef.get<UserController>(UserController)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('getAllUsers', () => {
    it('should return an array of users', async () => {
      const users = [mockPrismaUser]
      mockUserService.findAll.mockResolvedValue(users)

      const result = await userController.getAllUsers()
      expect(result).toHaveLength(1)
      expect(result[0]).toMatchObject({
        id: mockPrismaUser.id,
        email: mockPrismaUser.email,
        username: mockPrismaUser.username,
      })
    })
  })

  describe('getUserById', () => {
    it('should return a user if found', async () => {
      mockUserService.findById.mockResolvedValue(mockPrismaUser)

      const result = await userController.getUserById('test-id')
      expect(result).toMatchObject({
        id: mockPrismaUser.id,
        email: mockPrismaUser.email,
        username: mockPrismaUser.username,
      })
    })

    it('should throw NotFoundException if user not found', async () => {
      mockUserService.findById.mockResolvedValue(null)

      await expect(userController.getUserById('non-existent')).rejects.toThrow(
        NotFoundException,
      )
    })
  })

  describe('getCurrentUser', () => {
    it('should return current user profile', async () => {
      mockUserService.syncUserFromKeycloak.mockResolvedValue(mockPrismaUser)

      const result = await userController.getCurrentUser(mockKeycloakUser)
      expect(result).toMatchObject({
        id: mockPrismaUser.id,
        email: mockPrismaUser.email,
        username: mockPrismaUser.username,
      })
      expect(mockUserService.syncUserFromKeycloak).toHaveBeenCalledWith(
        mockKeycloakUser,
      )
    })
  })

  describe('syncCurrentUser', () => {
    it('should sync and return current user profile', async () => {
      mockUserService.syncUserFromKeycloak.mockResolvedValue(mockPrismaUser)

      const result = await userController.syncCurrentUser(mockKeycloakUser)
      expect(result).toMatchObject({
        id: mockPrismaUser.id,
        email: mockPrismaUser.email,
        username: mockPrismaUser.username,
      })
      expect(mockUserService.syncUserFromKeycloak).toHaveBeenCalledWith(
        mockKeycloakUser,
      )
    })
  })
})
