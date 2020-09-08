import { EntityRepository, Repository, getRepository } from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance(): Promise<Balance> {
    const transactions = await getRepository(Transaction).find();

    const income = transactions
      .filter(transaction => transaction.type == 'income')
      .map(transaction => Number(transaction.value))
      .reduce(function (acum, atual) {
        return acum + atual;
      }, 0);

    const outcome = transactions
      .filter(transaction => transaction.type == 'outcome')
      .map(transaction => Number(transaction.value))
      .reduce(function (acum, atual) {
        return acum + atual;
      }, 0);
    const total = income - outcome;

    const balance: Balance = {
      income,
      outcome,
      total,
    };

    return balance;

  };


}

export default TransactionsRepository;
