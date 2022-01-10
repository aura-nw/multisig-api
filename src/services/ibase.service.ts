import { ResponseDto } from '../dtos/responses/response.dto';

export interface IBaseService {
  /**
   * findOne
   * @param id
   */
  findOne(id: any): Promise<ResponseDto>;

  /**
   * findByCondition
   * @param filterCondition
   * @param orderBy
   */
  findByCondition(filterCondition: any, orderBy: any): Promise<ResponseDto>;

  /**
   * findAll
   * @param orderBy
   */
  findAll(orderBy?: any): Promise<ResponseDto>;

  /**
   * findWithRelations
   * @param relations
   */
  findWithRelations(relations: any): Promise<ResponseDto>;

  /**
   * findAndCount
   * @param pageIndex
   * @param pageSize
   * @param condition
   * @param orderBy
   */
  findAndCount(
    pageIndex: number,
    pageSize: number,
    condition: any,
    orderBy: any,
  ): Promise<ResponseDto>;

  /**
   * create
   * @param data
   */
  create<T>(data: T | any): Promise<ResponseDto>;

  /**
   * update
   * @param data
   */
  update<T>(data: T | any): Promise<ResponseDto>;

  /**
   * remove
   * @param id
   */
  remove(id: any): Promise<ResponseDto>;
}
