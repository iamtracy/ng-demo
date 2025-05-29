import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

import { BaseDto } from '../../common/base.dto'

export class MessageDto extends BaseDto {
  @ApiProperty({
    description: 'The unique identifier of the message',
    example: 1,
  })
  id: number

  @ApiProperty({
    description: 'The content of the message',
    example: 'Hello, world!',
  })
  message: string

  @ApiProperty({
    description: 'The ID of the user who created the message',
    example: 'f1234567-89ab-cdef-0123-456789abcdef',
  })
  userId: string

  @ApiPropertyOptional({
    description: 'The username of the message author (only for admin users)',
    example: 'johndoe',
  })
  username?: string

  @ApiPropertyOptional({
    description: 'The first name of the message author (only for admin users)',
    example: 'John',
  })
  firstName?: string

  @ApiPropertyOptional({
    description: 'The last name of the message author (only for admin users)',
    example: 'Doe',
  })
  lastName?: string
}
