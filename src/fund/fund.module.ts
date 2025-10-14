import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { CoreModule } from '../core/core.module';

import { FundService } from './fund.service';

import { FundController } from './fund.controller';

@Module({
  imports: [PrismaModule, CoreModule],
  controllers: [FundController],
  providers: [FundService],
  exports: [FundService],
})
export class FundModule {}
