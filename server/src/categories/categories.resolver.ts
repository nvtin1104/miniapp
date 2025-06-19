import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { CategoriesService } from './categories.service';
import { Category } from './entities/category.entity';
import { CreateCategoryInput } from './dto/create-category.input';
import { UpdateCategoryInput } from './dto/update-category.input';
import { CategoriesFilterInput } from 'src/common/helper/filters/dto/categories.filter';
import { PaginationInput, SortInput } from 'src/common/helper/dto/pagination-sort.dto';
import { CategoriesListResponse } from './entities/custom.entity';

@Resolver(() => Category)
export class CategoriesResolver {
  constructor(private readonly categoriesService: CategoriesService) { }

  @Mutation(() => Category)
  createCategory(@Args('createCategoryInput') createCategoryInput: CreateCategoryInput) {
    return this.categoriesService.create(createCategoryInput);
  }

  @Query(() => CategoriesListResponse, { name: 'categories' })
  findAll(@Args('query', { type: () => CategoriesFilterInput, nullable: true }) query?: CategoriesFilterInput,
    @Args('sort', { type: () => [SortInput], nullable: true }) sort?: SortInput[],
    @Args('pagination', { type: () => PaginationInput, nullable: true }) pagination?: PaginationInput,
  ) {
    return this.categoriesService.findAll(query, sort, pagination);
  }

  @Query(() => Category, { name: 'category', nullable: true })
  findOne(@Args('query', { type: () => CategoriesFilterInput, nullable: true }) query?: CategoriesFilterInput) {
    return this.categoriesService.findOne(query);
  }

  @Query(() => Category || null, {
    name: 'categoryBySlug',
    nullable: true
  })
  findBySlug(@Args('slug', { type: () => String }) slug: string) {
    return this.categoriesService.findBy({ key: 'slug', value: slug });
  }

  @Query(() => Category, { name: 'categoryById' })
  findById(@Args('id', { type: () => String }) id: string) {
    return this.categoriesService.findById(id);
  }

  @Mutation(() => Category)
  updateCategory(@Args('updateCategoryInput') updateCategoryInput: UpdateCategoryInput) {
    return this.categoriesService.update(updateCategoryInput._id, updateCategoryInput);
  }

  @Mutation(() => Category)
  removeCategory(@Args('id', { type: () => String }) id: string) {
    return this.categoriesService.remove(id);
  }
}
