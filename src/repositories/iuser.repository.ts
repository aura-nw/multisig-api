import { User } from 'src/entities/user.entity';
import { IBaseRepository } from './ibase.repository';

export interface IUserRepository extends IBaseRepository {
  /**
   * getUserByAddress
   * @param address
   */
  getUserByAddress(address: string): Promise<User>;

  /**
   * createUserIfNotExists
   * @param address
   * @param pubkey
   */
  createUserIfNotExists(address: string, pubkey: string): Promise<User>;
}
