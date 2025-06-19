import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Category } from './category.entity';

@ObjectType()
export class CategoriesListResponse {
  @Field(() => [Category])
  data: Category[];

  @Field(() => Int)
  total: number;

  @Field(() => Int)
  page: number;

  @Field(() => Int)
  limit: number;
}
