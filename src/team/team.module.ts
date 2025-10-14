import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { CoreModule } from '../core/core.module';
import { TeamService } from './team.service';
import { TeamController } from './team.controller';

@Module({
  imports: [PrismaModule, CoreModule],
  controllers: [TeamController],
  providers: [TeamService],
  exports: [TeamService],
})
export class TeamModule {}
