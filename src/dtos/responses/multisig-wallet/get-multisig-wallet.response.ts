import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { SAFE_STATUS } from 'src/common/constants/app.constant';

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

  @Expose()
  @ApiProperty()
  status: SAFE_STATUS;
}
