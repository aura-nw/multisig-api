import { PartialType } from '@nestjs/mapped-types';
import { CreateMultisigTransactionDto } from './create-multisig-transaction.dto';

export class UpdateMultisigTransactionDto extends PartialType(CreateMultisigTransactionDto) {}
