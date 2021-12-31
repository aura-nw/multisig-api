import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class GetMultisigWalletResponse {
  @Expose()
  @ApiProperty()
  address: string;

  @Expose()
  @ApiProperty({ type: [String] })
  pubkeys: string;

  @Expose()
  @ApiProperty({ type: [String] })
  owners: string[];

  @Expose()
  @ApiProperty()
  threshold: number;
}
