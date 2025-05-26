import { UserDto } from './user.dto'

describe('UserDto', () => {
  let dto: UserDto

  beforeEach(() => {
    dto = new UserDto()
    dto.id = 'test-id'
    dto.email = 'test@example.com'
    dto.username = 'testuser'
    dto.emailVerified = true
    dto.roles = ['user']
    dto.createdAt = new Date('2024-03-20T10:30:00Z')
    dto.updatedAt = new Date('2024-03-20T10:30:00Z')
  })

  describe('required fields', () => {
    it('should properly set id', () => {
      expect(dto.id).toBe('test-id')
    })

    it('should properly set email', () => {
      expect(dto.email).toBe('test@example.com')
    })

    it('should properly set username', () => {
      expect(dto.username).toBe('testuser')
    })

    it('should properly set emailVerified', () => {
      expect(dto.emailVerified).toBe(true)
    })

    it('should properly set roles', () => {
      expect(dto.roles).toEqual(['user'])
    })
  })

  describe('optional fields', () => {
    it('should allow setting firstName', () => {
      dto.firstName = 'John'
      expect(dto.firstName).toBe('John')
    })

    it('should allow setting lastName', () => {
      dto.lastName = 'Doe'
      expect(dto.lastName).toBe('Doe')
    })

    it('should allow setting lastLoginAt', () => {
      const date = new Date('2024-03-20T10:30:00Z')
      dto.lastLoginAt = date
      expect(dto.lastLoginAt).toEqual(date)
    })

    it('should allow undefined optional fields', () => {
      expect(dto.firstName).toBeUndefined()
      expect(dto.lastName).toBeUndefined()
      expect(dto.lastLoginAt).toBeUndefined()
    })
  })

  describe('inherited BaseDto fields', () => {
    it('should properly set createdAt', () => {
      const expectedDate = new Date('2024-03-20T10:30:00Z')
      expect(dto.createdAt).toEqual(expectedDate)
    })

    it('should properly set updatedAt', () => {
      const expectedDate = new Date('2024-03-20T10:30:00Z')
      expect(dto.updatedAt).toEqual(expectedDate)
    })

    it('should allow updating updatedAt', () => {
      const newDate = new Date('2024-03-21T15:45:00Z')
      dto.updatedAt = newDate
      expect(dto.updatedAt).toEqual(newDate)
    })
  })

  describe('type safety', () => {
    it('should maintain Date type for timestamps', () => {
      expect(dto.createdAt instanceof Date).toBe(true)
      expect(dto.updatedAt instanceof Date).toBe(true)
      if (dto.lastLoginAt) {
        expect(dto.lastLoginAt instanceof Date).toBe(true)
      }
    })

    it('should maintain array type for roles', () => {
      expect(Array.isArray(dto.roles)).toBe(true)
      expect(typeof dto.roles[0]).toBe('string')
    })
  })
})
