import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AuraTxService } from './aura-tx.service';
import { CreateAuraTxDto } from './dto/create-aura-tx.dto';
import { UpdateAuraTxDto } from './dto/update-aura-tx.dto';

@Controller('aura-tx')
export class AuraTxController {
  constructor(private readonly auraTxService: AuraTxService) {}

  @Post()
  create(@Body() createAuraTxDto: CreateAuraTxDto) {
    return this.auraTxService.create(createAuraTxDto);
  }

  @Get()
  findAll() {
    return this.auraTxService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.auraTxService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAuraTxDto: UpdateAuraTxDto) {
    return this.auraTxService.update(+id, updateAuraTxDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.auraTxService.remove(+id);
  }
}
