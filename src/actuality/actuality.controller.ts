import { Controller, Get, Param, Query } from '@nestjs/common';
import { Public } from 'src/core/decorators/public.decorator';
import { ActualityService } from './actuality.service';
import { ActualityFilterDto } from './dto/actuality.dto';

@Controller('public/actualities')
@Public()
export class ActualityController {
  constructor(private readonly actualityService: ActualityService) {}

  @Get()
  findAll(@Query() filter: ActualityFilterDto) {
    return this.actualityService.findAll(filter);
  }

  @Get('latest')
  findLatest(@Query('limit') limit?: string) {
    const limitNumber = limit ? parseInt(limit, 10) : 5;
    return this.actualityService.findLatest(limitNumber);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.actualityService.findOne(id);
  }
}
