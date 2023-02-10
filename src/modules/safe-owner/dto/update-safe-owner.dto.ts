import { PartialType } from '@nestjs/mapped-types';
import { CreateSafeOwnerDto } from './create-safe-owner.dto';

export class UpdateSafeOwnerDto extends PartialType(CreateSafeOwnerDto) {}
