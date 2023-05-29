import { PartialType } from '@nestjs/swagger';
import { CreateSafeDto } from './create-safe.dto';

export class UpdateSafeDto extends PartialType(CreateSafeDto) {}
