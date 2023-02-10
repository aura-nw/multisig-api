import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { SafeOwnerService } from './safe-owner.service';
import { CreateSafeOwnerDto } from './dto/create-safe-owner.dto';
import { UpdateSafeOwnerDto } from './dto/update-safe-owner.dto';

@Controller('safe-owner')
export class SafeOwnerController {
  constructor(private readonly safeOwnerService: SafeOwnerService) {}

  @Post()
  create(@Body() createSafeOwnerDto: CreateSafeOwnerDto) {
    return this.safeOwnerService.create(createSafeOwnerDto);
  }

  @Get()
  findAll() {
    return this.safeOwnerService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.safeOwnerService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSafeOwnerDto: UpdateSafeOwnerDto) {
    return this.safeOwnerService.update(+id, updateSafeOwnerDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.safeOwnerService.remove(+id);
  }
}
