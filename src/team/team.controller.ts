import { Controller, Get, Param, Query, ParseUUIDPipe } from '@nestjs/common';
import { TeamService } from './team.service';
import { UserFilterDto } from './dto/team.dto';
import { Public } from '../core/decorators/public.decorator';

@Controller('public/team')
@Public()
export class TeamController {
  constructor(private readonly teamService: TeamService) {}

  @Get('')
  findAll(@Query() filter: UserFilterDto) {
    return this.teamService.findAll(filter);
  }

  @Get('stats')
  getTeamStats() {
    return this.teamService.getTeamStats();
  }

  @Get('department/:department')
  findByDepartment(@Param('department') department: string) {
    return this.teamService.findByDepartment(department);
  }

  @Get('role/:role')
  findByRole(@Param('role') role: string) {
    return this.teamService.findByRole(role);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.teamService.findOne(id);
  }
}
