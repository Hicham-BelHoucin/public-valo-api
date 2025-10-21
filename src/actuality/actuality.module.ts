import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { CoreModule } from '../core/core.module';
import { ActualityService } from './actuality.service';
import { ActualityController } from './actuality.controller';

@Module({
  imports: [PrismaModule, CoreModule],
  controllers: [ActualityController],
  providers: [ActualityService],
  exports: [ActualityService],
})
export class ActualityModule {}
