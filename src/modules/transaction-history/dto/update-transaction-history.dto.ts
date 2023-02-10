import { PartialType } from '@nestjs/mapped-types';
import { CreateTransactionHistoryDto } from './create-transaction-history.dto';

export class UpdateTransactionHistoryDto extends PartialType(CreateTransactionHistoryDto) {}
