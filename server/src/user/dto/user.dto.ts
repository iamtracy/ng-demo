import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { BaseDto } from '../../common/base.dto'

export class UserDto extends BaseDto {
  @ApiProperty({
    description: 'The unique identifier of the user (Keycloak sub)',
    example: 'f1234567-89ab-cdef-0123-456789abcdef',
  })
  id: string

  @ApiProperty({
    description: 'The email address of the user',
    example: 'user@example.com',
  })
  email: string

  @ApiProperty({
    description: 'The username of the user',
    example: 'johndoe',
  })
  username: string

  @ApiProperty({
    description: 'The first name of the user',
    example: 'John',
    required: false,
  })
  firstName: string

  @ApiProperty({
    description: 'The last name of the user',
    example: 'Doe',
    required: false,
  })
  lastName: string

  @ApiProperty({
    description: 'Whether the user email is verified',
    example: true,
  })
  emailVerified: boolean

  @ApiProperty({
    isArray: true,
    description: 'User roles from Keycloak',
    example: ['user', 'admin'],
    type: [String],
  })
  roles: string[]

  @ApiPropertyOptional({
    description: 'When the user last logged in',
    example: '2024-03-20T10:30:00Z',
    required: false,
  })
  lastLoginAt?: Date
}
