import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Greeting } from './greeting.entity'
import { GreetingsService } from './greetings.service'
import { GreetingsController } from './greetings.controller'

@Module({
  imports: [TypeOrmModule.forFeature([Greeting])],
  controllers: [GreetingsController],
  providers: [GreetingsService],
  exports: [GreetingsService]
})
export class GreetingsModule {}
