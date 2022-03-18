import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';

export class ConfirmTransactionRequest {
  @IsString()
  @ApiProperty({
    description: 'Owner address',
    example: 'aura1l5k37zpxp3ukty282kn6r7kf8rqh7cve0ggq2w'
  })
  fromAddress: string;

  @IsNumber()
  @ApiProperty({
    description: 'Offchain Transaction Id',
    example: 14
  })
  transactionId: number;

  @IsString()
  @ApiProperty({
    description: 'Owner sign transaction via wallet then get bodyBytes',
    example: 'CosBChwvY29zbW9zLmJhbmsudjFiZXRhMS5Nc2dTZW5kEmsKK2F1cmExNnVyaHBuM3hqY2phMGZydjc1MHR5M3c2MnFkOHNraHQ3ZTN0bGgSK2F1cmExbDVrMzd6cHhwM3VrdHkyODJrbjZyN2tmOHJxaDdjdmUwZ2dxMncaDwoFdWF1cmESBjEwMDAwMBIWVXNlIHlvdXIgdG9rZW5zIHdpc2VseQ=='
  })
  bodyBytes: string;

  @IsString()
  @ApiProperty({
    description: 'Owner sign transaction via wallet then get transaction',
    example: 'd20oaWycg+cT7kWAK/rhoM8zBzHbPhAr4J3ZoTbnLyIXNB4tHuVqrBRae5Qs2mh3FAezZHx2WE1/auQYudZQyw=='
  })
  signature: string;

  @IsNumber()
  @ApiProperty({
    description: 'Offline Chain Id',
    example: 4
  })
  internalChainId: number;
}