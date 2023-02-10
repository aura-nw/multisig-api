import { Injectable } from '@nestjs/common';
import { CreateSafeDto } from './dto/create-safe.dto';
import { UpdateSafeDto } from './dto/update-safe.dto';

@Injectable()
export class SafeService {
  create(createSafeDto: CreateSafeDto) {
    return 'This action adds a new safe';
  }

  findAll() {
    return `This action returns all safe`;
  }

  findOne(id: number) {
    return `This action returns a #${id} safe`;
  }

  update(id: number, updateSafeDto: UpdateSafeDto) {
    return `This action updates a #${id} safe`;
  }

  remove(id: number) {
    return `This action removes a #${id} safe`;
  }
}
