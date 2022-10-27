import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateTransactionRequest {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Address of safe',
    example: 'aura1328x7tacz28w96zl4j50qnfg4gqjdd56wqd3ke',
  })
  from: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Address of receiver',
    example: 'aura136v0nmlv0saryev8wqz89w80edzdu3quzm0ve9',
  })
  to: string;

  @IsNumber()
  @ApiProperty({
    description: 'Transaction amount',
    example: 3000000,
  })
  amount: number;

  @IsNumber()
  @ApiProperty({
    description: 'Offline Chain Id',
    example: 4,
  })
  internalChainId: number;

  @IsString()
  @ApiProperty({
    description:
      'Owner who create transaction must sign transaction via wallet first. Then get bodyBytes of result.',
    example:
      'CogBChwvY29zbW9zLmJhbmsudjFiZXRhMS5Nc2dTZW5kEmgKK2F1cmExMzJha3g5OTg5Y2FueHV6a2ZqbnJneHd5Y2NmY210ZnpobWZscW0SK2F1cmExdHVlaDRodnJmbmZ3c3VobDMyd21sbWV2NjU2bmhxc2t2cTd0N3QaDAoFdWF1cmESAzIwMBIA',
  })
  bodyBytes: string;

  @IsString()
  @ApiProperty({
    description:
      'Owner who create transaction must sign transaction via wallet first. Then get signature of result.',
    example:
      'Dj8pEXMADBGCjaRSAQwT1/7s+6fRrf985UZL2ujo0YMe+M2VEqYLERkc5tsrg8HAWuqzKVq5CV6a7KcOSgjNtw==',
  })
  signature: string;

  @IsString()
  @ApiProperty({
    description:
      'Auth info of transaction. Owner who create transaction must sign transaction via wallet first. Then get authInfo of result.',
    example:
      'Dj8pEXMADBGCjaRSAQwT1/7s+6fRrf985UZL2ujo0YMe+M2VEqYLERkc5tsrg8HAWuqzKVq5CV6a7KcOSgjNtw==',
  })
  authInfoBytes: string;
}
