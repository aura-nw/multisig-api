import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CustomError } from '../../common/customError';
import { ErrorMap } from '../../common/error.map';
import { User } from '../../entities/user.entity';
import { ENTITIES_CONFIG } from '../../module.config';
import { In, Repository } from 'typeorm';

@Injectable()
export class UserRepository {
  private readonly _logger = new Logger(UserRepository.name);
  constructor(
    @InjectRepository(ENTITIES_CONFIG.USER)
    private readonly repo: Repository<User>,
  ) {
    this._logger.log(
      '============== Constructor User Repository ==============',
    );
  }

  async getUserByAddress(address: string): Promise<User> {
    const user = await this.repo.findOne({
      where: { address },
    });
    if (!user) {
      throw new CustomError(ErrorMap.USER_NOT_FOUND);
    }
    return user;
  }

  getUsersByListAddress(address: string[]): Promise<User[]> {
    return this.repo.find({
      where: {
        address: In(address),
      },
    });
  }

  async createUserIfNotExists(address: string, pubkey: string): Promise<User> {
    const user = await this.repo.findOne({
      where: { address },
    });
    if (!user) {
      const newUser = new User();
      newUser.address = address;
      newUser.pubkey = pubkey;
      return await this.repo.save(newUser);
    }
    return user;
  }
}
