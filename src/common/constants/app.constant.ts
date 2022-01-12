export enum AppConstants {}

export enum ORDER_BY {
  DESC = 'DESC',
  ASC = 'ASC',
}
export enum DATABASE_TYPE {
  POSTGRES = 'postgres',
  MYSQL = 'mysql',
}
export enum SAFE_STATUS {
  PENDING = 'pending',
  CREATED = 'created',
  DELETED = 'deleted',
}
export enum TRANSACTION_STATUS {
  PENDING = 'PENDING',
  CANCELED = 'CANCELED',
  CONFIRM = 'CONFIRM',
  SUCCESSED = 'SUCCESSED'
}