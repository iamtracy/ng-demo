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

@Controller('greetings')
export class GreetingsController {
  constructor(private readonly greetingsService: GreetingsService) {}

  @Get()
  findAll(): Promise<Greeting[]> {
    return this.greetingsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Greeting> {
    return this.greetingsService.findOne(id);
  }

  @Post()
  create(@Body('message') message: string): Promise<Greeting> {
    return this.greetingsService.create(message);
  }

  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body('message') message: string,
  ): Promise<Greeting> {
    return this.greetingsService.update(id, message);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.greetingsService.remove(id);
  }
}
