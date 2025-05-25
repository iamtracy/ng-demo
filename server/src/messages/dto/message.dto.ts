import { ApiProperty } from '@nestjs/swagger'

export class MessageDto {
  @ApiProperty({
    description: 'The unique identifier of the message',
    example: 1
  })
  id: number

  @ApiProperty({
    description: 'The content of the message',
    example: 'Hello, world!'
  })
  message: string

  @ApiProperty({
    description: 'The ID of the user who created the message',
    example: 'f1234567-89ab-cdef-0123-456789abcdef'
  })
  userId: string

  @ApiProperty({
    description: 'When the message was created',
    example: '2024-03-20T10:30:00Z'
  })
  createdAt: Date

  @ApiProperty({
    description: 'When the message was last updated',
    example: '2024-03-20T10:30:00Z'
  })
  updatedAt: Date
} 