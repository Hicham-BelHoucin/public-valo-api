import { Controller, Get, Param, Query } from '@nestjs/common';
import { Public } from 'src/core/decorators/public.decorator';
import { FundService } from './fund.service';
import { FundFilterDto } from './dto/fund.dto';

@Controller('public/funds')
@Public()
export class FundController {
  constructor(private readonly fundService: FundService) {}

  @Get()
  findAll(@Query() filter: FundFilterDto) {
    return this.fundService.findAllPublic(filter);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Query('locale') locale?: string) {
    return this.fundService.findOne(id, locale);
  }

  @Get('code/:fundCode')
  async getPublicFund(
    @Param('fundCode') fundCode: string,
    @Query('locale') locale?: string,
  ) {
    return this.fundService.findOneByFundCode(fundCode, locale);
  }

  @Get(':fundId/performance')
  async getPerformanceByDateRange(@Param('fundId') fundId: string) {
    return this.fundService.getPerformanceByDateRange(fundId);
  }
}
