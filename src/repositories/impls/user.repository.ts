import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CustomError } from '../../common/customError';
import { ErrorMap } from '../../common/error.map';
import { User } from '../../entities/user.entity';
import { ENTITIES_CONFIG } from '../../module.config';
import { ObjectLiteral, Repository } from 'typeorm';
import { IUserRepository } from '../iuser.repository';
import { BaseRepository } from './base.repository';

@Injectable()
export class UserRepository extends BaseRepository implements IUserRepository {
  private readonly _logger = new Logger(UserRepository.name);
  constructor(
    @InjectRepository(ENTITIES_CONFIG.USER)
    private readonly repos: Repository<User>,
  ) {
    super(repos);
    this._logger.log(
      '============== Constructor User Repository ==============',
    );
  }

  async getUserByAddress(address: string): Promise<User> {
    const user = await this.repos.findOne({
      where: { address },
    });
    if (!user) {
      throw new CustomError(ErrorMap.USER_NOT_FOUND);
    }
    return user;
  }

  async createUserIfNotExists(address: string, pubkey: string): Promise<User> {
    const user = await this.repos.findOne({
      where: { address },
    });
    if (!user) {
      const newUser = new User();
      newUser.address = address;
      newUser.pubkey = pubkey;
      return await this.repos.save(newUser);
    }
    return user;
  }
}
