import { IBaseService } from '../ibase.service';
import { ResponseDto } from '../../dtos/responses/response.dto';
import { ErrorMap } from '../../common/error.map';
import { Logger } from '@nestjs/common';

export class BaseService implements IBaseService {
  private _repos: any;
  private _log = new Logger(BaseService.name);
  public constructor(repos: any) {
    this._repos = repos;
  }

  /**
   * findOne
   * @param condition
   * @returns
   */
  public async findOne(id: any): Promise<ResponseDto> {
    const response = new ResponseDto();
    const result = await this._repos.findOne(id);
    return response.return(ErrorMap.SUCCESSFUL, result);
  }

  /**
   * findByCondition
   * @param condition
   * @param orderBy
   * @returns
   */
  public async findByCondition(
    condition: any,
    orderBy: any = null,
  ): Promise<ResponseDto> {
    const response = new ResponseDto();
    const result = await this._repos.findByCondition(condition, orderBy);
    return response.return(ErrorMap.SUCCESSFUL, result);
  }

  /**
   * findWithRelations
   * @param relations
   * @returns
   */
  public async findWithRelations(relations: any): Promise<ResponseDto> {
    const response = new ResponseDto();
    const result = await this._repos.findWithRelations(relations);
    return response.return(ErrorMap.SUCCESSFUL, result);
  }

  /**
   * findAll
   * @param orderBy
   * @returns
   */
  public async findAll(orderBy?: any): Promise<ResponseDto> {
    const response = new ResponseDto();
    const result = await this._repos.findAll(orderBy);
    return response.return(ErrorMap.SUCCESSFUL, result);
  }

  /**
   * findAndCount
   * @param pageIndex
   * @param pageSize
   * @param condition
   * @param orderBy
   * @returns
   */
  public async findAndCount(
    pageIndex: number,
    pageSize: number,
    condition: any = null,
    orderBy: any = null,
  ): Promise<ResponseDto> {
    const response = new ResponseDto();
    const result = await this._repos.findAndCount(
      pageIndex,
      pageSize,
      condition,
      orderBy,
    );
    return response.return(ErrorMap.SUCCESSFUL, result);
  }

  /**
   * create
   * @param data
   * @returns
   */
  public async create<T>(data: T | any): Promise<ResponseDto> {
    const response = new ResponseDto();
    const result = await this._repos.create(data);
    return response.return(ErrorMap.SUCCESSFUL, result);
  }

  /**
   * update
   * @param data
   * @returns
   */
  public async update<T>(data: T | any): Promise<ResponseDto> {
    const response = new ResponseDto();
    const result = await this._repos.update(data);
    return response.return(ErrorMap.SUCCESSFUL, result);
  }

  /**
   * remove
   * @param id
   * @returns
   */
  public async remove(id: any): Promise<ResponseDto> {
    const response = new ResponseDto();
    const result = await this._repos.remove(id);
    return response.return(ErrorMap.SUCCESSFUL, result);
  }
}
