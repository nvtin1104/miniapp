import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';
import { CreateUserInput } from './dto/create-user.input';
import { UpdateUserInput } from './dto/update-user.input';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './user.schema';
import { Model } from 'mongoose';
import { createBcryptHook } from 'src/common/hook/hash-password.hook';
import { buildMongoQuery } from 'src/common/helper/filters';
import { UserFilterInput } from 'src/common/helper/filters/dto/user.filter';
import { PaginationInput, SortInput } from 'src/common/helper/dto/pagination-sort.dto';

@Injectable()
export class UserService {
  constructor(
    private readonly configService: ConfigService,
    @InjectModel(User.name) private userModel: Model<UserDocument>
  ) { }
  async create(createUserDto: CreateUserInput) {
    try {
      const { hashPassword } = createBcryptHook(this.configService);
      const { password, ...rest } = createUserDto;
      const hashedPassword = await hashPassword(password);

      const user = await this.userModel.create({
        ...rest,
        password: hashedPassword,
      });
      return user;
    } catch (error) {
      throw error;
    }
  }

  async findAll(
    query?: UserFilterInput,
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
    const q = buildMongoQuery<UserFilterInput>(query || {});
    // Pagination
    const page = pagination?.page || 1;
    const limit = pagination?.limit || 10;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.userModel.find(q).populate('avatar').sort(sortQuery).skip(skip).limit(limit).exec(),
      this.userModel.countDocuments(q),
    ]);

    return {
      data,
      total,
      page,
      limit,
    };
  }
  findOne(query?: UserFilterInput) {
    let q: any = {};
    if (query) {
      q = buildMongoQuery<UserFilterInput>(query || {});
    }

    return this.userModel.findOne(q).populate('avatar').exec();
  }
  findById(id: string) {
    return this.userModel.findById(id).populate('avatar').exec();
  }
  findBy({
    key,
    value
  }): Promise<User | null> {
    return this.userModel.findOne({
      [key]: value
    }).exec();
  }

  update(id: string, updateUserInput: UpdateUserInput) {
    const { password, ...rest } = updateUserInput;
    const updateData: any = { ...rest };
    if (password) {
      const { hashPassword } = createBcryptHook(this.configService);
      return hashPassword(password).then((hashedPassword) => {
        updateData.password = hashedPassword;
        return this.userModel.findByIdAndUpdate(id, updateData, { new: true }).exec();
      });
    }

    return this.userModel.findByIdAndUpdate(id, updateData, { new: true }).exec();
  }

  async remove(id: string): Promise<User | null> {
    const deletedUser = await this.userModel.findByIdAndDelete(id).exec();

    if (!deletedUser) {
      throw new Error(`Không tìm thấy người dùng với ID: ${id}`);
    }

    return deletedUser;
  }

}
