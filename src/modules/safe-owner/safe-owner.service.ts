import { Injectable } from '@nestjs/common';
import { CreateSafeOwnerDto } from './dto/create-safe-owner.dto';
import { UpdateSafeOwnerDto } from './dto/update-safe-owner.dto';

@Injectable()
export class SafeOwnerService {
  create(createSafeOwnerDto: CreateSafeOwnerDto) {
    return 'This action adds a new safeOwner';
  }

  findAll() {
    return `This action returns all safeOwner`;
  }

  findOne(id: number) {
    return `This action returns a #${id} safeOwner`;
  }

  update(id: number, updateSafeOwnerDto: UpdateSafeOwnerDto) {
    return `This action updates a #${id} safeOwner`;
  }

  remove(id: number) {
    return `This action removes a #${id} safeOwner`;
  }
}
