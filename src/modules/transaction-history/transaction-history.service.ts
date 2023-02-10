import { Injectable } from '@nestjs/common';
import { CreateTransactionHistoryDto } from './dto/create-transaction-history.dto';
import { UpdateTransactionHistoryDto } from './dto/update-transaction-history.dto';

@Injectable()
export class TransactionHistoryService {
  create(createTransactionHistoryDto: CreateTransactionHistoryDto) {
    return 'This action adds a new transactionHistory';
  }

  findAll() {
    return `This action returns all transactionHistory`;
  }

  findOne(id: number) {
    return `This action returns a #${id} transactionHistory`;
  }

  update(id: number, updateTransactionHistoryDto: UpdateTransactionHistoryDto) {
    return `This action updates a #${id} transactionHistory`;
  }

  remove(id: number) {
    return `This action removes a #${id} transactionHistory`;
  }
}
