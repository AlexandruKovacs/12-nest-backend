import { BadRequestException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { Model } from 'mongoose';

import { CreateUserDto, UpdateAuthDto, RegisterUserDto, LoginDto } from './dto/';

import { User } from './entities/user.entity';

import * as bcrytjs from 'bcryptjs';

import { JwtPayload } from './interfaces/jwt-payload.interface';
import { LoginResponse } from './interfaces/login-response.interface';

@Injectable()
export class AuthService {

  constructor(
    @InjectModel( User.name ) 
    private userModel: Model<User>,
    private jwtService: JwtService
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

  async register( registerUserDto: RegisterUserDto): Promise<LoginResponse> {

    const user = await this.create( registerUserDto );
    console.log({ user });

    return {
      user: user,
      token: this.getJwtToken({ id: user._id }),
    }
  }

  async login(loginDto: LoginDto): Promise<LoginResponse> {

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
      token: this.getJwtToken({ id: user.id }),
    }

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

  getJwtToken( payload: JwtPayload ) {
    const token = this.jwtService.sign( payload );
    return token;
  }


}
