import { getRepository, In } from 'typeorm';
import csvParse from 'csv-parse';
import fs from 'fs';
import Transaction from '../models/Transaction';
import Category from '../models/Category';

interface CSVTransaction {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category: string;
}

class ImportTransactionsService {
  async execute(csvFilePath: string): Promise<Transaction[]> {
    // console.log(csvFilePath);

    const readCSVStream = fs.createReadStream(csvFilePath);

    const parseStream = csvParse({
      from_line: 2,
      ltrim: true,
      rtrim: true,
    });

    const parseCSV = readCSVStream.pipe(parseStream);

    const transactions: CSVTransaction[] = [];
    const categories: string[] = [];
    // const lines = [];
    parseCSV.on('data', line => {
      const [title, type, value, category] = line;

      categories.push(category);

      transactions.push({ title, type, value, category });
      // lines.push({ title, type, value, category });
    });
    // console.log(lines);

    await new Promise(resolve => {
      parseCSV.on('end', resolve);
    });

    const categoriesRepository = getRepository(Category);

    const existentCategories = await categoriesRepository.find({
      where: {
        title: In(categories),
      },
    });

    const existentCategoriesTitle = existentCategories.map(
      (category: Category) => category.title,
    );

    const addCategoryTitles = categories
      .filter(category => !existentCategoriesTitle.includes(category))
      .filter((value, index, self) => self.indexOf(value) === index);

    const newCategories = categoriesRepository.create(
      addCategoryTitles.map(title => ({
        title,
      })),
    );

    await categoriesRepository.save(newCategories);

    const finalCategories = [...newCategories, ...existentCategories];

    const transactionRepository = getRepository(Transaction);

    const createdTransactions = transactionRepository.create(
      transactions.map(transaction => ({
        title: transaction.title,
        type: transaction.type,
        value: transaction.value,
        category: finalCategories.find(
          category => (category.title = transaction.category),
        ),
      })),
    );

    await transactionRepository.save(createdTransactions);

    await fs.promises.unlink(csvFilePath);

    return createdTransactions;

    /*     // console.log(lines);

    const transactionArray: Transaction[] = [];

    const p1 = lines.forEach(async line => {
      // console.log(line);
      const [title, type, value, category] = line;

      const categoriesRepository = getRepository(Category);

      let checkCategory = await categoriesRepository.findOne({
        where: { title: category },
      });

      if (!checkCategory) {
        const categoria = categoriesRepository.create({
          title: category,
        });

        checkCategory = await categoriesRepository.save(categoria);
      }

      const transactionRepository = getRepository(Transaction);

      const transaction = transactionRepository.create({
        title,
        value,
        type,
        category_id: checkCategory.id,
      });

      const trans = await transactionRepository.save(transaction);

      console.log(trans);

      transactionArray.push(trans);
    });

    await Promise.all(p1);
    console.log(transactionArray);

    return transactionArray;
 */
  }
}

export default ImportTransactionsService;
