import { Module } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CategoriesResolver } from './categories.resolver';
import { MongooseModule } from '@nestjs/mongoose';
import { Categories, CategoriesSchema } from './categories.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: Categories.name, schema: CategoriesSchema }])],
  providers: [CategoriesResolver, CategoriesService],
})
export class CategoriesModule {}
