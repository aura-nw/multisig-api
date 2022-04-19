import { ApiProperty } from "@nestjs/swagger";
import { IsInt, IsNumber, IsString } from "class-validator";

export class ExecuteMessageRequest {
  @IsString()
  @ApiProperty({
    description: 'Sender address',
    example: 'aura1tm8yfs7nfy9k7n7mz7y6qqndy8pr0tu4j48uy3',
    type: String
  })
  senderAddress: string;

  @IsString()
  @ApiProperty({
    description: 'Contract address',
    example: 'aura14hj2tavq8fpesdwxxcu44rty3hh90vhujrvcmstl4zr3txmfvw9swserkw',
    type: String
  })
  contractAddress: string;

  @IsString()
  @ApiProperty({
    description: 'Function name',
    example: 'add_new',
    type: String
  })
  functionName: string;

  @IsNumber()
  @ApiProperty({
    description: 'Transaction fee',
    example: 0.01
  })
  fee: number;

  @IsNumber()
  @ApiProperty({
    description: 'Transaction gas limit',
    example: 100000
  })
  gasLimit: number;

  @IsInt()
  @ApiProperty({
    description: 'Internal chain ID',
    example: 13,
    type: Number
  })
  internalChainId: number;

  @IsString()
  @ApiProperty({
    description: 'Owner who create transaction must sign transaction via wallet first. Then get bodyBytes of result.',
    example: 'CogBChwvY29zbW9zLmJhbmsudjFiZXRhMS5Nc2dTZW5kEmgKK2F1cmExMzJha3g5OTg5Y2FueHV6a2ZqbnJneHd5Y2NmY210ZnpobWZscW0SK2F1cmExdHVlaDRodnJmbmZ3c3VobDMyd21sbWV2NjU2bmhxc2t2cTd0N3QaDAoFdWF1cmESAzIwMBIA'
  })
  bodyBytes: string;

  @IsString()
  @ApiProperty({
    description: 'Owner who create transaction must sign transaction via wallet first. Then get signature of result.',
    example: 'Dj8pEXMADBGCjaRSAQwT1/7s+6fRrf985UZL2ujo0YMe+M2VEqYLERkc5tsrg8HAWuqzKVq5CV6a7KcOSgjNtw=='
  })
  signature: string;

  @IsString()
  @ApiProperty({
    description: 'Address of owner who create transaction',
    example: 'aura13t8ej6yvje8n9zl7hcvj8ks24tp5qvdsgfhnjx'
  })
  creatorAddress: string;

  @ApiProperty({
    description: 'Parameters of function',
    example: { id: 'f1' }
  })
  param: string;
}