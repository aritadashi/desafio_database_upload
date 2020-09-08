
import { getRepository } from 'typeorm';
import AppError from '../errors/AppError';
import Transaction from '../models/Transaction';

interface IRequest {
  id: string;
}

class DeleteTransactionService {
  public async execute({ id }: IRequest): Promise<void> {
    const deleteTransaction = getRepository(Transaction);

    await deleteTransaction.delete({ id });

  }
}

export default DeleteTransactionService;
