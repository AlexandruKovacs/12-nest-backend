import { BadRequestException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { User } from './entities/user.entity';
import { Model } from 'mongoose';

import * as bcrytjs from 'bcryptjs';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {

  constructor(
    @InjectModel( User.name ) 
    private userModel: Model<User>,

  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {

    try {

      const { password, ...userData } = createUserDto;
      
      const newUser = new this.userModel({
        password: bcrytjs.hashSync( password, 10 ),
        ...userData
      });

      await newUser.save();
      const { password:_, ...user } = newUser.toJSON();

      return user;

    } catch (error) {
      if( error.code === 11000 ) {
        throw new BadRequestException(`El email ${createUserDto.email} ya está registrado`);
      }

      throw new InternalServerErrorException('Error al registrar el usuario');
    }

  }

  findAll() {
    return `This action returns all auth`;
  }

  async login(loginDto: LoginDto) {

    const { email, password } = loginDto;

    // 1. Verificar que el email exista en la BD
    const user = await this.userModel.findOne({ email });

    if( !user ) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // 2. Verificar que el password sea correcto
    const isMatch = bcrytjs.compareSync( password, user.password );

    if( !isMatch ) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const { password:_, ...userWithoutPassword } = user.toJSON();

    return {
      user: userWithoutPassword,
      message: 'Login exitoso',
      token: 'ABC123',
    }

    // User -> email, password
    // Token -> JWT

  }

  findOne(id: number) {
    return `This action returns a #${id} auth`;
  }

  update(id: number, updateAuthDto: UpdateAuthDto) {
    return `This action updates a #${id} auth`;
  }

  remove(id: number) {
    return `This action removes a #${id} auth`;
  }
}
