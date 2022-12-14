import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsString } from 'class-validator';

export class ConfirmTransactionRequest {
  @IsNumber()
  @Type(() => Number)
  @ApiProperty({
    description: 'Offchain Transaction Id',
    example: 14,
  })
  transactionId: number;

  @IsString()
  @ApiProperty({
    description: 'Owner sign transaction via wallet then get bodyBytes',
    example:
      'CosBChwvY29zbW9zLmJhbmsudjFiZXRhMS5Nc2dTZW5kEmsKK2F1cmExNnVyaHBuM3hqY2phMGZydjc1MHR5M3c2MnFkOHNraHQ3ZTN0bGgSK2F1cmExbDVrMzd6cHhwM3VrdHkyODJrbjZyN2tmOHJxaDdjdmUwZ2dxMncaDwoFdWF1cmESBjEwMDAwMBIWVXNlIHlvdXIgdG9rZW5zIHdpc2VseQ==',
  })
  bodyBytes: string;

  @IsString()
  @ApiProperty({
    description: 'Owner sign transaction via wallet then get transaction',
    example:
      'd20oaWycg+cT7kWAK/rhoM8zBzHbPhAr4J3ZoTbnLyIXNB4tHuVqrBRae5Qs2mh3FAezZHx2WE1/auQYudZQyw==',
  })
  signature: string;

  @IsNumber()
  @Type(() => Number)
  @ApiProperty({
    description: 'Offline Chain Id',
    example: 4,
  })
  @Type(() => Number)
  internalChainId: number;

  @IsString()
  @ApiProperty({
    description:
      'Auth info of transaction. Owner who create transaction must sign transaction via wallet first. Then get authInfo of result.',
    example:
      'Dj8pEXMADBGCjaRSAQwT1/7s+6fRrf985UZL2ujo0YMe+M2VEqYLERkc5tsrg8HAWuqzKVq5CV6a7KcOSgjNtw==',
  })
  authInfoBytes: string;

  @IsNumber()
  @Type(() => Number)
  @ApiProperty({
    description: 'Account number of pyxis safe',
    example: 41,
  })
  accountNumber: number;

  @IsNumber()
  @Type(() => Number)
  @ApiProperty({
    description: 'Sequence of pyxis safe',
    example: 48,
  })
  sequence: number;
}
