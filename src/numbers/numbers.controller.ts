import { Controller, Get } from '@nestjs/common';
import { NumbersService } from './numbers.service';
// Removed unused DTOs for POST/PATCH/DELETE methods
import { Public } from '../core/decorators/public.decorator';

@Controller('public/numbers')
@Public()
export class NumbersController {
  constructor(private readonly numbersService: NumbersService) {}

  @Get()
  findAll() {
    return this.numbersService.findAll();
  }
}
