import { ApiProperty } from "@nestjs/swagger";
import { IsInt, IsString } from "class-validator";

export class QueryMessageRequest {
    @IsString()
    @ApiProperty({
      description: 'Function name',
      example: 'get_flower',
      type: String
    })
    functionName: string;

    @IsString()
    @ApiProperty({
      description: 'Address of Smart Contract',
      example: 'aura14hj2tavq8fpesdwxxcu44rty3hh90vhurzxerr',
      type: String
    })
    contractAddress: string;
    
    @IsInt()
    @ApiProperty({
      description: 'Internal chain ID',
      example: 13,
      type: Number
    })
    internalChainId: number;

    @ApiProperty({
      description: 'Parameters of function',
      example: { id: 'f1' }
    })
    param: any;
}