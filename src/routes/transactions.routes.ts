import { Router } from 'express';
import { getRepository } from 'typeorm';
import multer from 'multer';
import path from 'path';
import uploadConfig from '../config/upload';

import Transaction from '../models/Transaction';
// import Category from '../models/Category';
import TransactionsRepository from '../repositories/TransactionsRepository';
import CreateTransactionService from '../services/CreateTransactionService';
import CreateCategoryService from '../services/CreateCategoryService';
import DeleteTransactionService from '../services/DeleteTransactionService';
import ImportTransactionsService from '../services/ImportTransactionsService';

const transactionsRouter = Router();

const upload = multer(uploadConfig);

transactionsRouter.get('/', async (request, response) => {
  const transactions = await getRepository(Transaction)
    .createQueryBuilder('transactions')
    .leftJoinAndSelect('transactions.category', 'categories')
    .select([
      'transactions.id',
      'transactions.title',
      'transactions.value',
      'transactions.type',
      'categories',
      'transactions.created_at',
      'transactions.updated_at',
    ])
    .getMany();

  const transactionsRepository = new TransactionsRepository();

  const balance = await transactionsRepository.getBalance();

  const balanceTranaction = {
    transactions: [...transactions],
    balance,
  };

  return response.json(balanceTranaction);
});

transactionsRouter.post('/', async (request, response) => {
  const { title, value, type, category } = request.body;

  const createCategory = new CreateCategoryService();

  const categoria = await createCategory.execute({
    title: category,
  });

  const createTransaction = new CreateTransactionService();

  const transaction = await createTransaction.execute({
    title,
    value,
    type,
    category_id: categoria.id,
  });

  return response.json(transaction);
});

transactionsRouter.delete('/:id', async (request, response) => {
  const { id } = request.params;

  const deleteTransaction = new DeleteTransactionService();

  deleteTransaction.execute({ id });
  // await deleteTransaction.delete(id);

  return response.status(204).send();
});

transactionsRouter.post(
  '/import',
  upload.single('file'),
  async (request, response) => {
    const csvFilename = request.file.filename;
    const csvFilePath = path.join(uploadConfig.directory, csvFilename);

    const importTransaction = new ImportTransactionsService();

    const transactions = await importTransaction.execute(csvFilePath);

    return response.json(transactions);
  },
);

export default transactionsRouter;
