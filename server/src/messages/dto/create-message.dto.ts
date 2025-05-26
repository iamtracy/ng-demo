import { ApiProperty } from '@nestjs/swagger'
import { IsString, IsNotEmpty, MinLength, MaxLength } from 'class-validator'

export class CreateMessageDto {
  @ApiProperty({
    description: 'The content of the message',
    example: 'Hello, world!',
    minLength: 1,
    maxLength: 500,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(500)
  message: string
}
