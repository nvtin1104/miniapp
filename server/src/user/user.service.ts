import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';
import { CreateUserInput } from './dto/create-user.input';
import { UpdateUserInput } from './dto/update-user.input';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './user.schema';
import { Model } from 'mongoose';
import { createBcryptHook } from 'src/common/hook/hash-password.hook';

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

  async findAll() {
    return this.userModel.find().exec();
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
