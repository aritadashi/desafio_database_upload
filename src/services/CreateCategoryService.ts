import { getRepository } from 'typeorm';
import Category from '../models/Category';

interface Request {
    title: string;
}

class CreateCategoryService {
    public async execute({ title }: Request): Promise<Category> {
        const categoriesRepository = getRepository(Category);

        const checkCategory = await categoriesRepository.findOne({
            where: { title },
        });

        if (!checkCategory) {
            const category = categoriesRepository.create({
                title,
            });

            await categoriesRepository.save(category);

            return category;
        }

        return checkCategory;
    }
}

export default CreateCategoryService;