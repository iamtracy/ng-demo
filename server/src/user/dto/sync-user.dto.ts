import { IsString, IsEmail, IsBoolean, IsOptional, IsArray } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class SyncUserDto {
  @ApiProperty({
    description: 'The unique identifier from Keycloak (sub)',
    example: 'f1234567-89ab-cdef-0123-456789abcdef'
  })
  @IsString()
  id: string

  @ApiProperty({
    description: 'The email address of the user',
    example: 'user@example.com'
  })
  @IsEmail()
  email: string

  @ApiProperty({
    description: 'The username of the user',
    example: 'johndoe'
  })
  @IsString()
  username: string

  @ApiProperty({
    description: 'The first name of the user',
    example: 'John',
    required: false
  })
  @IsOptional()
  @IsString()
  firstName?: string

  @ApiProperty({
    description: 'The last name of the user',
    example: 'Doe',
    required: false
  })
  @IsOptional()
  @IsString()
  lastName?: string

  @ApiProperty({
    description: 'Whether the user email is verified',
    example: true
  })
  @IsBoolean()
  emailVerified: boolean

  @ApiProperty({
    description: 'User roles from Keycloak',
    example: ['user', 'admin'],
    type: [String]
  })
  @IsArray()
  @IsString({ each: true })
  roles: string[]
} 