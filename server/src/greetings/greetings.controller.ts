import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
} from '@nestjs/common'
import { GreetingsService } from './greetings.service'
import { Greeting } from './greeting.entity'
import { User } from 'src/types/user';
import { CurrentUser } from 'src/auth/user.decorator';

@Controller('greetings')
export class GreetingsController {
  constructor(private readonly greetingsService: GreetingsService) {}

  @Get()
  findAll(@CurrentUser() user: User): Promise<Greeting[]> {
    return this.greetingsService.findAll(user);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: User): Promise<Greeting> {
    return this.greetingsService.findOne(id, user);
  }

  @Post()
  create(@Body('message') message: string, @CurrentUser() user: User): Promise<Greeting> {
    return this.greetingsService.create(message, user)
  }

  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body('message') message: string,
    @CurrentUser() user: User
  ): Promise<Greeting> {
    return this.greetingsService.update(id, message, user);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: User): Promise<void> {
    return this.greetingsService.remove(id, user);
  }
}
