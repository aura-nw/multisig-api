import { ApiProperty } from '@nestjs/swagger';

export class SimulatingSignMsgRequest {
  @ApiProperty()
  mnemonic: string;

  @ApiProperty()
  safeId: string;
}
