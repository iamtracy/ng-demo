import { validate } from 'class-validator'

import { SyncUserDto } from './sync-user.dto'

describe('SyncUserDto', () => {
  let dto: SyncUserDto

  beforeEach(() => {
    dto = new SyncUserDto()
    dto.id = 'test-id'
    dto.email = 'test@example.com'
    dto.username = 'testuser'
    dto.emailVerified = true
    dto.roles = ['user']
  })

  it('should pass validation with all required fields', async () => {
    const errors = await validate(dto)
    expect(errors).toHaveLength(0)
  })

  it('should pass validation with optional fields', async () => {
    dto.firstName = 'John'
    dto.lastName = 'Doe'
    const errors = await validate(dto)
    expect(errors).toHaveLength(0)
  })

  it('should fail validation without id', async () => {
    dto.id = undefined as unknown as string
    const errors = await validate(dto)
    expect(errors).toHaveLength(1)
    expect(errors[0].property).toBe('id')
    expect(errors[0].constraints).toHaveProperty('isString')
  })

  it('should fail validation with invalid email', async () => {
    dto.email = 'invalid-email'
    const errors = await validate(dto)
    expect(errors).toHaveLength(1)
    expect(errors[0].property).toBe('email')
    expect(errors[0].constraints).toHaveProperty('isEmail')
  })

  it('should fail validation without username', async () => {
    dto.username = undefined as unknown as string
    const errors = await validate(dto)
    expect(errors).toHaveLength(1)
    expect(errors[0].property).toBe('username')
    expect(errors[0].constraints).toHaveProperty('isString')
  })

  it('should fail validation with non-boolean emailVerified', async () => {
    dto.emailVerified = 'true' as unknown as boolean
    const errors = await validate(dto)
    expect(errors).toHaveLength(1)
    expect(errors[0].property).toBe('emailVerified')
    expect(errors[0].constraints).toHaveProperty('isBoolean')
  })

  it('should fail validation with non-array roles', async () => {
    dto.roles = 'user' as unknown as string[]
    const errors = await validate(dto)
    expect(errors).toHaveLength(1)
    expect(errors[0].property).toBe('roles')
    expect(errors[0].constraints).toHaveProperty('isArray')
  })

  it('should fail validation with non-string role items', async () => {
    dto.roles = [123] as unknown as string[]
    const errors = await validate(dto)
    expect(errors).toHaveLength(1)
    expect(errors[0].property).toBe('roles')
    expect(errors[0].constraints).toHaveProperty('isString')
  })

  it('should allow undefined optional fields', async () => {
    dto.firstName = undefined as unknown as string
    dto.lastName = undefined as unknown as string
    const errors = await validate(dto)
    expect(errors).toHaveLength(0)
  })
})
