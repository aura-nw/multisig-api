export class IndexerResponseDto<T> {
  code: number;

  message: string;

  data: T;
}