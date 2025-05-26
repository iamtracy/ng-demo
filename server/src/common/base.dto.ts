import { ApiProperty } from '@nestjs/swagger'

export class BaseDto {
  @ApiProperty({
    description: 'When the record was created',
    example: '2024-03-20T10:30:00Z',
  })
  createdAt: Date

  @ApiProperty({
    description: 'When the record was last updated',
    example: '2024-03-20T10:30:00Z',
  })
  updatedAt: Date
}
