// import AppError from '../errors/AppError';
import { getCustomRepository } from 'typeorm';
import Transaction from '../models/Transaction';
import TransactionRepository from '../repositories/TransactionsRepository';
import AppError from '../errors/AppError';

interface IRequest {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category_id: string;
}

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

class CreateTransactionService {
  public async execute({ title, value, type, category_id }: IRequest): Promise<Transaction> {
    const transactionRepository = getCustomRepository(TransactionRepository);

    if (type == 'outcome') {
      const balance = await transactionRepository.getBalance();

      if (value > balance.total) {
        throw new AppError('The outcome value must not exceed the total', 400);
      }
    }

    const transaction = transactionRepository.create({
      title,
      value,
      type,
      category_id,
    });

    await transactionRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
