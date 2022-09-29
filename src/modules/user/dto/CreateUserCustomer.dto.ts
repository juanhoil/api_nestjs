import {ApiProperty} from "@nestjs/swagger";
import {IsNotEmpty, IsOptional, IsString, MaxLength, MinLength, IsEmail} from "class-validator";

export class CreateUserCustomerDto {
    @IsString()
    i_am: string;

    @IsString()
    looking_for: string;

    @IsString()
    @MaxLength(15)
    @IsNotEmpty()
    nick_name: string;

    @IsString()
    @IsEmail()
    @MaxLength(64)
    @IsNotEmpty()
    email: string;

    @IsString()
    @MinLength(8)
    @MaxLength(16)
    @IsNotEmpty()
    password: string;

    @IsOptional()
    born_date: Date;

    @IsString()
    @MaxLength(50)
    @IsOptional()
    country: string;

    @IsString()
    @MaxLength(50)
    @IsOptional()
    city: string;

    @IsNotEmpty()
    @IsNotEmpty()
    terms_and_conditions: boolean;

    @IsString()
    @MaxLength(400)
    @IsOptional()
    tracking:string
}