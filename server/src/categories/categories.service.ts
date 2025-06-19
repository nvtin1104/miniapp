import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCategoryInput } from './dto/create-category.input';
import { UpdateCategoryInput } from './dto/update-category.input';
import { PaginationInput, SortInput } from 'src/common/helper/dto/pagination-sort.dto';
import { CategoriesFilterInput } from 'src/common/helper/filters/dto/categories.filter';
import { buildMongoQuery } from 'src/common/helper/filters';
import { InjectModel } from '@nestjs/mongoose';
import { Categories, CategoriesDocument } from './categories.schema';
import { Model } from 'mongoose';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel(Categories.name) private categoriesModel: Model<CategoriesDocument>,
  ) { }
  async create(createCategoryInput: CreateCategoryInput) {
    const category = await this.categoriesModel.create(createCategoryInput);
    return category.populate('image');
  }
  async findAll(
    query?: CategoriesFilterInput,
    sort?: SortInput[],
    pagination?: PaginationInput,
  ) {
    // Build sort
    const sortQuery: Record<string, 1 | -1> = {};
    if (sort) {
      sort.forEach(({ field, order }) => {
        sortQuery[field] = order === 'ASC' ? 1 : -1;
      });
    }
    const q = buildMongoQuery<CategoriesFilterInput>(query || {});
    // Pagination
    const page = pagination?.page || 1;
    const limit = pagination?.limit || 10;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.categoriesModel.find(q).populate('image').sort(sortQuery).skip(skip).limit(limit).exec(),
      this.categoriesModel.countDocuments(q),
    ]);

    return {
      data,
      total,
      page,
      limit,
    };
  }

  findOne(query?: CategoriesFilterInput) {
    const q = buildMongoQuery<CategoriesFilterInput>(query || {});
    return this.categoriesModel.findOne(q).populate('image').exec();
  }
  findById(id: string) {
    return this.categoriesModel.findById(id).populate('image').exec();
  }
  findBy({
    key,
    value
  }: {
    key: string;
    value: string;
  }) {
    return this.categoriesModel.findOne({ [key]: value }).populate('image').exec();
  }

  update(id: string, updateCategoryInput: UpdateCategoryInput) {
    return this.categoriesModel.findByIdAndUpdate(id, updateCategoryInput, { new: true }).populate('image').exec();
  }

  remove(id: string) {
    const category = this.findById(id);
    if (!category) {
      throw new NotFoundException('Danh mục không tồn tại');
    }
    return this.categoriesModel.findByIdAndDelete(id).exec();
  }
}
