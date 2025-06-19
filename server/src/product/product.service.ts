import { Injectable } from '@nestjs/common';
import { CreateProductInput } from './dto/create-product.input';
import { UpdateProductInput } from './dto/update-product.input';
import { InjectModel } from '@nestjs/mongoose';
import { Product, ProductDocument } from './product.schema';
import { Model } from 'mongoose';
import { skip } from 'rxjs';
import { ProductFilterInput } from 'src/common/helper/filters/dto/product.filter';
import { buildMongoQuery } from 'src/common/helper/filters';
import { PaginationInput, SortInput } from 'src/common/helper/dto/pagination-sort.dto';

@Injectable()
export class ProductService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
  ) {}
  create(createProductInput: CreateProductInput) {
    return this.productModel.create(createProductInput);
  }

  findAll(query?: ProductFilterInput,
    sort?: SortInput[],
    pagination?: PaginationInput

  ) {
    // Build sort
    const sortQuery: Record<string, 1 | -1> = {};
    if (sort) {
      sort.forEach(({ field, order }) => {
        sortQuery[field] = order === 'ASC' ? 1 : -1;
      });
    }
    // Pagination
    const page = pagination?.page || 1;
    const limit = pagination?.limit || 10;
    const skip = (page - 1) * limit;
    const q = buildMongoQuery<ProductFilterInput>(query || {});
    return this.productModel.find(q).populate('image').sort(sortQuery).skip(skip).limit(limit).exec();
  }

  findOne(id: number) {
    return `This action returns a #${id} product`;
  }

  update(id: number, updateProductInput: UpdateProductInput) {
    return `This action updates a #${id} product`;
  }

  remove(id: number) {
    return `This action removes a #${id} product`;
  }
}
