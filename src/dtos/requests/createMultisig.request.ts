import { ApiProperty } from '@nestjs/swagger';

export class CreateMultisigRequest {
  @ApiProperty()
  name: string;

  @ApiProperty({type: [String]})
  pubkeys: string[];

}