import { PartialType } from '@nestjs/mapped-types';
import { CreateAuraTxDto } from './create-aura-tx.dto';

export class UpdateAuraTxDto extends PartialType(CreateAuraTxDto) {}
