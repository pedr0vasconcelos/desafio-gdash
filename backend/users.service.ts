import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './user.schema';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService implements OnModuleInit {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async onModuleInit() {
    // Cria usuário padrão se não existir
    const adminEmail = 'admin@example.com';
    const exists = await this.findOne(adminEmail);
    if (!exists) {
      console.log('Criando usuário padrão admin...');
      await this.create(adminEmail, '123456', 'Administrador');
    }
  }

  async findOne(email: string): Promise<UserDocument | undefined> {
    return this.userModel.findOne({ email }).exec();
  }

  async create(email: string, pass: string, name: string): Promise<User> {
    const salt = await bcrypt.genSalt();
    const password = await bcrypt.hash(pass, salt);
    const newUser = new this.userModel({ email, password, name });
    return newUser.save();
  }

  async findAll(): Promise<User[]> {
    return this.userModel.find({}, { password: 0 }).exec(); // Não retorna a senha
  }

  async update(id: string, data: any): Promise<User | null> {
    if (data.password) {
      const salt = await bcrypt.genSalt();
      data.password = await bcrypt.hash(data.password, salt);
    }
    return this.userModel.findByIdAndUpdate(id, data, { new: true }).exec();
  }

  async remove(id: string) {
    return this.userModel.findByIdAndDelete(id).exec();
  }
}