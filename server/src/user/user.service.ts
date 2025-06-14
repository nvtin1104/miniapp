import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';
import { CreateUserInput } from './dto/create-user.input';
import { UpdateUserInput } from './dto/update-user.input';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './user.schema';
import { Model } from 'mongoose';
import { createBcryptHook } from 'src/common/hook/hash-password.hook';
import { FilterInput, PaginationInput, SortInput } from './dto/user-list-response.dto';

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
    filter?: FilterInput,
    sort?: SortInput[],
    pagination?: PaginationInput,
  ) {
    const query: any = {};

    if (filter && filter.fields.length && filter.conditions.length) {
      filter.fields.forEach((field, index) => {
        const condition = filter.conditions[index];
        const fieldQuery: any = {};

        if (condition.eqString !== undefined) fieldQuery.$eq = condition.eqString;
        if (condition.eqInt !== undefined) fieldQuery.$eq = condition.eqInt;
        if (condition.eqBoolean !== undefined) fieldQuery.$eq = condition.eqBoolean;

        if (condition.neString !== undefined) fieldQuery.$ne = condition.neString;
        if (condition.neInt !== undefined) fieldQuery.$ne = condition.neInt;
        if (condition.neBoolean !== undefined) fieldQuery.$ne = condition.neBoolean;

        if (condition.gt !== undefined) fieldQuery.$gt = condition.gt;
        if (condition.gte !== undefined) fieldQuery.$gte = condition.gte;
        if (condition.lt !== undefined) fieldQuery.$lt = condition.lt;
        if (condition.lte !== undefined) fieldQuery.$lte = condition.lte;

        if (condition.inStrings && condition.inStrings.length) fieldQuery.$in = condition.inStrings;
        if (condition.inInts && condition.inInts.length) fieldQuery.$in = condition.inInts;
        if (condition.ninStrings && condition.ninStrings.length) fieldQuery.$nin = condition.ninStrings;
        if (condition.ninInts && condition.ninInts.length) fieldQuery.$nin = condition.ninInts;

        if (condition.regex) fieldQuery.$regex = new RegExp(condition.regex, 'i');

        query[field] = fieldQuery;
      });
    }


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

    const [data, total] = await Promise.all([
      this.userModel.find(query).sort(sortQuery).skip(skip).limit(limit).exec(),
      this.userModel.countDocuments(query),
    ]);

    return {
      data,
      total,
      page,
      limit,
    };
  }
  findOne(id: number) {
    return `This action returns a #${id} user`;
  }
  findByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({
      email: email,
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
