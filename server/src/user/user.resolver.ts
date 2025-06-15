import { Resolver, Query, Mutation, Args, Int, Context } from '@nestjs/graphql';
import { UserService } from './user.service';
import { User } from './entities/user.entity';
import { CreateUserInput } from './dto/create-user.input';
import { UpdateUserInput } from './dto/update-user.input';
import { GqlAuthGuard } from 'src/common/guards/gql-auth.guard';
import { UseGuards } from '@nestjs/common';
import { PermissionsGuard } from 'src/common/guards/permission.guard';
import { Permissions } from 'src/common/guards/permission.decorator';
import { PaginationInput, SortInput } from 'src/common/helper/dto/pagination-sort.dto';
import { FileUpload, GraphQLUpload } from 'graphql-upload-ts';
import { UserListResponse } from './entities/custom.entity';
import { UploadService } from 'src/upload/upload.service';
import { ObjectId } from 'mongodb';
import { UserFilterInput } from 'src/common/helper/filters/dto/user.filter';
import { DeleteUserArgs } from './dto/delete-user.input';
@Resolver(() => User)
export class UserResolver {
  constructor(private readonly userService: UserService, private readonly uploadService: UploadService) { }
  @Query(() => UserListResponse, { name: 'users' })
  @UseGuards(GqlAuthGuard, PermissionsGuard)
  @Permissions('root', 'read:all', 'read:user', 'admin')
  findAll(
    @Args('query', { nullable: true }) query?: UserFilterInput,
    @Args('sort', { type: () => [SortInput], nullable: true }) sort?: SortInput[],
    @Args('pagination', { nullable: true }) pagination?: PaginationInput,
  ) {
    return this.userService.findAll(query, sort, pagination);
  }

  @Query(() => User, { name: 'user' })
  findById(@Args('id', { type: () => String }) id: string) {
    return this.userService.findById(id);
  }
  @Query(() => User, { name: 'userBy' })
  findOne(@Args('query', { nullable: true }) query?: UserFilterInput) {
    return this.userService.findOne(query);
  }

  @Mutation(() => User)
  @UseGuards(GqlAuthGuard, PermissionsGuard)
  @Permissions('root', 'create:all', 'create:user', 'admin')
  async createUser(
    @Args('createUserInput') createUserInput: CreateUserInput,
    @Args({ name: 'file', type: () => GraphQLUpload, nullable: true }) file?: FileUpload,
  ) {
    let id: string | null = null;
    if (file) {
      const upload = await this.uploadService.uploadFile(file, {
        table: 'users',
        field: 'avatar',
        type: 'images',
        filename: file.filename,
      });
      id = upload._id;
    }
    createUserInput.avatar = id ? new ObjectId(id) : undefined;
    return this.userService.create(createUserInput);
  }
  @Mutation(() => User)
  @UseGuards(GqlAuthGuard, PermissionsGuard)
  @Permissions('root', 'update:all', 'update:user', 'admin')
  async updateUser(@Args('updateUserInput') updateUserInput: UpdateUserInput, @Args({ name: 'file', type: () => GraphQLUpload, nullable: true }) file?: FileUpload) {
    let id: string | null = null;
    if (file) {
      const upload = await this.uploadService.uploadFile(file, {
        table: 'users',
        field: 'avatar',
        type: 'images',
        filename: file.filename,
      });
      console.log('upload', upload);
      id = upload._id;
    }
    updateUserInput.avatar = id ? new ObjectId(id) : undefined;
    return this.userService.update(updateUserInput._id, updateUserInput);
  }

  @Mutation(() => User)
  deleteUser(@Args() args: DeleteUserArgs) {
    return this.userService.remove(args.id);
  }

}
