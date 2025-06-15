import { Resolver, Query, Mutation, Args, Int, Context } from '@nestjs/graphql';
import { UserService } from './user.service';
import { User } from './entities/user.entity';
import { CreateUserInput } from './dto/create-user.input';
import { UpdateUserInput } from './dto/update-user.input';
import { GqlAuthGuard } from 'src/common/guards/gql-auth.guard';
import { UseGuards } from '@nestjs/common';
import { PermissionsGuard } from 'src/common/guards/permission.guard';
import { Permissions } from 'src/common/guards/permission.decorator';
import { FilterInput, PaginationInput, SortInput } from './dto/user-list-response.dto';
import { UserListResponse } from './entities/reponsive.entity';
import { FileUpload, GraphQLUpload } from 'graphql-upload-ts';
@Resolver(() => User)
export class UserResolver {
  constructor(private readonly userService: UserService) { }
  @Query(() => UserListResponse, { name: 'users' })
  @UseGuards(GqlAuthGuard, PermissionsGuard)
  @Permissions('root', 'read:all', 'read:user', 'admin')
  findAll(
    @Args('filter', { nullable: true }) filter?: FilterInput,
    @Args('sort', { type: () => [SortInput], nullable: true }) sort?: SortInput[],
    @Args('pagination', { nullable: true }) pagination?: PaginationInput,
  ) {
    return this.userService.findAll(filter, sort, pagination);
  }

  @Query(() => User, { name: 'user' })
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.userService.findOne(id);
  }

  @Mutation(() => User)
  @UseGuards(GqlAuthGuard, PermissionsGuard)
  @Permissions('root', 'create:all', 'create:user', 'admin')
  async createUser(
    @Args('createUserInput') createUserInput: CreateUserInput,
    @Args({ name: 'file', type: () => GraphQLUpload, nullable: true }) file?: FileUpload,
  ) {
    let fileUrl: string | undefined;

    if (file) {
      const { createReadStream, filename } = await file;
      const path = `uploads/${Date.now()}-${filename}`;
      await new Promise((resolve, reject) => {
        createReadStream()
          .pipe(require('fs').createWriteStream(path))
          .on('finish', resolve)
          .on('error', reject);
      });
      fileUrl = path; // Lưu đường dẫn để gắn vào user
    }
    console.log(fileUrl)

    return this.userService.create(createUserInput);
  }
  @Mutation(() => User)
  @UseGuards(GqlAuthGuard, PermissionsGuard)
  @Permissions('root', 'update:all', 'update:user', 'admin')
  updateUser(@Args('updateUserInput') updateUserInput: UpdateUserInput) {
    return this.userService.update(updateUserInput.id, updateUserInput);
  }

  @Mutation(() => User)
  removeUser(@Args('id') id: string) {
    return this.userService.remove(id);
  }

}
