import { Test } from '@nestjs/testing'

import { PrismaService } from '../prisma/prisma.service'

import { UserController } from './user.controller'
import { UserModule } from './user.module'
import { UserService } from './user.service'

const mockPrismaService = {
  user: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
}

interface TestService {
  userService: UserService
}

describe('UserModule', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should compile the module', async () => {
    const module = await Test.createTestingModule({
      imports: [UserModule],
    })
      .overrideProvider(PrismaService)
      .useValue(mockPrismaService)
      .compile()

    expect(module).toBeDefined()
  })

  it('should provide UserService', async () => {
    const module = await Test.createTestingModule({
      imports: [UserModule],
    })
      .overrideProvider(PrismaService)
      .useValue(mockPrismaService)
      .compile()

    const service = module.get(UserService)
    expect(service).toBeInstanceOf(UserService)
  })

  it('should provide UserController', async () => {
    const module = await Test.createTestingModule({
      imports: [UserModule],
    })
      .overrideProvider(PrismaService)
      .useValue(mockPrismaService)
      .compile()

    const controller = module.get(UserController)
    expect(controller).toBeInstanceOf(UserController)
  })

  it('should export UserService', async () => {
    const module = await Test.createTestingModule({
      imports: [UserModule],
      providers: [
        {
          provide: 'TEST_SERVICE',
          useFactory: (userService: UserService): TestService => ({
            userService,
          }),
          inject: [UserService],
        },
      ],
    })
      .overrideProvider(PrismaService)
      .useValue(mockPrismaService)
      .compile()

    const testService = module.get<TestService>('TEST_SERVICE')
    expect(testService.userService).toBeInstanceOf(UserService)
  })
})
