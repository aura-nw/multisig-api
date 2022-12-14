import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsNumber, IsString } from 'class-validator';

export class MultisigSignatureResponse {
  @IsNumber()
  @Type(() => Number)
  @ApiProperty({
    example: 1,
  })
  id: number;

  @IsDate()
  @ApiProperty({
    example: '2022-02-24T09:44:52.935Z',
  })
  createdAt: Date;

  @IsDate()
  @ApiProperty({
    example: '2022-02-24T09:44:52.935Z',
  })
  updatedAt: Date;

  @IsString()
  @ApiProperty({
    example: 'aura15f6wn3nymdnhnh5ddlqletuptjag09tryrtpq5',
  })
  ownerAddress: string;

  @IsString()
  @ApiProperty({
    example:
      'IIo33eqegxuCl/Nx9p0Bfhlvz1y+Qr1ZVeJHQVRX2e4EW0sotraMTUyEAb3pNbQ8cgkiwIimFf73yUapGoLnmw==',
  })
  signature: string;

  @IsString()
  @ApiProperty({
    example: 'CONFIRM',
  })
  status: string;
}
