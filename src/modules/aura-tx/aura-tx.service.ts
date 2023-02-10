import { Injectable } from '@nestjs/common';
import { CreateAuraTxDto } from './dto/create-aura-tx.dto';
import { UpdateAuraTxDto } from './dto/update-aura-tx.dto';

@Injectable()
export class AuraTxService {
  create(createAuraTxDto: CreateAuraTxDto) {
    return 'This action adds a new auraTx';
  }

  findAll() {
    return `This action returns all auraTx`;
  }

  findOne(id: number) {
    return `This action returns a #${id} auraTx`;
  }

  update(id: number, updateAuraTxDto: UpdateAuraTxDto) {
    return `This action updates a #${id} auraTx`;
  }

  remove(id: number) {
    return `This action removes a #${id} auraTx`;
  }
}
