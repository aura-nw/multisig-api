import { PartialType } from '@nestjs/mapped-types';
import { CreateChainDto } from './create-chain.dto';

export class UpdateChainDto extends PartialType(CreateChainDto) {}
