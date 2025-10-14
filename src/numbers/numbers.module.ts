import { Module } from '@nestjs/common';
import { NumbersService } from './numbers.service';
import { NumbersController } from './numbers.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { CoreModule } from '../core/core.module';

@Module({
  imports: [PrismaModule, CoreModule],
  controllers: [NumbersController],
  providers: [NumbersService],
  exports: [NumbersService],
})
export class NumbersModule {}
