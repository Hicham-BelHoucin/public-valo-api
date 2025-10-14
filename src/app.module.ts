import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { FundModule } from './fund/fund.module';
import { CoreModule } from './core/core.module';
import { NumbersModule } from './numbers/numbers.module';
import { TeamModule } from './team/team.module';

@Module({
  imports: [
    // Global configuration module
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    // Core module (shared services like TokenBlacklistService)
    CoreModule,
    // Database module
    PrismaModule,
    // Fund module
    FundModule,
    // Numbers module
    NumbersModule,
    // Team module (Notre équipe)
    TeamModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
