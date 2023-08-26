import { IsEmail, IsString, MinLength } from "class-validator";

export class RegisterUserDto {

    @IsEmail()
    email: string;

    @MinLength(6)
    password: string;

    @IsString()
    name: string;

    @IsString()
    surname: string;

    @IsString()
    birthdate: string;

    @IsString()
    gender: string;

}
