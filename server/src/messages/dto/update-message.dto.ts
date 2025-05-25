import { ApiProperty, PartialType } from '@nestjs/swagger'
import { CreateMessageDto } from './create-message.dto'
import { IsNotEmpty, IsNumber } from 'class-validator'
import { IsString } from 'class-validator'

export class UpdateMessageDto extends PartialType(CreateMessageDto) {
    @ApiProperty({
        description: 'The message to update',
        example: 'Hello, world!',
    })
    @IsString()
    @IsNotEmpty()
    message: string
}